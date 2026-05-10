import { HomeScreen } from './screens/HomeScreen'
import { useStore } from './store'
import type { Screen } from './store/challengeSlice'

function ScreenPlaceholder({ name }: { name: Screen }) {
  return (
    <div data-testid={`screen-placeholder-${name}`} className="flex items-center justify-center min-h-screen text-crt-text font-terminal">
      Coming soon
    </div>
  )
}

export default function App() {
  const currentScreen = useStore((s) => s.currentScreen)

  switch (currentScreen) {
    case 'home':
      return <HomeScreen />
    case 'worldMap':
      return <ScreenPlaceholder name="worldMap" />
    case 'skillTree':
      return <ScreenPlaceholder name="skillTree" />
    case 'lesson':
      return <ScreenPlaceholder name="lesson" />
    case 'practice':
      return <ScreenPlaceholder name="practice" />
    case 'bossFight':
      return <ScreenPlaceholder name="bossFight" />
    case 'profile':
      return <ScreenPlaceholder name="profile" />
    case 'settings':
      return <ScreenPlaceholder name="settings" />
    case 'challengeComplete':
      return <ScreenPlaceholder name="challengeComplete" />
  }
}
