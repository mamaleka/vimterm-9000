import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonScreen } from './LessonScreen'

// Mock matchMedia to report reduced motion — bypasses typewriter animation in tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock the store
const mockNavigateTo = vi.fn()
const mockSetCurrentChallenge = vi.fn()
const mockSetCurrentLesson = vi.fn()

const defaultStoreState = {
  currentLesson: 'zone1-lesson1' as string | null,
  currentChallengeId: null as string | null,
  navigateTo: mockNavigateTo,
  setCurrentChallenge: mockSetCurrentChallenge,
  setCurrentLesson: mockSetCurrentLesson,
  currentZone: 'zone1',
  unlockedZones: ['zone1'],
  completedChallenges: {} as Record<string, unknown>,
}

vi.mock('../store', () => ({
  useStore: (selector: (s: typeof defaultStoreState) => unknown) =>
    selector(defaultStoreState),
}))

describe('LessonScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    defaultStoreState.currentLesson = 'zone1-lesson1'
    defaultStoreState.currentChallengeId = null
    defaultStoreState.completedChallenges = {}
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders theory text for the current lesson', () => {
    render(<LessonScreen />)
    expect(
      screen.getByText(/The four most important keys in Vim/i),
    ).toBeInTheDocument()
  })

  it('renders the lesson title', () => {
    render(<LessonScreen />)
    expect(screen.getByText(/HJKL Barracks/i)).toBeInTheDocument()
  })

  it('renders the "Start Practice" button', () => {
    render(<LessonScreen />)
    expect(
      screen.getByRole('button', { name: /start practice/i }),
    ).toBeInTheDocument()
  })

  it('"Start Practice" sets first challenge and navigates to practice', async () => {
    const user = userEvent.setup()
    render(<LessonScreen />)

    const btn = screen.getByRole('button', { name: /start practice/i })
    await user.click(btn)

    expect(mockSetCurrentChallenge).toHaveBeenCalledWith('z1l1c1')
    expect(mockNavigateTo).toHaveBeenCalledWith('practice')
  })

  it('shows challenge progress "Challenge 1 of 3" when on first challenge', () => {
    defaultStoreState.currentChallengeId = 'z1l1c1'
    render(<LessonScreen />)
    expect(screen.getByText(/Challenge 1 of 3/i)).toBeInTheDocument()
  })

  it('shows challenge progress "Challenge 2 of 3" when on second challenge', () => {
    defaultStoreState.currentChallengeId = 'z1l1c2'
    render(<LessonScreen />)
    expect(screen.getByText(/Challenge 2 of 3/i)).toBeInTheDocument()
  })

  it('shows challenge progress "Challenge 3 of 3" when on last challenge', () => {
    defaultStoreState.currentChallengeId = 'z1l1c3'
    render(<LessonScreen />)
    expect(screen.getByText(/Challenge 3 of 3/i)).toBeInTheDocument()
  })

  it('navigates to challengeComplete when last challenge is complete and zone not done', async () => {
    defaultStoreState.currentChallengeId = 'z1l1c3'
    defaultStoreState.completedChallenges = { z1l1c3: {} }
    render(<LessonScreen />)

    const btn = screen.getByRole('button', { name: /complete challenge/i })
    await userEvent.setup().click(btn)

    expect(mockNavigateTo).toHaveBeenCalledWith('challengeComplete')
  })

  it('navigates to bossFight when last challenge of last lesson in zone is complete', async () => {
    defaultStoreState.currentLesson = 'zone1-lesson4'
    defaultStoreState.currentChallengeId = 'z1l4c2'
    // All other challenges completed (everything except z1l4c2 itself)
    defaultStoreState.completedChallenges = {
      z1l1c1: {},
      z1l1c2: {},
      z1l1c3: {},
      z1l2c1: {},
      z1l2c2: {},
      z1l2c3: {},
      z1l3c1: {},
      z1l3c2: {},
      z1l4c1: {},
      z1l4c2: {},
    } as Record<string, unknown>

    render(<LessonScreen />)

    const btn = screen.getByRole('button', { name: /complete challenge/i })
    await userEvent.setup().click(btn)

    expect(mockNavigateTo).toHaveBeenCalledWith('bossFight')
  })

  it('renders motions introduced for the lesson', () => {
    render(<LessonScreen />)
    // zone1-lesson1 introduces h, j, k, l — check for the key badges
    const badges = screen.getAllByText(/^[hjkl]$/)
    expect(badges.length).toBeGreaterThanOrEqual(4)
  })

  it('renders a back button that navigates to worldMap', async () => {
    const user = userEvent.setup()
    render(<LessonScreen />)

    const backBtn = screen.getByRole('button', { name: /back to world map/i })
    await user.click(backBtn)

    expect(mockNavigateTo).toHaveBeenCalledWith('worldMap')
  })

  it('does not show COMPLETE CHALLENGE when the current challenge is not yet completed', () => {
    defaultStoreState.currentChallengeId = 'z1l1c1'
    defaultStoreState.completedChallenges = {}
    render(<LessonScreen />)
    expect(screen.queryByRole('button', { name: /complete challenge/i })).toBeNull()
  })

  it('shows COMPLETE CHALLENGE when the current challenge has been completed', () => {
    defaultStoreState.currentChallengeId = 'z1l1c1'
    defaultStoreState.completedChallenges = { z1l1c1: {} }
    render(<LessonScreen />)
    expect(screen.getByRole('button', { name: /complete challenge/i })).toBeInTheDocument()
  })

  it('shows a checkmark next to a completed challenge in the list', () => {
    defaultStoreState.currentChallengeId = 'z1l1c2'
    defaultStoreState.completedChallenges = { z1l1c1: {} }
    render(<LessonScreen />)
    expect(screen.getByTestId('challenge-status-z1l1c1')).toHaveTextContent('✓')
  })

  it('shows a pending marker next to an incomplete challenge in the list', () => {
    defaultStoreState.currentChallengeId = 'z1l1c1'
    defaultStoreState.completedChallenges = {}
    render(<LessonScreen />)
    expect(screen.getByTestId('challenge-status-z1l1c1')).not.toHaveTextContent('✓')
  })
})
