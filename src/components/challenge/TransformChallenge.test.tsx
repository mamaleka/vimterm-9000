import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { TransformChallenge } from './TransformChallenge'
import type { ChallengeDefinition } from '../../types/challenge'

const BEFORE_BUFFER = ['hello world', 'foo bar baz']
const AFTER_BUFFER = ['hello vim', 'foo bar baz']

const BASE_CHALLENGE: ChallengeDefinition = {
  id: 'test-transform-1',
  type: 'transform',
  initialBuffer: BEFORE_BUFFER,
  initialCursor: { row: 0, col: 0 },
  successCondition: { type: 'bufferEquals', expected: AFTER_BUFFER },
  allowedMotions: ['d', 'c', 'w', 'h', 'j', 'k', 'l', 'i'],
  parTime: 15000,
}

describe('TransformChallenge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders VimEditor with the initial "before" buffer', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const firstChar = document.querySelector('[data-row="0"][data-col="0"]')
    expect(firstChar).not.toBeNull()
  })

  it('renders the "after" reference panel showing expected lines', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const afterPanel = screen.getByTestId('after-panel')
    expect(afterPanel).toBeTruthy()
    expect(afterPanel.textContent).toContain('hello vim')
  })

  it('shows "before" and "after" panels side by side', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const beforePanel = screen.getByTestId('before-panel')
    const afterPanel = screen.getByTestId('after-panel')
    expect(beforePanel).toBeTruthy()
    expect(afterPanel).toBeTruthy()
  })

  it('shows diff indicator with count of differing lines', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const diffEl = screen.getByTestId('diff-indicator')
    expect(diffEl).toBeTruthy()
    // BEFORE_BUFFER differs from AFTER_BUFFER on line 0 ("hello world" vs "hello vim")
    expect(diffEl.textContent).toContain('1')
  })

  it('diff indicator shows 0 when buffer matches expected exactly', () => {
    const matchingChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: AFTER_BUFFER,
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={matchingChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    const diffEl = screen.getByTestId('diff-indicator')
    expect(diffEl.textContent).toContain('0')
  })

  it('onSuccess is not called when buffer does not match expected', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('onSuccess is called when buffer matches expected exactly', () => {
    const matchingChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: AFTER_BUFFER,
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={matchingChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('onSuccess receives keystroke count and elapsed time', () => {
    const matchingChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: AFTER_BUFFER,
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={matchingChallenge}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    expect(onSuccess).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
  })

  it('onSuccess fires only once even with repeated state changes that match', () => {
    const matchingChallenge: ChallengeDefinition = {
      ...BASE_CHALLENGE,
      initialBuffer: AFTER_BUFFER,
    }
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={matchingChallenge}
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
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowDown' })
    })
    expect(onArrowKeyPress).toHaveBeenCalledTimes(1)
  })

  it('diff indicator updates when buffer changes toward expected', () => {
    const onSuccess = vi.fn()
    const onArrowKeyPress = vi.fn()
    render(
      <TransformChallenge
        challenge={BASE_CHALLENGE}
        onSuccess={onSuccess}
        onArrowKeyPress={onArrowKeyPress}
      />
    )
    // Initially 1 line differs
    const diffEl = screen.getByTestId('diff-indicator')
    expect(diffEl.textContent).toContain('1')
  })
})
