import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KeyHistoryDisplay } from './KeyHistoryDisplay'

describe('KeyHistoryDisplay', () => {
  it('renders empty state when keys array is empty', () => {
    const { container } = render(<KeyHistoryDisplay keys={[]} />)
    expect(container.firstChild).toBeInTheDocument()
    // no key items rendered
    expect(screen.queryAllByTestId('key-item')).toHaveLength(0)
  })

  it('renders all keys when count is within maxDisplay', () => {
    render(<KeyHistoryDisplay keys={['h', 'j', 'k', 'l']} />)
    expect(screen.getAllByTestId('key-item')).toHaveLength(4)
  })

  it('shows last N keys when keys exceed maxDisplay', () => {
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
    render(<KeyHistoryDisplay keys={keys} maxDisplay={10} />)
    const items = screen.getAllByTestId('key-item')
    expect(items).toHaveLength(10)
    // last 10 keys: c through l
    expect(items[0].textContent).toBe('c')
    expect(items[9].textContent).toBe('l')
  })

  it('uses default maxDisplay of 10', () => {
    const keys = Array.from({ length: 15 }, (_, i) => String(i))
    render(<KeyHistoryDisplay keys={keys} />)
    const items = screen.getAllByTestId('key-item')
    expect(items).toHaveLength(10)
  })

  it('makes most recent key visually distinct with brighter class', () => {
    render(<KeyHistoryDisplay keys={['h', 'j', 'k']} />)
    const items = screen.getAllByTestId('key-item')
    // last item (most recent) is brighter
    expect(items[items.length - 1].className).toContain('text-crt-bright')
    // earlier items use dim class
    expect(items[0].className).toContain('text-crt-dim')
  })

  it('renders single key correctly', () => {
    render(<KeyHistoryDisplay keys={['w']} />)
    const items = screen.getAllByTestId('key-item')
    expect(items).toHaveLength(1)
    expect(items[0].textContent).toBe('w')
    // sole key is also the most recent, should be bright
    expect(items[0].className).toContain('text-crt-bright')
  })

  it('respects custom maxDisplay prop', () => {
    render(<KeyHistoryDisplay keys={['a', 'b', 'c', 'd', 'e']} maxDisplay={3} />)
    const items = screen.getAllByTestId('key-item')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('c')
    expect(items[2].textContent).toBe('e')
  })
})
