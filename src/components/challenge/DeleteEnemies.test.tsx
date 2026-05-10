import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { DeleteEnemies } from './DeleteEnemies'
import type { ChallengeDefinition } from '../../types/challenge'

const ENEMY_BUFFER = ['[X] enemy here', 'some >><<  text', 'clean line']

const BASE_CHALLENGE: ChallengeDefinition = {
  id: 'test-delete-1',
  type: 'deleteEnemies',
  initialBuffer: ENEMY_BUFFER,
  initialCursor: { row: 0, col: 0 },
  successCondition: { type: 'allEnemiesDeleted' },
  allowedMotions: ['d', 'w', 'h', 'j', 'k', 'l'],
  parTime: 10000,
}

describe('DeleteEnemies', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders VimEditor with the initial buffer', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    // EditorBuffer renders spans with data-row/data-col
    const firstChar = document.querySelector('[data-row="0"][data-col="0"]')
    expect(firstChar).not.toBeNull()
  })

  it('displays enemy count label', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    // Should show some count representation, e.g. "ENEMIES: 2" or "2 enemies"
    const countEl = screen.getByTestId('enemy-count')
    expect(countEl).toBeTruthy()
  })

  it('enemy count reflects the number of enemy tokens in the initial buffer', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const countEl = screen.getByTestId('enemy-count')
    // ENEMY_BUFFER has [X] on line 0 and >><< on line 1 = 2 enemies
    expect(countEl.textContent).toContain('2')
  })

  it('shows zero enemies remaining when buffer has no enemy tokens', () => {
    const cleanChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: ['no enemies here', 'clean text'],
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={cleanChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const countEl = screen.getByTestId('enemy-count')
    expect(countEl.textContent).toContain('0')
  })

  it('onSuccess is not called when enemies remain', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('onSuccess is called when all enemy tokens are deleted from buffer', () => {
    const cleanChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: ['clean line only'],
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={cleanChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    // Since no enemies exist from the start, success should fire on mount
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('onSuccess receives keystroke count and elapsed time', () => {
    const cleanChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: ['clean line only'],
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={cleanChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    expect(onSuccess).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
  })

  it('onSuccess fires only once even if state changes multiple times with no enemies', () => {
    const cleanChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: ['clean line'],
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={cleanChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    act(() => {
      fireEvent.keyDown(document, { key: 'l' })
    })
    act(() => {
      fireEvent.keyDown(document, { key: 'l' })
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('arrow key press triggers onArrowKeyPress callback', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowRight' })
    })
    expect(onArrowKeyPress).toHaveBeenCalledTimes(1)
  })

  it('enemy count label uses red styling', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <DeleteEnemies
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const countEl = screen.getByTestId('enemy-count')
    // Should have a class or inline style indicating red color
    const classes = countEl.className
    // Accepts text-crt-red or text-[var(--color-red)] or similar
    expect(classes).toMatch(/red|crt-red/)
  })
})
