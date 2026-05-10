import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { VimEditor } from './VimEditor'

const BUFFER = ['hello world', 'foo bar baz']

describe('VimEditor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the EditorBuffer with the initial buffer content', () => {
    render(<VimEditor initialBuffer={BUFFER} />)
    const h = document.querySelector('[data-row="0"][data-col="0"]')
    expect(h).not.toBeNull()
    expect(h?.textContent).toBe('h')
  })

  it('renders line numbers', () => {
    render(<VimEditor initialBuffer={BUFFER} />)
    const lineOne = document.querySelector('[data-line-number="1"]')
    const lineTwo = document.querySelector('[data-line-number="2"]')
    expect(lineOne).not.toBeNull()
    expect(lineTwo).not.toBeNull()
  })

  it('renders the cursor overlay', () => {
    render(<VimEditor initialBuffer={BUFFER} />)
    const cursor = document.querySelector('[data-testid="cursor-overlay"]')
    expect(cursor).not.toBeNull()
  })

  it('renders the status bar showing NORMAL mode', () => {
    render(<VimEditor initialBuffer={BUFFER} />)
    expect(screen.getByText('NORMAL')).toBeTruthy()
  })

  it('renders file name in status bar when fileName prop provided', () => {
    render(<VimEditor initialBuffer={BUFFER} fileName="lesson.txt" />)
    expect(screen.getByText('lesson.txt')).toBeTruthy()
  })

  it('initialBuffer sets up buffer content correctly', () => {
    render(<VimEditor initialBuffer={['vim is cool']} />)
    const v = document.querySelector('[data-row="0"][data-col="0"]')
    expect(v?.textContent).toBe('v')
    expect(document.querySelector('[data-line-number="1"]')).not.toBeNull()
    expect(document.querySelector('[data-line-number="2"]')).toBeNull()
  })

  it('target cells are rendered with data-target attribute', () => {
    render(<VimEditor initialBuffer={BUFFER} targets={[{ row: 0, col: 1 }]} />)
    const cell = document.querySelector('[data-row="0"][data-col="1"]')
    expect(cell?.getAttribute('data-target')).toBe('true')
  })

  it('enemy cells are rendered with data-enemy attribute', () => {
    render(<VimEditor initialBuffer={BUFFER} enemies={[{ row: 1, col: 0 }]} />)
    const cell = document.querySelector('[data-row="1"][data-col="0"]')
    expect(cell?.getAttribute('data-enemy')).toBe('true')
  })

  it('pressing l key moves cursor right and status bar updates position', () => {
    render(<VimEditor initialBuffer={BUFFER} />)

    expect(screen.getByText('1:1')).toBeTruthy()

    act(() => {
      fireEvent.keyDown(document, { key: 'l' })
    })

    expect(screen.getByText('1:2')).toBeTruthy()
  })

  it('pressing j key moves cursor down', () => {
    render(<VimEditor initialBuffer={BUFFER} />)

    act(() => {
      fireEvent.keyDown(document, { key: 'j' })
    })

    expect(screen.getByText('2:1')).toBeTruthy()
  })

  it('arrow key press triggers onArrowKey callback', () => {
    const onArrowKey = vi.fn()
    render(<VimEditor initialBuffer={BUFFER} onArrowKey={onArrowKey} />)

    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowRight' })
    })

    expect(onArrowKey).toHaveBeenCalledTimes(1)
  })

  it('arrow key does not trigger multiple onArrowKey calls for a single press', () => {
    const onArrowKey = vi.fn()
    render(<VimEditor initialBuffer={BUFFER} onArrowKey={onArrowKey} />)

    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowUp' })
    })

    expect(onArrowKey).toHaveBeenCalledTimes(1)
  })

  it('onStateChange callback is called when state changes', () => {
    const onStateChange = vi.fn()
    render(<VimEditor initialBuffer={BUFFER} onStateChange={onStateChange} />)

    act(() => {
      fireEvent.keyDown(document, { key: 'l' })
    })

    expect(onStateChange).toHaveBeenCalled()
    const lastCallArg = onStateChange.mock.calls[onStateChange.mock.calls.length - 1][0]
    expect(lastCallArg.cursor.col).toBe(1)
  })

  it('onStateChange is not required (renders without it)', () => {
    expect(() => render(<VimEditor initialBuffer={BUFFER} />)).not.toThrow()
  })
})
