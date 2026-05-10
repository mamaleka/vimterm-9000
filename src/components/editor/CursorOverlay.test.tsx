import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { CursorOverlay, BLINK_INTERVAL_MS } from './CursorOverlay'
import type { Position, VimMode } from '../../types/vim'

describe('CursorOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when cursor is null', () => {
    const { container } = render(<CursorOverlay cursor={null} mode="normal" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a cursor element when cursor is provided', () => {
    const cursor: Position = { row: 2, col: 5 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="normal" />)
    const el = container.querySelector('[data-testid="cursor-overlay"]')
    expect(el).not.toBeNull()
  })

  it('applies data-mode attribute reflecting the current mode', () => {
    const cursor: Position = { row: 0, col: 0 }
    const modes: VimMode[] = ['normal', 'insert', 'visual', 'command']
    for (const mode of modes) {
      const { container, unmount } = render(<CursorOverlay cursor={cursor} mode={mode} />)
      const el = container.querySelector('[data-testid="cursor-overlay"]')
      expect(el?.getAttribute('data-mode')).toBe(mode)
      unmount()
    }
  })

  it('uses absolute positioning', () => {
    const cursor: Position = { row: 1, col: 3 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="normal" />)
    const el = container.querySelector('[data-testid="cursor-overlay"]') as HTMLElement | null
    expect(el).not.toBeNull()
    expect(el?.className).toContain('absolute')
  })

  it('blink interval constant is 530ms', () => {
    expect(BLINK_INTERVAL_MS).toBe(530)
  })

  it('cursor starts visible (not hidden) on mount', () => {
    const cursor: Position = { row: 0, col: 0 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="normal" />)
    const el = container.querySelector('[data-testid="cursor-overlay"]')
    // On mount the cursor should be visible — it should not have an opacity-0 class
    expect(el?.className).not.toContain('opacity-0')
  })

  it('cursor toggles visibility after one blink interval', () => {
    const cursor: Position = { row: 0, col: 0 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="normal" />)
    const el = container.querySelector('[data-testid="cursor-overlay"]')
    expect(el?.className).not.toContain('opacity-0')

    act(() => {
      vi.advanceTimersByTime(BLINK_INTERVAL_MS)
    })

    const elAfter = container.querySelector('[data-testid="cursor-overlay"]')
    expect(elAfter?.className).toContain('opacity-0')
  })

  it('cursor toggles back to visible after two blink intervals', () => {
    const cursor: Position = { row: 0, col: 0 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="normal" />)

    act(() => {
      vi.advanceTimersByTime(BLINK_INTERVAL_MS * 2)
    })

    const el = container.querySelector('[data-testid="cursor-overlay"]')
    expect(el?.className).not.toContain('opacity-0')
  })

  it('cleans up interval on unmount (no interval still running)', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const cursor: Position = { row: 0, col: 0 }
    const { unmount } = render(<CursorOverlay cursor={cursor} mode="normal" />)
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('snapshot — renders cursor element in normal mode', () => {
    const cursor: Position = { row: 3, col: 7 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="normal" />)
    const el = container.querySelector('[data-testid="cursor-overlay"]')
    expect(el).toMatchSnapshot()
  })

  it('snapshot — renders cursor element in insert mode', () => {
    const cursor: Position = { row: 0, col: 0 }
    const { container } = render(<CursorOverlay cursor={cursor} mode="insert" />)
    const el = container.querySelector('[data-testid="cursor-overlay"]')
    expect(el).toMatchSnapshot()
  })
})
