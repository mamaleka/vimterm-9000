import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { SpeedRun } from './SpeedRun'
import type { ChallengeDefinition } from '../../types/challenge'

const CHALLENGE_3WP: ChallengeDefinition = {
  id: 'test-speedrun-3wp',
  type: 'speedRun',
  initialBuffer: ['hello world'],
  initialCursor: { row: 0, col: 0 },
  successCondition: {
    type: 'allTargetsReached',
    targets: [
      { row: 0, col: 2 },
      { row: 0, col: 5 },
      { row: 0, col: 9 },
    ],
    inOrder: true,
  },
  allowedMotions: ['l'],
  parTime: 5000,
}

const CHALLENGE_2WP: ChallengeDefinition = {
  id: 'test-speedrun-2wp',
  type: 'speedRun',
  initialBuffer: ['hello world'],
  initialCursor: { row: 0, col: 0 },
  successCondition: {
    type: 'allTargetsReached',
    targets: [
      { row: 0, col: 2 },
      { row: 0, col: 5 },
    ],
    inOrder: true,
  },
  allowedMotions: ['l'],
  parTime: 5000,
}

describe('SpeedRun', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows only the first waypoint target initially', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    const firstTarget = document.querySelector('[data-row="0"][data-col="2"]')
    expect(firstTarget?.getAttribute('data-target')).toBe('true')

    const secondTarget = document.querySelector('[data-row="0"][data-col="5"]')
    expect(secondTarget?.getAttribute('data-target')).not.toBe('true')
  })

  it('shows waypoint counter as 1/N initially', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    expect(screen.getByTestId('waypoint-counter')).toHaveTextContent('1/3')
  })

  it('reaching first waypoint shows second waypoint', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    const secondTarget = document.querySelector('[data-row="0"][data-col="5"]')
    expect(secondTarget?.getAttribute('data-target')).toBe('true')

    const firstTarget = document.querySelector('[data-row="0"][data-col="2"]')
    expect(firstTarget?.getAttribute('data-target')).not.toBe('true')
  })

  it('updates waypoint counter after reaching first waypoint', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    expect(screen.getByTestId('waypoint-counter')).toHaveTextContent('2/3')
  })

  it('calls onSuccess when all waypoints reached', () => {
    const onSuccess = vi.fn()
    render(
      <SpeedRun
        challenge={CHALLENGE_2WP}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    // reach (0,2): press l twice
    act(() => {
      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    // reach (0,5): press l three more times
    act(() => {
      for (let i = 0; i < 3; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('passes keystroke count to onSuccess', () => {
    const onSuccess = vi.fn()
    render(
      <SpeedRun
        challenge={CHALLENGE_2WP}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    act(() => {
      for (let i = 0; i < 3; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    expect(onSuccess).toHaveBeenCalledWith(5, expect.any(Number))
  })

  it('passes elapsed time to onSuccess', () => {
    const onSuccess = vi.fn()
    render(
      <SpeedRun
        challenge={CHALLENGE_2WP}
        onSuccess={onSuccess}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    act(() => {
      for (let i = 0; i < 2; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    act(() => {
      for (let i = 0; i < 3; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    const [, timeArg] = onSuccess.mock.calls[0]
    expect(timeArg).toBeGreaterThanOrEqual(3000)
  })

  it('displays elapsed time element', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    expect(screen.getByTestId('elapsed-time')).toBeInTheDocument()
  })

  it('elapsed time turns red when elapsed > 2× parTime', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      vi.advanceTimersByTime(10001)
    })
    expect(screen.getByTestId('elapsed-time')).toHaveClass('text-crt-red')
  })

  it('elapsed time is not red before 2× parTime', () => {
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />
    )
    act(() => {
      vi.advanceTimersByTime(9999)
    })
    expect(screen.getByTestId('elapsed-time')).not.toHaveClass('text-crt-red')
  })

  it('arrow key triggers onArrowKeyPress', () => {
    const onArrowKeyPress = vi.fn()
    render(
      <SpeedRun
        challenge={CHALLENGE_3WP}
        onSuccess={vi.fn()}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowRight' })
    })
    expect(onArrowKeyPress).toHaveBeenCalled()
  })
})
