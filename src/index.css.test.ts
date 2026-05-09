import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'

describe('CRT color variables', () => {
  const css = readFileSync(resolve(__dirname, './index.css'), 'utf-8')

  const requiredVars = [
    '--color-bg',
    '--color-surface',
    '--color-border',
    '--color-text-dim',
    '--color-text',
    '--color-text-bright',
    '--color-amber',
    '--color-red',
    '--color-cursor',
  ]

  requiredVars.forEach((varName) => {
    it(`defines ${varName}`, () => {
      expect(css).toContain(varName)
    })
  })
})
