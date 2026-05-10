import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { BossStage } from './BossStage'
import type { ChallengeDefinition } from '../../types/challenge'

const SIMPLE_CHALLENGE: ChallengeDefinition = {
  id: 'boss-test-stage',
  type: 'bossStage',
  initialBuffer: ['hello'],
  initialCursor: { row: 0, col: 0 },
  successCondition: { type: 'cursorAt', position: { row: 0, col: 4 } },
  allowedMotions: ['l', 'h'],
  parTime: 30,
}

describe('BossStage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with data-testid="boss-stage"', () => {
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={30}
        onStageCleared={vi.fn()}
        onHeartLost={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />,
    )
    expect(screen.getByTestId('boss-stage')).toBeInTheDocument()
  })

  it('renders timer with data-testid="boss-timer" and initial value', () => {
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={10}
        onStageCleared={vi.fn()}
        onHeartLost={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />,
    )
    const timer = screen.getByTestId('boss-timer')
    expect(timer).toBeInTheDocument()
    expect(timer.textContent).toContain('10')
  })

  it('timer counts down each second', () => {
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={10}
        onStageCleared={vi.fn()}
        onHeartLost={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    const timer = screen.getByTestId('boss-timer')
    expect(timer.textContent).toContain('9')
  })

  it('calls onHeartLost when timer reaches 0', () => {
    const onHeartLost = vi.fn()
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={3}
        onStageCleared={vi.fn()}
        onHeartLost={onHeartLost}
        onArrowKeyPress={vi.fn()}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onHeartLost).toHaveBeenCalledTimes(1)
  })

  it('timer turns red when remaining < 30% of timeLimit', () => {
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={10}
        onStageCleared={vi.fn()}
        onHeartLost={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />,
    )
    // Advance 8 seconds: 10 - 8 = 2 remaining, 2/10 = 20% < 30%
    act(() => {
      vi.advanceTimersByTime(8000)
    })
    const timer = screen.getByTestId('boss-timer')
    expect(timer).toHaveClass('text-crt-red')
  })

  it('timer is not red when remaining >= 30% of timeLimit', () => {
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={10}
        onStageCleared={vi.fn()}
        onHeartLost={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />,
    )
    // Advance 5 seconds: 10 - 5 = 5 remaining, 5/10 = 50% > 30%
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    const timer = screen.getByTestId('boss-timer')
    expect(timer).not.toHaveClass('text-crt-red')
  })

  it('calls onHeartLost after 5 wrong keystrokes', () => {
    const onHeartLost = vi.fn()
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={30}
        onStageCleared={vi.fn()}
        onHeartLost={onHeartLost}
        onArrowKeyPress={vi.fn()}
      />,
    )
    // 'x' is not in allowedMotions ['l', 'h']
    act(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(document, { key: 'x' })
      }
    })
    expect(onHeartLost).toHaveBeenCalledTimes(1)
  })

  it('does not call onHeartLost after fewer than 5 wrong keystrokes', () => {
    const onHeartLost = vi.fn()
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={30}
        onStageCleared={vi.fn()}
        onHeartLost={onHeartLost}
        onArrowKeyPress={vi.fn()}
      />,
    )
    act(() => {
      for (let i = 0; i < 4; i++) {
        fireEvent.keyDown(document, { key: 'x' })
      }
    })
    expect(onHeartLost).not.toHaveBeenCalled()
  })

  it('calls onStageCleared when challenge is completed', () => {
    const onStageCleared = vi.fn()
    render(
      <BossStage
        challenge={SIMPLE_CHALLENGE}
        timeLimit={30}
        onStageCleared={onStageCleared}
        onHeartLost={vi.fn()}
        onArrowKeyPress={vi.fn()}
      />,
    )
    // 'hello' has 5 chars; cursor starts at (0,0), target is (0,4)
    // Press 'l' 4 times to reach col 4
    act(() => {
      for (let i = 0; i < 4; i++) {
        fireEvent.keyDown(document, { key: 'l' })
      }
    })
    expect(onStageCleared).toHaveBeenCalledTimes(1)
  })
})
