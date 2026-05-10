import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonScreen } from './LessonScreen'

// Mock the store
const mockNavigateTo = vi.fn()
const mockSetCurrentChallenge = vi.fn()
const mockSetCurrentLesson = vi.fn()

const defaultStoreState = {
  currentLesson: 'zone1-lesson1',
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

  it('renders theory text for the current lesson', () => {
    render(<LessonScreen />)
    // Theory text from zone1-lesson1: "The four most important keys in Vim..."
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
    // Not all lessons in zone1 completed
    defaultStoreState.completedChallenges = {}
    render(<LessonScreen />)

    const btn = screen.getByRole('button', { name: /complete challenge/i })
    await userEvent.setup().click(btn)

    expect(mockNavigateTo).toHaveBeenCalledWith('challengeComplete')
  })

  it('navigates to bossFight when last challenge of last lesson in zone is complete', async () => {
    // zone1-lesson4 last challenge
    defaultStoreState.currentLesson = 'zone1-lesson4'
    defaultStoreState.currentChallengeId = 'z1l4c2'
    // All other lessons completed
    defaultStoreState.completedChallenges = {
      z1l1c1: {} as unknown,
      z1l1c2: {} as unknown,
      z1l1c3: {} as unknown,
      z1l2c1: {} as unknown,
      z1l2c2: {} as unknown,
      z1l2c3: {} as unknown,
      z1l3c1: {} as unknown,
      z1l3c2: {} as unknown,
      z1l4c1: {} as unknown,
    } as Record<string, unknown>

    render(<LessonScreen />)

    const btn = screen.getByRole('button', { name: /complete challenge/i })
    await userEvent.setup().click(btn)

    expect(mockNavigateTo).toHaveBeenCalledWith('bossFight')
  })

  it('renders motions introduced for the lesson', () => {
    render(<LessonScreen />)
    // zone1-lesson1 introduces h, j, k, l
    expect(screen.getByText(/h/)).toBeInTheDocument()
    expect(screen.getByText(/j/)).toBeInTheDocument()
  })

  it('renders a back button that navigates to worldMap', async () => {
    const user = userEvent.setup()
    render(<LessonScreen />)

    const backBtn = screen.getByRole('button', { name: /back|world map/i })
    await user.click(backBtn)

    expect(mockNavigateTo).toHaveBeenCalledWith('worldMap')
  })
})
