import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'
import { useStore } from './store'

describe('App', () => {
  beforeEach(() => {
    // Reset store to home screen before each test
    useStore.setState({ currentScreen: 'home' })
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('VIMTERM-9000')).toBeInTheDocument()
  })

  it('renders HomeScreen when currentScreen is home', () => {
    useStore.setState({ currentScreen: 'home' })
    render(<App />)
    expect(screen.getByText('VIMTERM-9000')).toBeInTheDocument()
  })

  it('renders PracticeScreen when currentScreen is practice', () => {
    useStore.setState({ currentScreen: 'practice' })
    render(<App />)
    expect(screen.queryByText('VIMTERM-9000')).not.toBeInTheDocument()
  })

  it('renders WorldMapScreen when currentScreen is worldMap', () => {
    useStore.setState({ currentScreen: 'worldMap' })
    render(<App />)
    expect(screen.getByTestId('zone-1')).toBeInTheDocument()
  })

  it('renders SettingsScreen when currentScreen is settings', () => {
    useStore.setState({ currentScreen: 'settings' })
    render(<App />)
    expect(screen.getByTestId('export-textarea')).toBeInTheDocument()
  })

  it('renders ChallengeCompleteScreen when currentScreen is challengeComplete and result is set', () => {
    useStore.setState({
      currentScreen: 'challengeComplete',
      pendingChallengeResult: {
        xpEarned: 100,
        stars: 2,
        keystrokes: 10,
        timeMs: 3000,
        parTime: 5000,
        firstCompletion: false,
        streakDays: 0,
      },
    })
    render(<App />)
    expect(screen.getByText(/MISSION COMPLETE/i)).toBeInTheDocument()
  })

  it('renders BossFightScreen when currentScreen is bossFight', () => {
    useStore.setState({ currentScreen: 'bossFight' })
    render(<App />)
    // BossFightScreen renders something — just confirm it doesn't crash
    expect(screen.queryByText('VIMTERM-9000')).not.toBeInTheDocument()
  })

  it('renders ProfileScreen when currentScreen is profile', () => {
    useStore.setState({ currentScreen: 'profile' })
    render(<App />)
    expect(screen.getByTestId('player-card')).toBeInTheDocument()
  })

  it('renders SkillTreeScreen when currentScreen is skillTree', () => {
    useStore.setState({ currentScreen: 'skillTree' })
    render(<App />)
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })
})

describe('navigateTo action', () => {
  beforeEach(() => {
    useStore.setState({ currentScreen: 'home' })
  })

  it('navigateTo updates currentScreen in store', () => {
    const { navigateTo } = useStore.getState()
    navigateTo('practice')
    expect(useStore.getState().currentScreen).toBe('practice')
  })

  it('navigateTo can switch to worldMap', () => {
    const { navigateTo } = useStore.getState()
    navigateTo('worldMap')
    expect(useStore.getState().currentScreen).toBe('worldMap')
  })

  it('navigateTo can switch back to home', () => {
    const { navigateTo } = useStore.getState()
    navigateTo('practice')
    navigateTo('home')
    expect(useStore.getState().currentScreen).toBe('home')
  })

  it('App re-renders when navigateTo changes currentScreen', () => {
    render(<App />)
    // Initially shows HomeScreen
    expect(screen.getByText('VIMTERM-9000')).toBeInTheDocument()

    // After navigating to practice, PracticeScreen shown
    act(() => {
      useStore.setState({ currentScreen: 'practice' })
    })
    expect(screen.queryByText('VIMTERM-9000')).not.toBeInTheDocument()
  })
})
