import pool from '../config/db.js'
import * as xlsx from 'xlsx'
import fs from 'fs'

// GET /api/items — public
export async function getItems(req, res) {
  try {
    const [items] = await pool.query('SELECT * FROM items ORDER BY name ASC')

    // fetch pallets for each item
    const itemsWithPallets = await Promise.all(items.map(async (item) => {
      const [pallets] = await pool.query(
        'SELECT pallet_num AS num, qty FROM pallets WHERE item_id = ?',
        [item.id]
      )
      return {
        id: item.id,
        name: item.name,
        totalQty: item.total_qty,
        category: item.category,
        photo: item.photo,
        pallets,
      }
    }))

    res.json(itemsWithPallets)
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

      // Clear existing data
      await conn.query('DELETE FROM pallets')
      await conn.query('DELETE FROM items')

      for (const row of rows) {
        if (!row[0] || !row[1]) continue

        const name = String(row[0]).trim()
        const totalQty = Number(row[1])
        const palletRaw = row[2] ? String(row[2]).trim() : ''
        const category = row[3] ? String(row[3]).trim() : 'Uncategorized'

        const [result] = await conn.query(
          'INSERT INTO items (name, total_qty, category) VALUES (?, ?, ?)',
          [name, totalQty, category]
        )

        const itemId = result.insertId

        // parse and insert pallets
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
    // clean up uploaded temp file
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
    const photoPath = `/uploads/${req.file.filename}`
    await pool.query('UPDATE items SET photo = ? WHERE id = ?', [photoPath, id])
    res.json({ photo: photoPath })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/items/:id/photo — admin only
export async function deletePhoto(req, res) {
  const { id } = req.params

  try {
    const [rows] = await pool.query('SELECT photo FROM items WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Item not found' })

    const photoPath = rows[0].photo
    if (photoPath) {
      const filePath = `.${photoPath}`
      fs.unlink(filePath, () => {})
    }

    await pool.query('UPDATE items SET photo = NULL WHERE id = ?', [id])
    res.json({ message: 'Photo deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// helper — same logic as frontend parser
function parsePallets(palletString) {
  if (!palletString) return []
  return palletString
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .map(entry => {
      const match = entry.match(/^(\S+)\((\d+)\)$/)
      if (!match) return null
      return { num: match[1], qty: Number(match[2]) }
    })
    .filter(Boolean)
}