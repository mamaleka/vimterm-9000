import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorldMapScreen } from './WorldMapScreen'

// Mock the store so we can control unlockedZones and spy on navigateTo
const mockNavigateTo = vi.fn()
const mockUnlockedZones = { current: ['zone1'] }

vi.mock('../store', () => ({
  useStore: (selector: (s: {
    unlockedZones: string[]
    navigateTo: (screen: string) => void
  }) => unknown) =>
    selector({
      unlockedZones: mockUnlockedZones.current,
      navigateTo: mockNavigateTo,
    }),
}))

describe('WorldMapScreen', () => {
  beforeEach(() => {
    mockNavigateTo.mockClear()
    mockUnlockedZones.current = ['zone1']
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

  it('renders BACK button', () => {
    render(<WorldMapScreen />)
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('clicking BACK button calls navigateTo("home")', () => {
    render(<WorldMapScreen />)
    fireEvent.click(screen.getByTestId('back-button'))
    expect(mockNavigateTo).toHaveBeenCalledWith('home')
  })
})
