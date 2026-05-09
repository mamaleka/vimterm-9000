import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { EditorBuffer } from './EditorBuffer'

describe('EditorBuffer', () => {
  it('renders correct number of rows', () => {
    render(<EditorBuffer buffer={['hello', 'world']} />)
    const rows = document.querySelectorAll('[data-row]')
    const rowNums = new Set(Array.from(rows).map(el => el.getAttribute('data-row')))
    expect(rowNums.size).toBe(2)
  })

  it('renders correct characters with data-row and data-col', () => {
    render(<EditorBuffer buffer={['hi']} />)
    const h = document.querySelector('[data-row="0"][data-col="0"]')
    const i = document.querySelector('[data-row="0"][data-col="1"]')
    expect(h).not.toBeNull()
    expect(i).not.toBeNull()
    expect(h?.textContent).toBe('h')
    expect(i?.textContent).toBe('i')
  })

  it('target cell has data-target and amber class', () => {
    render(<EditorBuffer buffer={['hello']} targets={[{ row: 0, col: 1 }]} />)
    const cell = document.querySelector('[data-row="0"][data-col="1"]')
    expect(cell?.getAttribute('data-target')).toBe('true')
    expect(cell?.className).toContain('text-crt-amber')
  })

  it('enemy cell has data-enemy and red class', () => {
    render(<EditorBuffer buffer={['hello']} enemies={[{ row: 0, col: 2 }]} />)
    const cell = document.querySelector('[data-row="0"][data-col="2"]')
    expect(cell?.getAttribute('data-enemy')).toBe('true')
    expect(cell?.className).toContain('text-crt-red')
  })

  it('empty buffer renders without crashing', () => {
    const { container } = render(<EditorBuffer buffer={[]} />)
    expect(container).toBeTruthy()
  })

  it('renders correct number of characters for multi-character line', () => {
    render(<EditorBuffer buffer={['abc']} />)
    const chars = document.querySelectorAll('[data-row="0"]')
    expect(chars.length).toBe(3)
  })
})
