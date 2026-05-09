import { describe, it, expect } from 'vitest'
import { parseMotion } from './motionParser'

describe('parseMotion', () => {
  it('parses simple motion h', () => {
    expect(parseMotion(['h'])).toEqual({ count: 1, motion: 'h', operator: null, char: null })
  })

  it('parses simple motion l', () => {
    expect(parseMotion(['l'])).toEqual({ count: 1, motion: 'l', operator: null, char: null })
  })

  it('parses simple motion j', () => {
    expect(parseMotion(['j'])).toEqual({ count: 1, motion: 'j', operator: null, char: null })
  })

  it('parses simple motion k', () => {
    expect(parseMotion(['k'])).toEqual({ count: 1, motion: 'k', operator: null, char: null })
  })

  it('parses count + motion: 3w', () => {
    expect(parseMotion(['3', 'w'])).toEqual({ count: 3, motion: 'w', operator: null, char: null })
  })

  it('parses count + motion: 10j', () => {
    expect(parseMotion(['1', '0', 'j'])).toEqual({ count: 10, motion: 'j', operator: null, char: null })
  })

  it('parses operator + motion: dw', () => {
    expect(parseMotion(['d', 'w'])).toEqual({ count: 1, motion: 'w', operator: 'd', char: null })
  })

  it('parses count + operator + count + motion: 2d3w → count 6', () => {
    expect(parseMotion(['2', 'd', '3', 'w'])).toEqual({ count: 6, motion: 'w', operator: 'd', char: null })
  })

  it('parses find motion: fx', () => {
    expect(parseMotion(['f', 'x'])).toEqual({ count: 1, motion: 'f', operator: null, char: 'x' })
  })

  it('parses find motion with count: 2fa', () => {
    expect(parseMotion(['2', 'f', 'a'])).toEqual({ count: 2, motion: 'f', operator: null, char: 'a' })
  })

  it('parses t motion: tx', () => {
    expect(parseMotion(['t', 'x'])).toEqual({ count: 1, motion: 't', operator: null, char: 'x' })
  })

  it('parses F motion: Fx', () => {
    expect(parseMotion(['F', 'x'])).toEqual({ count: 1, motion: 'F', operator: null, char: 'x' })
  })

  it('parses T motion: Tx', () => {
    expect(parseMotion(['T', 'x'])).toEqual({ count: 1, motion: 'T', operator: null, char: 'x' })
  })

  it('returns null for incomplete: just d operator', () => {
    expect(parseMotion(['d'])).toBeNull()
  })

  it('returns null for incomplete: just digit', () => {
    expect(parseMotion(['3'])).toBeNull()
  })

  it('returns null for incomplete: f without char', () => {
    expect(parseMotion(['f'])).toBeNull()
  })

  it('returns null for unknown key', () => {
    expect(parseMotion(['z'])).toBeNull()
  })

  it('returns null for empty buffer', () => {
    expect(parseMotion([])).toBeNull()
  })

  it('parses gg motion', () => {
    expect(parseMotion(['g', 'g'])).toEqual({ count: 1, motion: 'gg', operator: null, char: null })
  })

  it('returns null for incomplete g', () => {
    expect(parseMotion(['g'])).toBeNull()
  })

  it('parses G motion', () => {
    expect(parseMotion(['G'])).toEqual({ count: 1, motion: 'G', operator: null, char: null })
  })

  it('parses word motions w b e', () => {
    expect(parseMotion(['w'])).toEqual({ count: 1, motion: 'w', operator: null, char: null })
    expect(parseMotion(['b'])).toEqual({ count: 1, motion: 'b', operator: null, char: null })
    expect(parseMotion(['e'])).toEqual({ count: 1, motion: 'e', operator: null, char: null })
  })

  it('parses line motions 0 ^ $', () => {
    expect(parseMotion(['0'])).toEqual({ count: 1, motion: '0', operator: null, char: null })
    expect(parseMotion(['^'])).toEqual({ count: 1, motion: '^', operator: null, char: null })
    expect(parseMotion(['$'])).toEqual({ count: 1, motion: '$', operator: null, char: null })
  })

  it('parses ; and , repeat-find motions', () => {
    expect(parseMotion([';'])).toEqual({ count: 1, motion: ';', operator: null, char: null })
    expect(parseMotion([','])).toEqual({ count: 1, motion: ',', operator: null, char: null })
  })
})
