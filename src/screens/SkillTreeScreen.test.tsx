import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SkillTreeScreen } from './SkillTreeScreen'

const mockNavigateTo = vi.fn()

vi.mock('../store', () => ({
  useStore: (selector: (s: {
    unlockedZones: string[]
    navigateTo: (screen: string) => void
    statistics: { motionUseCounts: Record<string, number> }
  }) => unknown) =>
    selector({
      unlockedZones: ['zone1'],
      navigateTo: mockNavigateTo,
      statistics: {
        motionUseCounts: { h: 50, j: 30, k: 10, l: 5 },
      },
    }),
}))

describe('SkillTreeScreen', () => {
  beforeEach(() => {
    mockNavigateTo.mockClear()
  })

  it('renders all 5 phase motion groups', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('phase-1')).toBeInTheDocument()
    expect(screen.getByTestId('phase-2')).toBeInTheDocument()
    expect(screen.getByTestId('phase-3')).toBeInTheDocument()
    expect(screen.getByTestId('phase-4')).toBeInTheDocument()
    expect(screen.getByTestId('phase-5')).toBeInTheDocument()
  })

  it('renders phase labels', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByText(/Basic Movement/)).toBeInTheDocument()
    expect(screen.getByText(/Find & Search/)).toBeInTheDocument()
    expect(screen.getByText(/Operators/)).toBeInTheDocument()
    expect(screen.getByText(/Text Objects/)).toBeInTheDocument()
    expect(screen.getByText(/Marks & Jumps/)).toBeInTheDocument()
  })

  it('renders motion nodes for Phase 1 (h/j/k/l and others)', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-h')).toBeInTheDocument()
    expect(screen.getByTestId('motion-j')).toBeInTheDocument()
    expect(screen.getByTestId('motion-k')).toBeInTheDocument()
    expect(screen.getByTestId('motion-l')).toBeInTheDocument()
  })

  it('renders motion nodes for Phase 2 (w/b/e/0/^/$)', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-w')).toBeInTheDocument()
    expect(screen.getByTestId('motion-b')).toBeInTheDocument()
    expect(screen.getByTestId('motion-e')).toBeInTheDocument()
    expect(screen.getByTestId('motion-0')).toBeInTheDocument()
    expect(screen.getByTestId('motion-^')).toBeInTheDocument()
    expect(screen.getByTestId('motion-$')).toBeInTheDocument()
  })

  it('renders motion nodes for Phase 3 (f/F/t/T/;/,)', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-f')).toBeInTheDocument()
    expect(screen.getByTestId('motion-F')).toBeInTheDocument()
    expect(screen.getByTestId('motion-t')).toBeInTheDocument()
    expect(screen.getByTestId('motion-T')).toBeInTheDocument()
    expect(screen.getByTestId('motion-;')).toBeInTheDocument()
    expect(screen.getByTestId('motion-,')).toBeInTheDocument()
  })

  it('renders motion nodes for Phase 4 (d/c/y/p)', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-d')).toBeInTheDocument()
    expect(screen.getByTestId('motion-c')).toBeInTheDocument()
    expect(screen.getByTestId('motion-y')).toBeInTheDocument()
    expect(screen.getByTestId('motion-p')).toBeInTheDocument()
  })

  it('renders motion nodes for Phase 5 (iw/aw/i"/i(/m/\'/%)', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-iw')).toBeInTheDocument()
    expect(screen.getByTestId('motion-aw')).toBeInTheDocument()
    expect(screen.getByTestId('motion-m')).toBeInTheDocument()
    expect(screen.getByTestId("motion-'")).toBeInTheDocument()
    expect(screen.getByTestId('motion-%')).toBeInTheDocument()
  })

  it('unlocked motions (zone1) have bright class', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-h')).toHaveClass('text-crt-bright')
    expect(screen.getByTestId('motion-j')).toHaveClass('text-crt-bright')
    expect(screen.getByTestId('motion-w')).toHaveClass('text-crt-bright')
  })

  it('locked motions (zones 2-5 not unlocked) have dim class', () => {
    render(<SkillTreeScreen />)
    expect(screen.getByTestId('motion-f')).toHaveClass('text-crt-dim')
    expect(screen.getByTestId('motion-d')).toHaveClass('text-crt-dim')
    expect(screen.getByTestId('motion-iw')).toHaveClass('text-crt-dim')
    expect(screen.getByTestId('motion-m')).toHaveClass('text-crt-dim')
  })

  it('clicking a motion node shows usage count tooltip', () => {
    render(<SkillTreeScreen />)
    fireEvent.click(screen.getByTestId('motion-h'))
    const tooltip = screen.getByTestId('motion-tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(within(tooltip).getByText('50')).toBeInTheDocument()
  })

  it('clicking a motion with zero usage shows 0 in tooltip', () => {
    render(<SkillTreeScreen />)
    fireEvent.click(screen.getByTestId('motion-l'))
    const tooltip = screen.getByTestId('motion-tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(within(tooltip).getByText('5')).toBeInTheDocument()
  })

  it('clicking a different motion updates the tooltip', () => {
    render(<SkillTreeScreen />)
    fireEvent.click(screen.getByTestId('motion-h'))
    expect(within(screen.getByTestId('motion-tooltip')).getByText('50')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('motion-j'))
    expect(within(screen.getByTestId('motion-tooltip')).getByText('30')).toBeInTheDocument()
  })

  it('back button navigates to worldMap', () => {
    render(<SkillTreeScreen />)
    fireEvent.click(screen.getByTestId('back-button'))
    expect(mockNavigateTo).toHaveBeenCalledWith('worldMap')
  })
})
