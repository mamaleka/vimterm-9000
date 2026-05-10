import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useStore } from '../store'
import { ProfileScreen } from './ProfileScreen'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-10T12:00:00Z'))

  useStore.setState({
    displayName: 'TEST_PLAYER',
    level: 5,
    xp: 900,
    title: 'Word Wizard',
    unlockedAchievements: {
      hjklonomicon: { unlockedAt: '2026-05-01T10:00:00Z' },
    },
    statistics: {
      totalTimeSpent: 3600,
      totalKeystrokesRecorded: 5000,
      motionUseCounts: { h: 100, j: 200 },
      dailyActivity: { '2026-05-10': 15, '2026-05-09': 5 },
      arrowKeyPresses: 10,
      sessionDotRepeatCount: 0,
      speedChallengesUnderPar: 3,
      perfectAccuracyChallenges: 2,
      grammarCombosUsed: 0,
      countPrefixUses: 0,
      ggGUseCounts: 0,
      lateNightChallenges: 0,
      firstDeleteChallengeCompleted: false,
    },
    streak: { current: 5, longest: 10, lastActivityDate: '2026-05-10', graceUsed: false },
    currentScreen: 'profile',
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ProfileScreen', () => {
  it('displays player name and level', () => {
    render(<ProfileScreen />)
    expect(screen.getByText('TEST_PLAYER')).toBeInTheDocument()
    expect(screen.getByText(/LVL.*5|5.*LVL/i)).toBeInTheDocument()
  })

  it('displays total keystrokes', () => {
    render(<ProfileScreen />)
    expect(screen.getByText(/5000/)).toBeInTheDocument()
  })

  it('displays total time spent formatted', () => {
    render(<ProfileScreen />)
    expect(screen.getByText(/1h/i)).toBeInTheDocument()
  })

  it('renders exactly 30 heatmap cells', () => {
    render(<ProfileScreen />)
    const cells = screen.getAllByTestId('heatmap-cell')
    expect(cells).toHaveLength(30)
  })

  it('heatmap cell for 15 activity has opacity-60', () => {
    render(<ProfileScreen />)
    const cells = screen.getAllByTestId('heatmap-cell')
    const highActivityCell = cells.find((c) => c.classList.contains('opacity-60'))
    expect(highActivityCell).toBeDefined()
  })

  it('heatmap cell for 5 activity has opacity-40', () => {
    render(<ProfileScreen />)
    const cells = screen.getAllByTestId('heatmap-cell')
    const medActivityCell = cells.find((c) => c.classList.contains('opacity-40'))
    expect(medActivityCell).toBeDefined()
  })

  it('heatmap cells with 0 activity have opacity-20', () => {
    render(<ProfileScreen />)
    const cells = screen.getAllByTestId('heatmap-cell')
    const zeroActivityCells = cells.filter((c) => c.classList.contains('opacity-20'))
    expect(zeroActivityCells.length).toBeGreaterThan(0)
  })

  it('achievement gallery shows unlocked achievement name', () => {
    render(<ProfileScreen />)
    expect(screen.getByText(/Hjklonomicon/i)).toBeInTheDocument()
  })

  it('achievement gallery shows unlock date for unlocked achievement', () => {
    render(<ProfileScreen />)
    expect(screen.getByText(/2026-05-01/)).toBeInTheDocument()
  })

  it('locked achievements are shown as ???', () => {
    render(<ProfileScreen />)
    const lockedEntries = screen.getAllByText('???')
    expect(lockedEntries.length).toBeGreaterThan(0)
  })

  it('renders BACK button', () => {
    render(<ProfileScreen />)
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('clicking BACK button calls navigateTo("home")', () => {
    const navigateTo = vi.fn()
    useStore.setState({ navigateTo })
    render(<ProfileScreen />)
    fireEvent.click(screen.getByTestId('back-button'))
    expect(navigateTo).toHaveBeenCalledWith('home')
  })
})
