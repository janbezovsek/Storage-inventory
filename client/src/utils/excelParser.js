export function parseExcelToItems(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // Dynamically import xlsx
        import('xlsx').then(({ read, utils }) => {
          const workbook = read(e.target.result, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const rows = utils.sheet_to_json(sheet, { header: 1 })

          const items = rows
            .filter(row => row[0] && row[1]) // skip empty rows
            .map((row, index) => {
              const name = String(row[0]).trim()
              const totalQty = Number(row[1])
              const palletRaw = row[2] ? String(row[2]).trim() : ''
              const pallets = parsePallets(palletRaw)

              return {
                id: index + 1,
                name,
                totalQty,
                pallets,
                photo: null,
              }
            })

          resolve(items)
        })
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Parses "P12(40), P7(60), P3(50)" into
// [{ num: 'P12', qty: 40 }, { num: 'P7', qty: 60 }, { num: 'P3', qty: 50 }]
export function parsePallets(palletString) {
  if (!palletString) return []

  return palletString
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const match = entry.match(/^(\S+)\((\d+)\)$/)
      if (!match) return null
      return {
        num: match[1],
        qty: Number(match[2]),
      }
    })
    .filter(Boolean)
}