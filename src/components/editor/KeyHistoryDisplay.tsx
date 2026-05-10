interface Props {
  keys: string[]
  maxDisplay?: number
}

export function KeyHistoryDisplay({ keys, maxDisplay = 10 }: Props) {
  const displayedKeys = keys.slice(-maxDisplay)

  return (
    <div className="flex gap-1 font-mono text-sm">
      {displayedKeys.map((key, index) => {
        const isMostRecent = index === displayedKeys.length - 1
        return (
          <span
            key={index}
            data-testid="key-item"
            className={isMostRecent ? 'text-crt-bright' : 'text-crt-dim'}
          >
            {key}
          </span>
        )
      })}
    </div>
  )
}
