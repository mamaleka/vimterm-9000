import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { PracticeScreen } from './PracticeScreen'
import { useStore } from '../store'
import { calculateXP } from '../utils/xp'

let capturedOnSuccess: ((keystrokes: number, timeMs: number) => void) | null = null
let capturedOnArrowKeyPress: (() => void) | null = null

vi.mock('../components/challenge/ReachTarget', () => ({
  ReachTarget: (props: {
    challenge: unknown
    onSuccess: (k: number, t: number) => void
    onArrowKeyPress: () => void
  }) => {
    capturedOnSuccess = props.onSuccess
    capturedOnArrowKeyPress = props.onArrowKeyPress
    return <div data-testid="reach-target-component">ReachTarget</div>
  },
}))

vi.mock('../components/challenge/DeleteEnemies', () => ({
  DeleteEnemies: (props: {
    challenge: unknown
    onSuccess: (k: number, t: number) => void
    onArrowKeyPress: () => void
  }) => {
    capturedOnSuccess = props.onSuccess
    capturedOnArrowKeyPress = props.onArrowKeyPress
    return <div data-testid="delete-enemies-component">DeleteEnemies</div>
  },
}))

vi.mock('../components/challenge/TransformChallenge', () => ({
  TransformChallenge: (props: {
    challenge: unknown
    onSuccess: (k: number, t: number) => void
    onArrowKeyPress: () => void
  }) => {
    capturedOnSuccess = props.onSuccess
    capturedOnArrowKeyPress = props.onArrowKeyPress
    return <div data-testid="transform-challenge-component">TransformChallenge</div>
  },
}))

vi.mock('../components/ui/HUD', () => ({
  HUD: () => <div data-testid="hud">HUD</div>,
}))

vi.mock('../data/curriculum', () => ({
  zone1: {
    id: 'zone1',
    name: 'Test Zone',
    bossId: 'test-boss',
    lessons: [
      {
        id: 'zone1-lesson1',
        title: 'Test Lesson',
        theoryText: 'Test theory',
        motionsIntroduced: [],
        challenges: [
          {
            id: 'ch-reach',
            type: 'reachTarget',
            initialBuffer: ['....'],
            initialCursor: { row: 0, col: 0 },
            successCondition: { type: 'cursorAt', position: { row: 0, col: 3 } },
            allowedMotions: ['l'],
            parTime: 10,
            hint: 'Use l to move right',
          },
          {
            id: 'ch-delete',
            type: 'deleteEnemies',
            initialBuffer: ['[X]'],
            initialCursor: { row: 0, col: 0 },
            successCondition: { type: 'allEnemiesDeleted' },
            allowedMotions: ['x'],
            parTime: 10,
          },
          {
            id: 'ch-transform',
            type: 'transform',
            initialBuffer: ['hello'],
            initialCursor: { row: 0, col: 0 },
            successCondition: { type: 'bufferEquals', expected: ['HELLO'] },
            allowedMotions: ['~'],
            parTime: 10,
          },
        ],
      },
    ],
  },
}))

describe('PracticeScreen', () => {
  beforeEach(() => {
    capturedOnSuccess = null
    capturedOnArrowKeyPress = null
    useStore.setState({
      currentChallengeId: 'ch-reach',
      currentScreen: 'practice',
      xp: 0,
      level: 1,
      streak: { current: 0, longest: 0, lastActivityDate: '', graceUsed: false },
      completedChallenges: {},
      statistics: {
        totalTimeSpent: 0,
        totalKeystrokesRecorded: 0,
        motionUseCounts: {},
        dailyActivity: {},
        arrowKeyPresses: 0,
        sessionDotRepeatCount: 0,
        speedChallengesUnderPar: 0,
        perfectAccuracyChallenges: 0,
        grammarCombosUsed: 0,
        countPrefixUses: 0,
        ggGUseCounts: 0,
        lateNightChallenges: 0,
        firstDeleteChallengeCompleted: false,
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders ReachTarget for reachTarget challenge type', () => {
    render(<PracticeScreen />)
    expect(screen.getByTestId('reach-target-component')).toBeInTheDocument()
  })

  it('renders DeleteEnemies for deleteEnemies challenge type', () => {
    useStore.setState({ currentChallengeId: 'ch-delete' })
    render(<PracticeScreen />)
    expect(screen.getByTestId('delete-enemies-component')).toBeInTheDocument()
  })

  it('renders TransformChallenge for transform challenge type', () => {
    useStore.setState({ currentChallengeId: 'ch-transform' })
    render(<PracticeScreen />)
    expect(screen.getByTestId('transform-challenge-component')).toBeInTheDocument()
  })

  it('dispatches addXP with correct amount on challenge success', () => {
    render(<PracticeScreen />)
    act(() => {
      capturedOnSuccess!(5, 5000)
    })
    // ch-reach: parTime=10, no maxKeystrokes
    // speedBonus: 5000 < 10000 = true
    // accuracyBonus: 5 <= Infinity = true
    // firstCompletion: true (completedChallenges: {})
    // streak: 0
    const expectedXP = calculateXP(100, true, true, true, 0)
    expect(useStore.getState().xp).toBe(expectedXP)
  })

  it('navigates to challengeComplete on challenge success', () => {
    render(<PracticeScreen />)
    act(() => {
      capturedOnSuccess!(5, 5000)
    })
    expect(useStore.getState().currentScreen).toBe('challengeComplete')
  })

  it('shows arrow-warning element when onArrowKeyPress is called', () => {
    vi.useFakeTimers()
    render(<PracticeScreen />)
    expect(screen.queryByTestId('arrow-warning')).toBeNull()
    act(() => {
      capturedOnArrowKeyPress!()
    })
    expect(screen.getByTestId('arrow-warning')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.queryByTestId('arrow-warning')).toBeNull()
  })

  it('shows hint text when challenge has a hint', () => {
    render(<PracticeScreen />)
    expect(screen.getByText('Use l to move right')).toBeInTheDocument()
  })

  describe('no challenge fallback', () => {
    it('renders "No challenge active" message when no challenge is set', () => {
      useStore.setState({ currentChallengeId: null })
      render(<PracticeScreen />)
      expect(screen.getByText('No challenge active')).toBeInTheDocument()
    })

    it('renders "GO TO WORLD MAP" button when no challenge is set', () => {
      useStore.setState({ currentChallengeId: null })
      render(<PracticeScreen />)
      expect(screen.getByTestId('go-to-world-map')).toBeInTheDocument()
    })

    it('"GO TO WORLD MAP" button calls navigateTo with worldMap', () => {
      useStore.setState({ currentChallengeId: null })
      render(<PracticeScreen />)
      const button = screen.getByTestId('go-to-world-map')
      act(() => {
        button.click()
      })
      expect(useStore.getState().currentScreen).toBe('worldMap')
    })
  })

  it('records keystrokes in statistics on challenge success', () => {
    render(<PracticeScreen />)
    act(() => {
      capturedOnSuccess!(5, 5000)
    })
    expect(useStore.getState().statistics.totalKeystrokesRecorded).toBe(5)
  })

  it('records time spent in statistics on challenge success', () => {
    render(<PracticeScreen />)
    act(() => {
      capturedOnSuccess!(5, 5000)
    })
    expect(useStore.getState().statistics.totalTimeSpent).toBe(5)
  })

  it('records daily activity on challenge success', () => {
    render(<PracticeScreen />)
    act(() => {
      capturedOnSuccess!(5, 5000)
    })
    const today = new Date().toISOString().slice(0, 10)
    expect(useStore.getState().statistics.dailyActivity[today]).toBe(1)
  })
})
