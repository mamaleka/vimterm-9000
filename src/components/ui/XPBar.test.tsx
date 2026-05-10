import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { XPBar } from './XPBar'
import { levelToXPThreshold } from '../../utils/xp'

describe('XPBar', () => {
  it('shows 0% width at level 1 start (xp=0)', () => {
    // Level 1 threshold: 0, Level 2 threshold: 100
    // Progress = (0 - 0) / (100 - 0) = 0%
    const { getByTestId } = render(<XPBar xp={0} />)
    const fill = getByTestId('xpbar-fill')
    expect(fill.style.width).toBe('0%')
  })

  it('shows ~99% width near the next level threshold (xp=99, level 1→2)', () => {
    // Level 1: 0 to 100. xp=99 → (99-0)/(100-0) = 99%
    const { getByTestId } = render(<XPBar xp={99} />)
    const fill = getByTestId('xpbar-fill')
    expect(fill.style.width).toBe('99%')
  })

  it('shows 50% width at midpoint (xp=50, level 1→2)', () => {
    // Level 1: 0 to 100. xp=50 → (50-0)/(100-0) = 50%
    const { getByTestId } = render(<XPBar xp={50} />)
    const fill = getByTestId('xpbar-fill')
    expect(fill.style.width).toBe('50%')
  })

  it('shows 0% at the exact start of level 2 (xp=100)', () => {
    // At xp=100, player is level 2. Level 2 threshold: 100, Level 3: 250.
    // Progress = (100 - 100) / (250 - 100) = 0%
    const level2Start = levelToXPThreshold(2) // 100
    const { getByTestId } = render(<XPBar xp={level2Start} />)
    const fill = getByTestId('xpbar-fill')
    expect(fill.style.width).toBe('0%')
  })

  it('renders a container element', () => {
    const { getByTestId } = render(<XPBar xp={0} />)
    expect(getByTestId('xpbar-container')).toBeInTheDocument()
  })
})
