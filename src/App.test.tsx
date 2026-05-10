import { render, screen } from '@testing-library/react'
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

  it('renders placeholder for practice screen when currentScreen is practice', () => {
    useStore.setState({ currentScreen: 'practice' })
    render(<App />)
    expect(screen.getByTestId('screen-placeholder-practice')).toBeInTheDocument()
    expect(screen.queryByText('VIMTERM-9000')).not.toBeInTheDocument()
  })

  it('renders placeholder for worldMap screen when currentScreen is worldMap', () => {
    useStore.setState({ currentScreen: 'worldMap' })
    render(<App />)
    expect(screen.getByTestId('screen-placeholder-worldMap')).toBeInTheDocument()
  })

  it('renders placeholder for settings screen when currentScreen is settings', () => {
    useStore.setState({ currentScreen: 'settings' })
    render(<App />)
    expect(screen.getByTestId('screen-placeholder-settings')).toBeInTheDocument()
  })

  it('renders placeholder for challengeComplete screen when currentScreen is challengeComplete', () => {
    useStore.setState({ currentScreen: 'challengeComplete' })
    render(<App />)
    expect(screen.getByTestId('screen-placeholder-challengeComplete')).toBeInTheDocument()
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

    // After navigating to practice, placeholder shown
    useStore.setState({ currentScreen: 'practice' })
    expect(screen.getByTestId('screen-placeholder-practice')).toBeInTheDocument()
    expect(screen.queryByText('VIMTERM-9000')).not.toBeInTheDocument()
  })
})
