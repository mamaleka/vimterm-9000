import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKeyCapture } from './useKeyCapture'

function TestComponent({
  onKey,
  onArrowKey,
}: {
  onKey: (key: string) => void
  onArrowKey: () => void
}) {
  useKeyCapture({ onKey, onArrowKey })
  return <div>test</div>
}

function fireKey(key: string, options: KeyboardEventInit = {}) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
  })
}

describe('useKeyCapture', () => {
  let onKey: ReturnType<typeof vi.fn>
  let onArrowKey: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onKey = vi.fn()
    onArrowKey = vi.fn()
  })

  it('calls onKey with key string on keydown', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('h')
    expect(onKey).toHaveBeenCalledWith('h')
  })

  it('calls onKey for letter keys', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('j')
    fireKey('k')
    fireKey('l')
    expect(onKey).toHaveBeenCalledTimes(3)
  })

  it('does not call onKey for Ctrl+key (except C-o and C-i)', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('c', { ctrlKey: true })
    expect(onKey).not.toHaveBeenCalled()
  })

  it('does not call onKey for Alt+key', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('a', { altKey: true })
    expect(onKey).not.toHaveBeenCalled()
  })

  it('does not call onKey for Meta+key', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('s', { metaKey: true })
    expect(onKey).not.toHaveBeenCalled()
  })

  it('Ctrl-o produces <C-o>', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('o', { ctrlKey: true })
    expect(onKey).toHaveBeenCalledWith('<C-o>')
  })

  it('Ctrl-i produces <C-i>', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('i', { ctrlKey: true })
    expect(onKey).toHaveBeenCalledWith('<C-i>')
  })

  it('calls onArrowKey for ArrowLeft', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('ArrowLeft')
    expect(onArrowKey).toHaveBeenCalledTimes(1)
    expect(onKey).not.toHaveBeenCalled()
  })

  it('calls onArrowKey for ArrowRight', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('ArrowRight')
    expect(onArrowKey).toHaveBeenCalledTimes(1)
  })

  it('calls onArrowKey for ArrowUp', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('ArrowUp')
    expect(onArrowKey).toHaveBeenCalledTimes(1)
  })

  it('calls onArrowKey for ArrowDown', () => {
    render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    fireKey('ArrowDown')
    expect(onArrowKey).toHaveBeenCalledTimes(1)
  })

  it('removes listener on unmount', () => {
    const { unmount } = render(<TestComponent onKey={onKey} onArrowKey={onArrowKey} />)
    unmount()
    fireKey('h')
    expect(onKey).not.toHaveBeenCalled()
  })
})
