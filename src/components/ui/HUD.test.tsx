import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HUD } from './HUD'
import { useStore } from '../../store'

describe('HUD', () => {
  beforeEach(() => {
    useStore.setState({
      xp: 0,
      level: 1,
      streak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        graceUsed: false,
      },
    })
  })

  it('renders current XP value', () => {
    useStore.setState({ xp: 42, level: 1 })
    render(<HUD />)
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('renders current level', () => {
    useStore.setState({ xp: 0, level: 1 })
    render(<HUD />)
    expect(screen.getByText(/1/)).toBeInTheDocument()
  })

  it('renders the XPBar component', () => {
    render(<HUD />)
    expect(screen.getByTestId('xpbar-container')).toBeInTheDocument()
  })

  it('renders streak count when streak > 0', () => {
    useStore.setState({
      streak: {
        current: 5,
        longest: 5,
        lastActivityDate: '2026-05-10',
        graceUsed: false,
      },
    })
    render(<HUD />)
    expect(screen.getByTestId('streak-badge')).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('does NOT render streak badge when streak is 0', () => {
    useStore.setState({
      streak: {
        current: 0,
        longest: 0,
        lastActivityDate: '',
        graceUsed: false,
      },
    })
    render(<HUD />)
    expect(screen.queryByTestId('streak-badge')).not.toBeInTheDocument()
  })
})
