import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatusBar } from './StatusBar'

describe('StatusBar', () => {
  it('displays NORMAL mode', () => {
    const { getByText } = render(<StatusBar mode="normal" cursor={{ row: 0, col: 0 }} />)
    expect(getByText('NORMAL')).toBeTruthy()
  })

  it('displays -- INSERT -- mode', () => {
    const { getByText } = render(<StatusBar mode="insert" cursor={{ row: 0, col: 0 }} />)
    expect(getByText('-- INSERT --')).toBeTruthy()
  })

  it('displays VISUAL mode', () => {
    const { getByText } = render(<StatusBar mode="visual" cursor={{ row: 0, col: 0 }} />)
    expect(getByText('VISUAL')).toBeTruthy()
  })

  it('displays COMMAND mode', () => {
    const { getByText } = render(<StatusBar mode="command" cursor={{ row: 0, col: 0 }} />)
    expect(getByText('COMMAND')).toBeTruthy()
  })

  it('displays row:col 1-indexed', () => {
    const { getByText } = render(<StatusBar mode="normal" cursor={{ row: 2, col: 4 }} />)
    expect(getByText('3:5')).toBeTruthy()
  })

  it('displays file name when provided', () => {
    const { getByText } = render(<StatusBar mode="normal" cursor={{ row: 0, col: 0 }} fileName="lesson.txt" />)
    expect(getByText('lesson.txt')).toBeTruthy()
  })
})
