import { describe, it, expect } from 'vitest'
import { parsePallets } from '../utils/excelParser'

describe('parsePallets', () => {

  it('parses a single pallet entry', () => {
    const result = parsePallets('P12(40)')
    expect(result).toEqual([{ num: 'P12', qty: 40 }])
  })

  it('parses multiple pallet entries', () => {
    const result = parsePallets('P12(40), P7(60), P3(50)')
    expect(result).toEqual([
      { num: 'P12', qty: 40 },
      { num: 'P7',  qty: 60 },
      { num: 'P3',  qty: 50 },
    ])
  })

  it('handles extra spaces between entries', () => {
    const result = parsePallets('P1(10),  P2(20)')
    expect(result).toEqual([
      { num: 'P1', qty: 10 },
      { num: 'P2', qty: 20 },
    ])
  })

  it('returns empty array for empty string', () => {
    expect(parsePallets('')).toEqual([])
  })

  it('returns empty array for null/undefined', () => {
    expect(parsePallets(null)).toEqual([])
    expect(parsePallets(undefined)).toEqual([])
  })

  it('skips malformed entries', () => {
    const result = parsePallets('P12(40), BADENTRY, P3(50)')
    expect(result).toEqual([
      { num: 'P12', qty: 40 },
      { num: 'P3',  qty: 50 },
    ])
  })

})