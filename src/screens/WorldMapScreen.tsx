import { TerminalWindow } from '../components/ui/TerminalWindow'
import { useStore } from '../store'
import { zone1, zone2, zone3, zone4, zone5 } from '../data/curriculum'
import type { Zone } from '../types/curriculum'

const ALL_ZONES: Zone[] = [zone1, zone2, zone3, zone4, zone5]

interface ZoneDefinition {
  id: string
  zoneNumber: number
  name: string
  bossName: string
  asciiArt: string
  lessons: string
}

const ZONES: ZoneDefinition[] = [
  {
    id: 'zone1',
    zoneNumber: 1,
    name: 'Tutorial Bunker',
    bossName: 'The Arrow Key Phantom',
    asciiArt: [
      '  +====================+',
      '  |     [ ZONE 1 ]     |',
      '  |  ================  |',
      '  +--------------------+',
    ].join('\n'),
    lessons: '[HJKL Barracks] → [Word Waypoints] → [Line Ledge] → [Count Cavern]',
  },
  {
    id: 'zone2',
    zoneNumber: 2,
    name: "Navigator's Canyon",
    bossName: 'The Grep Golem',
    asciiArt: [
      '  +====================+',
      '  |     [ ZONE 2 ]     |',
      '  |  ~~~~~~~~~~~~~~    |',
      '  +--------------------+',
    ].join('\n'),
    lessons: '[Find Falls] → [Search Sanctum] → [Jump Junction]',
  },
  {
    id: 'zone3',
    zoneNumber: 3,
    name: "Operator's Forge",
    bossName: 'The Syntax Serpent',
    asciiArt: [
      '  +====================+',
      '  |     [ ZONE 3 ]     |',
      '  |  ################  |',
      '  +--------------------+',
    ].join('\n'),
    lessons: '[Delete Dungeon] → [Change Chamber] → [Yank Yard] → [Dot Dojo]',
  },
  {
    id: 'zone4',
    zoneNumber: 4,
    name: "Linguist's Library",
    bossName: 'The JSON Jormungandr',
    asciiArt: [
      '  +====================+',
      '  |     [ ZONE 4 ]     |',
      '  |  {{{{{{{{{{{{{{{{  |',
      '  +--------------------+',
    ].join('\n'),
    lessons: '[Word Vault] → [Quote Quarry] → [Bracket Bastion]',
  },
  {
    id: 'zone5',
    zoneNumber: 5,
    name: "Master's Summit",
    bossName: 'The Vim Wraith',
    asciiArt: [
      '  +====================+',
      '  |     [ ZONE 5 ]     |',
      '  |     /\\   /\\        |',
      '  +--------------------+',
    ].join('\n'),
    lessons: '[Mark Mountain] → [Match Meadow] → [Paragraph Peak]',
  },
]

export function WorldMapScreen() {
  const unlockedZones = useStore((s) => s.unlockedZones)
  const navigateTo = useStore((s) => s.navigateTo)
  const completedLessons = useStore((s) => s.completedLessons)
  const setCurrentLesson = useStore((s) => s.setCurrentLesson)

  return (
    <TerminalWindow>
      <div className="flex flex-col items-center min-h-screen p-8 gap-2">
        <div className="flex items-center justify-between mb-6 w-full max-w-2xl">
          <div className="text-crt-bright font-terminal text-2xl tracking-widest">
            {'>>> WORLD MAP <<<'}
          </div>
          <button
            data-testid="back-button"
            onClick={() => navigateTo('home')}
            className="text-crt-text font-mono border border-crt-border px-3 py-1 hover:text-crt-bright"
          >
            ← BACK
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-2xl">
          {ZONES.map((zone) => {
            const isUnlocked = unlockedZones.includes(zone.id)

            return (
              <button
                key={zone.id}
                data-testid={`zone-${zone.zoneNumber}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    const zoneData = ALL_ZONES.find((z) => z.id === zone.id)
                    if (zoneData) {
                      const firstIncomplete =
                        zoneData.lessons.find((lesson) => !(lesson.id in completedLessons)) ??
                        zoneData.lessons[0]
                      setCurrentLesson(firstIncomplete.id)
                    }
                    navigateTo('lesson')
                  }
                }}
                className={[
                  'border border-crt-border p-4 text-left w-full',
                  'font-terminal transition-colors',
                  isUnlocked
                    ? 'text-crt-bright hover:border-crt-text cursor-pointer'
                    : 'text-crt-dim opacity-30 cursor-not-allowed',
                ].join(' ')}
              >
                <pre className="text-xs leading-tight mb-2">{zone.asciiArt}</pre>

                <div className="text-lg font-bold tracking-wide">
                  ZONE {zone.zoneNumber} — {zone.name}
                </div>

                <div className="text-sm mt-1">
                  BOSS: {zone.bossName}
                </div>

                <div className="text-xs mt-1 text-crt-dim">
                  {zone.lessons}
                </div>

                {!isUnlocked && (
                  <div className="text-xs mt-2 tracking-widest">
                    [LOCKED]
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </TerminalWindow>
  )
}
