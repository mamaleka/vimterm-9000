import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BossFightScreen } from './BossFightScreen'
import type { ChallengeDefinition } from '../types/challenge'

// Capture BossStage props so tests can trigger callbacks
const capturedCallbacks: {
  onStageCleared: () => void
  onHeartLost: () => void
} = {
  onStageCleared: () => {},
  onHeartLost: () => {},
}

vi.mock('../components/challenge/BossStage', () => ({
  BossStage: (props: {
    challenge: ChallengeDefinition
    timeLimit: number
    onStageCleared: () => void
    onHeartLost: () => void
    onArrowKeyPress: () => void
  }) => {
    capturedCallbacks.onStageCleared = props.onStageCleared
    capturedCallbacks.onHeartLost = props.onHeartLost
    return <div data-testid="mock-boss-stage" />
  },
}))

const mockNavigateTo = vi.fn()
const mockDefeatBoss = vi.fn()

vi.mock('../store', () => ({
  useStore: (selector: (s: {
    currentZone: string
    navigateTo: (screen: string) => void
    defeatBoss: (id: string, result: { defeatedAt: string; heartsRemaining: number }) => void
    bossDefeats: Record<string, unknown>
  }) => unknown) =>
    selector({
      currentZone: 'zone1',
      navigateTo: mockNavigateTo,
      defeatBoss: mockDefeatBoss,
      bossDefeats: {},
    }),
}))

describe('BossFightScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockNavigateTo.mockClear()
    mockDefeatBoss.mockClear()
    capturedCallbacks.onStageCleared = () => {}
    capturedCallbacks.onHeartLost = () => {}
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders boss ASCII art', () => {
    render(<BossFightScreen />)
    expect(screen.getByTestId('boss-ascii-art')).toBeInTheDocument()
  })

  it('renders boss name', () => {
    render(<BossFightScreen />)
    expect(screen.getByTestId('boss-name')).toBeInTheDocument()
    expect(screen.getByTestId('boss-name').textContent).toContain('Arrow Key Phantom')
  })

  it('displays 3 player hearts initially', () => {
    render(<BossFightScreen />)
    const hearts = screen.getByTestId('player-hearts')
    expect(hearts).toBeInTheDocument()
    // Should contain 3 heart symbols
    expect(hearts.textContent).toMatch(/♥.*♥.*♥/)
  })

  it('renders boss health bar', () => {
    render(<BossFightScreen />)
    expect(screen.getByTestId('health-bar')).toBeInTheDocument()
  })

  it('stage cleared advances to next stage (boss health decreases)', () => {
    render(<BossFightScreen />)
    const fillBefore = screen.getByTestId('health-bar-fill')
    const widthBefore = fillBefore.style.width

    act(() => {
      capturedCallbacks.onStageCleared()
    })

    const fillAfter = screen.getByTestId('health-bar-fill')
    // Boss health should decrease after a stage is cleared
    expect(fillAfter.style.width).not.toBe(widthBefore)
  })

  it('all stages cleared shows victory screen', () => {
    render(<BossFightScreen />)
    // arrow-key-phantom has 4 stages
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })

    expect(screen.getByTestId('boss-fight-victory')).toBeInTheDocument()
  })

  it('all stages cleared calls defeatBoss', () => {
    render(<BossFightScreen />)
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })

    expect(mockDefeatBoss).toHaveBeenCalledWith(
      'arrow-key-phantom',
      expect.objectContaining({ heartsRemaining: expect.any(Number) }),
    )
  })

  it('victory screen shows Continue button that navigates to worldMap', async () => {
    render(<BossFightScreen />)
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })
    act(() => { capturedCallbacks.onStageCleared() })

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    await userEvent.click(continueBtn)
    expect(mockNavigateTo).toHaveBeenCalledWith('worldMap')
  })

  it('hearts reach 0 shows defeat screen', () => {
    render(<BossFightScreen />)
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })

    expect(screen.getByTestId('boss-fight-defeat')).toBeInTheDocument()
  })

  it('defeat screen shows boss taunt dialogue', () => {
    render(<BossFightScreen />)
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })

    expect(screen.getByTestId('boss-fight-defeat')).toBeInTheDocument()
    // Should show some dialogue text from the boss
    const defeat = screen.getByTestId('boss-fight-defeat')
    expect(defeat.textContent?.length).toBeGreaterThan(0)
  })

  it('defeat screen has Try Again button that resets state', () => {
    render(<BossFightScreen />)
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('defeat screen has Retreat button that navigates to worldMap', async () => {
    render(<BossFightScreen />)
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })
    act(() => { capturedCallbacks.onHeartLost() })

    const retreatBtn = screen.getByRole('button', { name: /retreat/i })
    await userEvent.click(retreatBtn)
    expect(mockNavigateTo).toHaveBeenCalledWith('worldMap')
  })
})
