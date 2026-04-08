import pool from '../config/db.js'
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const xlsx = require('xlsx')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// GET /api/items — public
export async function getItems(req, res) {
  try {
    const [items] = await pool.query('SELECT * FROM items ORDER BY name ASC')

    const itemsWithDetails = await Promise.all(items.map(async (item) => {
      const [pallets] = await pool.query(
        'SELECT pallet_num AS num, qty FROM pallets WHERE item_id = ?',
        [item.id]
      )
      const [photos] = await pool.query(
        'SELECT id, filename FROM photos WHERE item_id = ? ORDER BY created_at ASC',
        [item.id]
      )
      return {
        id: item.id,
        name: item.name,
        totalQty: item.total_qty,
        category: item.category,
        notes: item.notes || '',
        pallets,
        photos: photos.map(p => ({
          id: p.id,
          url: `/uploads/${p.filename}`,
        })),
      }
    }))

    res.json(itemsWithDetails)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/items/import — admin only
export async function importItems(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  try {
    const workbook = xlsx.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 })

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      for (const row of rows) {
        if (!row[0] || !row[1]) continue

        const name = String(row[0]).trim()
        const totalQty = Number(row[1])
        const palletRaw = row[2] ? String(row[2]).trim() : ''
        const category = row[3] ? String(row[3]).trim() : 'Uncategorized'
        const notes = row[4] ? String(row[4]).trim() : ''
        

        // check if item already exists by name
        const [existing] = await conn.query(
          'SELECT id FROM items WHERE name = ?', [name]
        )

        let itemId

        if (existing.length > 0) {
          // update existing item — photos are preserved
          itemId = existing[0].id
          await conn.query(
            'UPDATE items SET total_qty = ?, category = ?, notes = ? WHERE id = ?',
            [totalQty, category, notes, itemId]
          )
        } else {
          // insert new item
          const [result] = await conn.query(
            'INSERT INTO items (name, total_qty, category, notes) VALUES (?, ?, ?, ?)',
            [name, totalQty, category, notes]
          )
          itemId = result.insertId
        }

        // always replace pallets since they may have changed
        await conn.query('DELETE FROM pallets WHERE item_id = ?', [itemId])

        if (palletRaw) {
          const pallets = parsePallets(palletRaw)
          for (const pallet of pallets) {
            await conn.query(
              'INSERT INTO pallets (item_id, pallet_num, qty) VALUES (?, ?, ?)',
              [itemId, pallet.num, pallet.qty]
            )
          }
        }
      }

      await conn.commit()
      res.json({ message: 'Import successful' })
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Import failed' })
  } finally {
    fs.unlink(req.file.path, () => {})
  }
}

// POST /api/items/:id/photo — admin only
export async function uploadPhoto(req, res) {
  const { id } = req.params
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO photos (item_id, filename) VALUES (?, ?)',
      [id, req.file.filename]
    )
    res.json({
      id: result.insertId,
      url: `/uploads/${req.file.filename}`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/items/:id/photo/:photoId — admin only
export async function deletePhoto(req, res) {
  const { photoId } = req.params

  try {
    const [rows] = await pool.query('SELECT filename FROM photos WHERE id = ?', [photoId])
    if (rows.length === 0) return res.status(404).json({ message: 'Photo not found' })

    const filename = rows[0].filename
    const filePath = path.join(__dirname, '../uploads', filename)
    fs.unlink(filePath, () => {})

    await pool.query('DELETE FROM photos WHERE id = ?', [photoId])
    res.json({ message: 'Photo deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

function parsePallets(palletString) {
  if (!palletString) return []
  return palletString
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .map(entry => {
      // matches P81(40) — pallet with quantity
      const withQty = entry.match(/^([A-Za-z]\d+)\((\d+)\)$/)
      if (withQty) {
        return { num: withQty[1], qty: Number(withQty[2]) }
      }
      // matches P81 — pallet without quantity
      const withoutQty = entry.match(/^([A-Za-z]\d+)$/)
      if (withoutQty) {
        return { num: withoutQty[1], qty: 0 }
      }
      return null
    })
    .filter(Boolean)
}