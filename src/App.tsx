import { HomeScreen } from './screens/HomeScreen'
import { WorldMapScreen } from './screens/WorldMapScreen'
import { SkillTreeScreen } from './screens/SkillTreeScreen'
import { LessonScreen } from './screens/LessonScreen'
import { PracticeScreen } from './screens/PracticeScreen'
import { BossFightScreen } from './screens/BossFightScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import SettingsScreen from './screens/SettingsScreen'
import ChallengeCompleteScreen from './screens/ChallengeCompleteScreen'
import { useStore } from './store'

export default function App() {
  const currentScreen = useStore((s) => s.currentScreen)
  const navigateTo = useStore((s) => s.navigateTo)
  const pendingChallengeResult = useStore((s) => s.pendingChallengeResult)

  switch (currentScreen) {
    case 'home':
      return <HomeScreen />
    case 'worldMap':
      return <WorldMapScreen />
    case 'skillTree':
      return <SkillTreeScreen />
    case 'lesson':
      return <LessonScreen />
    case 'practice':
      return <PracticeScreen />
    case 'bossFight':
      return <BossFightScreen />
    case 'profile':
      return <ProfileScreen />
    case 'settings':
      return <SettingsScreen />
    case 'challengeComplete':
      if (!pendingChallengeResult) return <PracticeScreen />
      return (
        <ChallengeCompleteScreen
          xpEarned={pendingChallengeResult.xpEarned}
          stars={pendingChallengeResult.stars}
          keystrokes={pendingChallengeResult.keystrokes}
          timeMs={pendingChallengeResult.timeMs}
          parTime={pendingChallengeResult.parTime}
          firstCompletion={pendingChallengeResult.firstCompletion}
          streakDays={pendingChallengeResult.streakDays}
          onContinue={() => navigateTo('worldMap')}
        />
      )
  }
}
