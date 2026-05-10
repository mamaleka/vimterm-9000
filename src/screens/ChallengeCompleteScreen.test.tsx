import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ChallengeCompleteScreen from './ChallengeCompleteScreen'

const defaultProps = {
  xpEarned: 150,
  stars: 2 as const,
  keystrokes: 12,
  timeMs: 4500,
  parTime: 5000,
  firstCompletion: false,
  streakDays: 0,
  onContinue: vi.fn(),
}

describe('ChallengeCompleteScreen', () => {
  it('renders XP amount earned', () => {
    render(<ChallengeCompleteScreen {...defaultProps} />)
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('renders 1 star when stars === 1', () => {
    render(<ChallengeCompleteScreen {...defaultProps} stars={1} />)
    const stars = screen.getAllByTestId('star')
    expect(stars).toHaveLength(3)
    const filledStars = stars.filter((s) => s.dataset.filled === 'true')
    expect(filledStars).toHaveLength(1)
  })

  it('renders 2 stars when stars === 2', () => {
    render(<ChallengeCompleteScreen {...defaultProps} stars={2} />)
    const filledStars = screen
      .getAllByTestId('star')
      .filter((s) => s.dataset.filled === 'true')
    expect(filledStars).toHaveLength(2)
  })

  it('renders 3 stars when stars === 3', () => {
    render(<ChallengeCompleteScreen {...defaultProps} stars={3} />)
    const filledStars = screen
      .getAllByTestId('star')
      .filter((s) => s.dataset.filled === 'true')
    expect(filledStars).toHaveLength(3)
  })

  it('XP bar animated element is present in DOM with 600ms transition', () => {
    const { container } = render(<ChallengeCompleteScreen {...defaultProps} />)
    const xpBarFill = container.querySelector('[data-testid="xp-bar-fill"]')
    expect(xpBarFill).not.toBeNull()
    // Must have a Tailwind duration-[600ms] or duration-600 class
    const cls = xpBarFill?.className ?? ''
    expect(cls).toMatch(/duration-\[?600/)
  })

  it('Continue button calls onContinue when clicked', () => {
    const onContinue = vi.fn()
    render(<ChallengeCompleteScreen {...defaultProps} onContinue={onContinue} />)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('does NOT show FIRST COMPLETION badge when firstCompletion is false', () => {
    render(<ChallengeCompleteScreen {...defaultProps} firstCompletion={false} />)
    expect(screen.queryByText(/first completion/i)).toBeNull()
  })

  it('shows FIRST COMPLETION badge when firstCompletion is true', () => {
    render(<ChallengeCompleteScreen {...defaultProps} firstCompletion={true} />)
    expect(screen.getByText(/first completion/i)).toBeInTheDocument()
  })

  it('does NOT show streak multiplier when streakDays is 0', () => {
    render(<ChallengeCompleteScreen {...defaultProps} streakDays={0} />)
    expect(screen.queryByText(/streak/i)).toBeNull()
  })

  it('shows streak multiplier when streakDays > 0', () => {
    render(<ChallengeCompleteScreen {...defaultProps} streakDays={5} />)
    expect(screen.getByText(/streak/i)).toBeInTheDocument()
  })
})
