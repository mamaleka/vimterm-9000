import type { StatisticsState } from '../store/statisticsSlice'
import type { ProgressState } from '../store/progressSlice'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  checkCondition: (stats: StatisticsState, progress: ProgressState) => boolean
}

// HJKL Barracks challenge IDs from Zone 1 Lesson 1
const HJKL_CHALLENGE_IDS = ['z1l1c1', 'z1l1c2', 'z1l1c3']

// Delete challenge IDs are identified by prefix convention.
// Zone 3 delete challenges will follow the 'delete-' prefix or 'z3l1c*' pattern.
function isDeleteChallenge(id: string): boolean {
  return id.startsWith('delete-') || id.startsWith('z3l1')
}

export const achievements: AchievementDefinition[] = [
  // ── Navigation ──────────────────────────────────────────────────────────────
  {
    id: 'hjklonomicon',
    name: 'Hjklonomicon',
    description: 'Complete all h/j/k/l challenges',
    checkCondition: (_stats, progress) =>
      HJKL_CHALLENGE_IDS.every((id) => id in progress.completedChallenges),
  },
  {
    id: 'word-wizard',
    name: 'Word Wizard',
    description: 'Use w, b, and e a combined 100 times in practice',
    checkCondition: (stats, _progress) => {
      const w = stats.motionUseCounts['w'] ?? 0
      const b = stats.motionUseCounts['b'] ?? 0
      const e = stats.motionUseCounts['e'] ?? 0
      return w + b + e >= 100
    },
  },
  {
    id: 'line-lord',
    name: 'Line Lord',
    description: 'Use gg or G 50 times',
    checkCondition: (stats, _progress) => stats.ggGUseCounts >= 50,
  },
  {
    id: 'counter-culture',
    name: 'Counter Culture',
    description: 'Use a count prefix 50 times',
    checkCondition: (stats, _progress) => stats.countPrefixUses >= 50,
  },

  // ── Combat ──────────────────────────────────────────────────────────────────
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first delete challenge',
    checkCondition: (stats, _progress) => stats.firstDeleteChallengeCompleted,
  },
  {
    id: 'clean-cut',
    name: 'Clean Cut',
    description: 'Complete a delete (dw) challenge with zero wasted keystrokes',
    checkCondition: (_stats, progress) =>
      Object.entries(progress.completedChallenges).some(
        ([id, result]) => isDeleteChallenge(id) && result.bestAccuracy >= 1,
      ),
  },
  {
    id: 'repeat-offender',
    name: 'Repeat Offender',
    description: 'Use dot repeat 25 times in one session',
    checkCondition: (stats, _progress) => stats.sessionDotRepeatCount >= 25,
  },
  {
    id: 'grammar-purist',
    name: 'Grammar Purist',
    description: 'Use 10 operator+motion combos without any insert mode',
    checkCondition: (stats, _progress) => stats.grammarCombosUsed >= 10,
  },

  // ── Speed ────────────────────────────────────────────────────────────────────
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Beat par time on 10 challenges',
    checkCondition: (stats, _progress) => stats.speedChallengesUnderPar >= 10,
  },
  {
    id: 'no-time-to-think',
    name: 'No Time to Think',
    description: 'Complete any challenge in under 2 seconds',
    checkCondition: (_stats, progress) =>
      Object.values(progress.completedChallenges).some((result) => result.bestTime < 2000),
  },

  // ── Secret ────────────────────────────────────────────────────────────────────
  {
    id: 'hjkl-addict',
    name: 'HJKL Addict',
    description: 'Press arrow keys (which are blocked) 50 times across all challenges',
    checkCondition: (stats, _progress) => stats.arrowKeyPresses >= 50,
  },
  {
    id: 'late-night-hacker',
    name: 'Late Night Hacker',
    description: 'Complete a challenge between 2–4am local time',
    checkCondition: (stats, _progress) => stats.lateNightChallenges > 0,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '100% accuracy on 20 consecutive challenges',
    checkCondition: (stats, _progress) => stats.perfectAccuracyChallenges >= 20,
  },
]
