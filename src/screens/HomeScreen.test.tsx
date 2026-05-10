import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { HomeScreen } from './HomeScreen'
import { useStore } from '../store'

vi.mock('../store', () => ({
  useStore: vi.fn(),
}))

describe('HomeScreen', () => {
  const mockNavigateTo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        displayName: 'PLAYER_ONE',
        xp: 0,
        level: 1,
        streak: { current: 0, longest: 0 },
        navigateTo: mockNavigateTo,
      })
    )
  })

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

  // SPEC-049: Responsive logo container
  it('renders logo inside a scrollable container', () => {
    const { container } = render(<HomeScreen />)
    const logoContainer = container.querySelector('[data-testid="logo-container"]')
    expect(logoContainer).not.toBeNull()
    expect(logoContainer?.classList.contains('overflow-x-auto')).toBe(true)
  })

  it('renders ASCII art inside the logo container', () => {
    const { container } = render(<HomeScreen />)
    const logoContainer = container.querySelector('[data-testid="logo-container"]')
    const asciiArt = logoContainer?.querySelector('pre')
    expect(asciiArt).not.toBeNull()
  })

  // SPEC-044: Navigation buttons
  it('renders WORLD MAP button and calls navigateTo on click', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const worldMapButton = screen.getByText(/WORLD MAP/i)
    expect(worldMapButton).toBeInTheDocument()
    await user.click(worldMapButton)
    expect(mockNavigateTo).toHaveBeenCalledWith('worldMap')
  })

  it('renders SKILL TREE button and calls navigateTo on click', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const skillTreeButton = screen.getByText(/SKILL TREE/i)
    expect(skillTreeButton).toBeInTheDocument()
    await user.click(skillTreeButton)
    expect(mockNavigateTo).toHaveBeenCalledWith('skillTree')
  })

  it('renders SETTINGS button and calls navigateTo on click', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const settingsButton = screen.getByText(/SETTINGS/i)
    expect(settingsButton).toBeInTheDocument()
    await user.click(settingsButton)
    expect(mockNavigateTo).toHaveBeenCalledWith('settings')
  })

  it('renders PROFILE button and calls navigateTo on click', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />)
    const profileButton = screen.getByText(/PROFILE/i)
    expect(profileButton).toBeInTheDocument()
    await user.click(profileButton)
    expect(mockNavigateTo).toHaveBeenCalledWith('profile')
  })

  it('navigation buttons have CRT-themed styling', () => {
    const { container } = render(<HomeScreen />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
    buttons.forEach((button) => {
      expect(button.classList.contains('border')).toBe(true)
    })
  })
})
