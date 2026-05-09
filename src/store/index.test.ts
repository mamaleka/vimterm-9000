import { describe, it, expect, beforeEach } from 'vitest'

describe('store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes playerSlice with default state', async () => {
    const { useStore } = await import('./index')
    const state = useStore.getState()
    expect(state.xp).toBe(0)
    expect(state.level).toBe(1)
    expect(state.displayName).toBe('PLAYER_ONE')
    expect(state.streak.current).toBe(0)
    expect(state.streak.longest).toBe(0)
    expect(state.streak.graceUsed).toBe(false)
  })

  it('initializes progressSlice with default state', async () => {
    const { useStore } = await import('./index')
    const state = useStore.getState()
    expect(state.unlockedZones).toContain('zone1')
    expect(state.completedChallenges).toEqual({})
    expect(state.currentZone).toBe('zone1')
  })

  it('initializes settingsSlice with default state', async () => {
    const { useStore } = await import('./index')
    const state = useStore.getState()
    expect(state.theme.phosphorColor).toBe('green')
    expect(state.theme.scanlines).toBe(true)
    expect(state.audio.enabled).toBe(false)
    expect(state.gameplay.showHints).toBe(true)
    expect(state.accessibility.reducedMotion).toBe(false)
  })

  it('initializes challengeSlice with default state', async () => {
    const { useStore } = await import('./index')
    const state = useStore.getState()
    expect(state.currentChallengeId).toBeNull()
    expect(state.currentScreen).toBe('home')
  })

  it('persists to localStorage under vimterm_save_v1 key', async () => {
    const { useStore } = await import('./index')
    useStore.getState().setDisplayName('TEST_PLAYER')
    await new Promise(resolve => setTimeout(resolve, 100))
    const saved = localStorage.getItem('vimterm_save_v1')
    expect(saved).not.toBeNull()
  })
})
