import { describe, it, expect } from 'vitest'
import { parsePallets } from '../utils/excelParser'

describe('parsePallets', () => {

  it('parses a single pallet entry', () => {
    expect(parsePallets('P12(40)')).toEqual([{ num: 'P12', qty: 40 }])
  })

  it('parses multiple pallet entries', () => {
    expect(parsePallets('P12(40), P7(60), P3(50)')).toEqual([
      { num: 'P12', qty: 40 },
      { num: 'P7',  qty: 60 },
      { num: 'P3',  qty: 50 },
    ])
  })

  it('handles extra spaces between entries', () => {
    expect(parsePallets('P1(10),  P2(20)')).toEqual([
      { num: 'P1', qty: 10 },
      { num: 'P2', qty: 20 },
    ])
  })

  it('returns empty array for empty string', () => {
    expect(parsePallets('')).toEqual([])
  })

  it('returns empty array for null', () => {
    expect(parsePallets(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(parsePallets(undefined)).toEqual([])
  })

  it('skips malformed entries', () => {
    expect(parsePallets('P12(40), BADENTRY, P3(50)')).toEqual([
      { num: 'P12', qty: 40 },
      { num: 'P3',  qty: 50 },
    ])
  })

  it('handles large quantity numbers', () => {
    expect(parsePallets('P1(2400)')).toEqual([{ num: 'P1', qty: 2400 }])
  })

  it('handles single digit pallet numbers', () => {
    expect(parsePallets('P1(10)')).toEqual([{ num: 'P1', qty: 10 }])
  })

  it('handles double digit pallet numbers', () => {
    expect(parsePallets('P12(10)')).toEqual([{ num: 'P12', qty: 10 }])
  })

  it('handles pallet without quantity', () => {
  expect(parsePallets('P81')).toEqual([{ num: 'P81', qty: 0 }])
})

it('handles mix of pallets with and without quantity', () => {
  expect(parsePallets('P81, P12(40)')).toEqual([
    { num: 'P81', qty: 0 },
    { num: 'P12', qty: 40 },
  ])
})

})