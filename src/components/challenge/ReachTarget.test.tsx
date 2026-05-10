import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, fireEvent } from '@testing-library/react'
import { ReachTarget } from './ReachTarget'
import type { ChallengeDefinition } from '../../types/challenge'

const CHALLENGE_CURSOR_AT: ChallengeDefinition = {
  id: 'test-cursor-at',
  type: 'reachTarget',
  initialBuffer: ['hello world', 'foo bar baz'],
  initialCursor: { row: 0, col: 0 },
  successCondition: { type: 'cursorAt', position: { row: 0, col: 5 } },
  allowedMotions: ['h', 'j', 'k', 'l'],
  parTime: 5000,
}

const CHALLENGE_ALL_TARGETS: ChallengeDefinition = {
  id: 'test-all-targets',
  type: 'reachTarget',
  initialBuffer: ['hello world'],
  initialCursor: { row: 0, col: 0 },
  successCondition: {
    type: 'allTargetsReached',
    targets: [{ row: 0, col: 3 }, { row: 0, col: 7 }],
    inOrder: false,
  },
  allowedMotions: ['h', 'j', 'k', 'l'],
  parTime: 5000,
}

describe('ReachTarget', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders VimEditor with target cells highlighted (data-target="true") for cursorAt condition', () => {
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    const targetCell = document.querySelector('[data-row="0"][data-col="5"]')
    expect(targetCell).not.toBeNull()
    expect(targetCell?.getAttribute('data-target')).toBe('true')
  })

  it('renders VimEditor with target cells highlighted for allTargetsReached condition', () => {
    render(
      <ReachTarget
        challenge={CHALLENGE_ALL_TARGETS}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    const cell1 = document.querySelector('[data-row="0"][data-col="3"]')
    const cell2 = document.querySelector('[data-row="0"][data-col="7"]')
    expect(cell1?.getAttribute('data-target')).toBe('true')
    expect(cell2?.getAttribute('data-target')).toBe('true')
  })

  it('onSuccess not called before target reached', () => {
    const onSuccess = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    // cursor starts at (0,0), target is (0,5) — pressing l only once shouldn't succeed
    act(() => {
      fireEvent.keyDown(document, { key: 'l' })
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('onSuccess called when cursor reaches target position', () => {
    const onSuccess = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    // Move right 5 times to reach col 5
    act(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('passes keystroke count to onSuccess', () => {
    const onSuccess = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    expect(onSuccess).toHaveBeenCalledWith(5, expect.any(Number))
  })

  it('passes elapsed time (ms) to onSuccess using fake timers', () => {
    const onSuccess = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    // Advance time by 2000ms before reaching the target
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    const [, timeMs] = onSuccess.mock.calls[0] as [number, number]
    expect(timeMs).toBeGreaterThanOrEqual(2000)
  })

  it('does not call onSuccess multiple times once latched', () => {
    const onSuccess = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    // Move to target
    act(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    // Move away and back
    act(() => {
      fireEvent.keyDown(document, { key: 'h' })
    })
    act(() => {
      fireEvent.keyDown(document, { key: 'l' })
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('arrow key triggers onArrowKeyPress', () => {
    const onArrowKeyPress = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={vi.fn()}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowRight' })
    })
    expect(onArrowKeyPress).toHaveBeenCalledTimes(1)
  })

  it('arrow key left also triggers onArrowKeyPress', () => {
    const onArrowKeyPress = vi.fn()
    render(
      <ReachTarget
        challenge={CHALLENGE_CURSOR_AT}
        onSuccess={vi.fn()}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
    })
    expect(onArrowKeyPress).toHaveBeenCalledTimes(1)
  })
})
