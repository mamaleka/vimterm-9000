import { TerminalWindow } from '../components/ui/TerminalWindow'
import { useStore } from '../store'

export function HomeScreen() {
  const displayName = useStore((s) => s.displayName)
  const xp = useStore((s) => s.xp)
  const level = useStore((s) => s.level)
  const streak = useStore((s) => s.streak)

  return (
    <TerminalWindow>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
        <pre className="text-crt-bright font-terminal text-2xl leading-tight text-center">
          {`
 __   _____ __  __ _____ _____ ____  __  __      ___  ___   ___   ___
 \\ \\ / /_ _|  \\/  |_   _| ____|  _ \\|  \\/  |    / _ \\|   \\ / _ \\ / _ \\
  \\ V / | || |\\/| | | | |  _| | |_) | |\\/| |   | (_) | |) | | | | | | |
   \\_/ |___|_|  |_| |_| |_____|____/|_|  |_|    \\___/|___/ \\___/ \\___/
          `.trim()}
        </pre>

        <div className="text-crt-text font-terminal text-4xl tracking-widest">
          VIMTERM-9000
        </div>

        <div className="border border-crt-border p-4 w-full max-w-md">
          <div className="text-crt-dim font-mono text-sm mb-1">OPERATOR</div>
          <div className="text-crt-bright font-terminal text-2xl">{displayName}</div>
          <div className="text-crt-dim font-mono text-xs mt-1">LVL {level}</div>
        </div>

        <div className="w-full max-w-md">
          <div className="flex justify-between text-crt-dim font-mono text-xs mb-1">
            <span>XP</span>
            <span>{xp}</span>
          </div>
          <div className="border border-crt-border h-4 w-full">
            <div
              data-testid="xp-bar"
              className="h-full bg-crt-text transition-all duration-600"
              style={{ width: `${Math.min(100, (xp / 100) * 100)}%` }}
            />
          </div>
        </div>

        <div className="border border-crt-border p-4">
          <div className="text-crt-dim font-mono text-xs mb-1">STREAK</div>
          <div className="text-crt-amber font-terminal text-3xl" data-testid="streak-counter">
            {streak.current}
          </div>
        </div>
      </div>
    </TerminalWindow>
  )
}
