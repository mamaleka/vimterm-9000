import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAchievements } from './useAchievements'
import { useStore } from '../store'

// Reset store state between tests
beforeEach(() => {
  useStore.setState({
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
    unlockedAchievements: {},
    completedChallenges: {},
    unlockedZones: ['zone1'],
    completedLessons: {},
    bossDefeats: {},
    currentZone: 'zone1',
    currentLesson: null,
  })
})

describe('useAchievements', () => {
  it('does not unlock any achievements when no conditions are met', () => {
    renderHook(() => useAchievements())
    const state = useStore.getState()
    expect(Object.keys(state.unlockedAchievements)).toHaveLength(0)
  })

  it('dispatches unlock when HJKL Addict condition is newly met', () => {
    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        statistics: { ...s.statistics, arrowKeyPresses: 50 },
      }))
    })

    rerender()

    const state = useStore.getState()
    expect(state.unlockedAchievements['hjkl-addict']).toBeDefined()
    expect(typeof state.unlockedAchievements['hjkl-addict'].unlockedAt).toBe('string')
  })

  it('dispatches unlock when Word Wizard condition is newly met', () => {
    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        statistics: {
          ...s.statistics,
          motionUseCounts: { w: 60, b: 25, e: 15 },
        },
      }))
    })

    rerender()

    const state = useStore.getState()
    expect(state.unlockedAchievements['word-wizard']).toBeDefined()
  })

  it('does not re-dispatch an achievement already unlocked', () => {
    const unlockAchievement = vi.fn()
    // Pre-unlock hjkl-addict
    useStore.setState({
      unlockedAchievements: {
        'hjkl-addict': { unlockedAt: '2026-05-10T00:00:00.000Z' },
      },
    })

    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        statistics: { ...s.statistics, arrowKeyPresses: 100 },
      }))
    })

    rerender()

    // The achievement should still only have the original timestamp
    const state = useStore.getState()
    expect(state.unlockedAchievements['hjkl-addict'].unlockedAt).toBe('2026-05-10T00:00:00.000Z')
    // No extra entries created
    const arrowKeyAch = Object.entries(state.unlockedAchievements).filter(
      ([id]) => id === 'hjkl-addict',
    )
    expect(arrowKeyAch).toHaveLength(1)
    void unlockAchievement
  })

  it('dispatches unlock for Speed Demon when speedChallengesUnderPar >= 10', () => {
    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        statistics: { ...s.statistics, speedChallengesUnderPar: 10 },
      }))
    })

    rerender()

    const state = useStore.getState()
    expect(state.unlockedAchievements['speed-demon']).toBeDefined()
  })

  it('dispatches unlock for Repeat Offender when sessionDotRepeatCount >= 25', () => {
    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        statistics: { ...s.statistics, sessionDotRepeatCount: 25 },
      }))
    })

    rerender()

    const state = useStore.getState()
    expect(state.unlockedAchievements['repeat-offender']).toBeDefined()
  })

  it('dispatches unlock for Hjklonomicon when all HJKL challenges completed', () => {
    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        ...s,
        completedChallenges: {
          z1l1c1: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
          z1l1c2: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
          z1l1c3: { attempts: 1, bestTime: 5, bestAccuracy: 1, stars: 3, xpEarned: 100 },
        },
      }))
    })

    rerender()

    const state = useStore.getState()
    expect(state.unlockedAchievements['hjklonomicon']).toBeDefined()
  })

  it('can unlock multiple achievements simultaneously', () => {
    const { rerender } = renderHook(() => useAchievements())

    act(() => {
      useStore.setState((s) => ({
        statistics: {
          ...s.statistics,
          arrowKeyPresses: 50,
          speedChallengesUnderPar: 10,
        },
      }))
    })

    rerender()

    const state = useStore.getState()
    expect(state.unlockedAchievements['hjkl-addict']).toBeDefined()
    expect(state.unlockedAchievements['speed-demon']).toBeDefined()
  })
})
