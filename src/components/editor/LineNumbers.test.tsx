import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LineNumbers } from './LineNumbers'

describe('LineNumbers', () => {
  it('renders correct count of line number elements', () => {
    const { container } = render(<LineNumbers lineCount={5} currentLine={0} />)
    const lineNums = container.querySelectorAll('[data-line-number]')
    expect(lineNums.length).toBe(5)
  })

  it('line numbers are 1-indexed', () => {
    const { container } = render(<LineNumbers lineCount={3} currentLine={0} />)
    const lineNums = container.querySelectorAll('[data-line-number]')
    expect(lineNums[0]?.textContent).toBe('1')
    expect(lineNums[1]?.textContent).toBe('2')
    expect(lineNums[2]?.textContent).toBe('3')
  })

  it('current line has highlighted class', () => {
    const { container } = render(<LineNumbers lineCount={3} currentLine={1} />)
    const lineNums = container.querySelectorAll('[data-line-number]')
    // line index 1 (0-based) = display line 2 = currentLine 1
    expect(lineNums[1]?.className).toContain('text-crt-bright')
    // others don't have bright class
    expect(lineNums[0]?.className).not.toContain('text-crt-bright')
  })
})
