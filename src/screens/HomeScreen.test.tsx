import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen', () => {
  it('renders inside TerminalWindow (has border class)', () => {
    const { container } = render(<HomeScreen />)
    const wrapper = container.querySelector('.border')
    expect(wrapper).not.toBeNull()
  })

  it('displays the VIMTERM-9000 ASCII title', () => {
    render(<HomeScreen />)
    expect(screen.getByText(/VIMTERM-9000/i)).toBeInTheDocument()
  })

  it('displays player name PLAYER_ONE (default)', () => {
    render(<HomeScreen />)
    expect(screen.getByText(/PLAYER_ONE/i)).toBeInTheDocument()
  })

  it('renders an XP bar element', () => {
    const { container } = render(<HomeScreen />)
    const xpBar = container.querySelector('[data-testid="xp-bar"]')
    expect(xpBar).not.toBeNull()
  })

  it('renders streak counter with value 0', () => {
    render(<HomeScreen />)
    expect(screen.getByTestId('streak-counter')).toBeInTheDocument()
    expect(screen.getByTestId('streak-counter').textContent).toContain('0')
  })
})
