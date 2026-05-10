import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorldMapScreen } from './WorldMapScreen'

// Mock the store so we can control unlockedZones and spy on navigateTo
const mockNavigateTo = vi.fn()
const mockSetCurrentLesson = vi.fn()
const mockUnlockedZones = { current: ['zone1'] }
const mockCompletedLessons: { current: Record<string, unknown> } = { current: {} }

vi.mock('../store', () => ({
  useStore: (selector: (s: {
    unlockedZones: string[]
    navigateTo: (screen: string) => void
    completedLessons: Record<string, unknown>
    setCurrentLesson: (id: string) => void
  }) => unknown) =>
    selector({
      unlockedZones: mockUnlockedZones.current,
      navigateTo: mockNavigateTo,
      completedLessons: mockCompletedLessons.current,
      setCurrentLesson: mockSetCurrentLesson,
    }),
}))

describe('WorldMapScreen', () => {
  beforeEach(() => {
    mockNavigateTo.mockClear()
    mockSetCurrentLesson.mockClear()
    mockUnlockedZones.current = ['zone1']
    mockCompletedLessons.current = {}
  })

  it('renders all 5 zones', () => {
    render(<WorldMapScreen />)
    expect(screen.getByTestId('zone-1')).toBeInTheDocument()
    expect(screen.getByTestId('zone-2')).toBeInTheDocument()
    expect(screen.getByTestId('zone-3')).toBeInTheDocument()
    expect(screen.getByTestId('zone-4')).toBeInTheDocument()
    expect(screen.getByTestId('zone-5')).toBeInTheDocument()
  })

  it('displays zone names for all 5 zones', () => {
    render(<WorldMapScreen />)
    expect(screen.getByText(/Tutorial Bunker/i)).toBeInTheDocument()
    expect(screen.getByText(/Navigator's Canyon/i)).toBeInTheDocument()
    expect(screen.getByText(/Operator's Forge/i)).toBeInTheDocument()
    expect(screen.getByText(/Linguist's Library/i)).toBeInTheDocument()
    expect(screen.getByText(/Master's Summit/i)).toBeInTheDocument()
  })

  it('displays boss names for all 5 zones', () => {
    render(<WorldMapScreen />)
    expect(screen.getByText(/Arrow Key Phantom/i)).toBeInTheDocument()
    expect(screen.getByText(/Grep Golem/i)).toBeInTheDocument()
    expect(screen.getByText(/Syntax Serpent/i)).toBeInTheDocument()
    expect(screen.getByText(/JSON Jormungandr/i)).toBeInTheDocument()
    expect(screen.getByText(/Vim Wraith/i)).toBeInTheDocument()
  })

  it('only Zone 1 is unlocked by default — zones 2-5 have opacity-30', () => {
    render(<WorldMapScreen />)
    expect(screen.getByTestId('zone-2')).toHaveClass('opacity-30')
    expect(screen.getByTestId('zone-3')).toHaveClass('opacity-30')
    expect(screen.getByTestId('zone-4')).toHaveClass('opacity-30')
    expect(screen.getByTestId('zone-5')).toHaveClass('opacity-30')
  })

  it('Zone 1 does not have opacity-30 when unlocked by default', () => {
    render(<WorldMapScreen />)
    expect(screen.getByTestId('zone-1')).not.toHaveClass('opacity-30')
  })

  it('clicking unlocked Zone 1 calls navigateTo("lesson")', () => {
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-1'))
    expect(mockNavigateTo).toHaveBeenCalledWith('lesson')
  })

  it('clicking a locked zone does not call navigateTo', () => {
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-2'))
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('locked zones have dim styling (opacity-30)', () => {
    render(<WorldMapScreen />)
    const zone2 = screen.getByTestId('zone-2')
    expect(zone2).toHaveClass('opacity-30')
  })

  it('when multiple zones are unlocked, each unlocked zone is clickable', () => {
    mockUnlockedZones.current = ['zone1', 'zone2']
    render(<WorldMapScreen />)
    expect(screen.getByTestId('zone-2')).not.toHaveClass('opacity-30')
    fireEvent.click(screen.getByTestId('zone-2'))
    expect(mockNavigateTo).toHaveBeenCalledWith('lesson')
  })

  it('renders inside a TerminalWindow (has bg-crt-bg class)', () => {
    const { container } = render(<WorldMapScreen />)
    const wrapper = container.querySelector('.bg-crt-bg')
    expect(wrapper).not.toBeNull()
  })

  it('clicking unlocked zone1 calls setCurrentLesson with first lesson', () => {
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-1'))
    expect(mockSetCurrentLesson).toHaveBeenCalledWith('zone1-lesson1')
  })

  it('clicking unlocked zone1 still calls navigateTo("lesson")', () => {
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-1'))
    expect(mockNavigateTo).toHaveBeenCalledWith('lesson')
  })

  it('clicking unlocked zone1 sets first incomplete lesson when first is complete', () => {
    mockCompletedLessons.current = { 'zone1-lesson1': { stars: 3, bestTime: 10, completedAt: '2026-01-01' } }
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-1'))
    expect(mockSetCurrentLesson).toHaveBeenCalledWith('zone1-lesson2')
  })

  it('clicking unlocked zone1 falls back to first lesson when all lessons complete', () => {
    mockCompletedLessons.current = {
      'zone1-lesson1': { stars: 3, bestTime: 10, completedAt: '2026-01-01' },
      'zone1-lesson2': { stars: 3, bestTime: 10, completedAt: '2026-01-01' },
      'zone1-lesson3': { stars: 3, bestTime: 10, completedAt: '2026-01-01' },
      'zone1-lesson4': { stars: 3, bestTime: 10, completedAt: '2026-01-01' },
    }
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-1'))
    expect(mockSetCurrentLesson).toHaveBeenCalledWith('zone1-lesson1')
  })

  it('clicking a locked zone does not call setCurrentLesson', () => {
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('zone-2'))
    expect(mockSetCurrentLesson).not.toHaveBeenCalled()
  })
})
