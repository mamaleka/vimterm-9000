interface Props {
  keys: string[]
  maxDisplay?: number
}

export function KeyHistoryDisplay({ keys, maxDisplay = 10 }: Props) {
  const displayedKeys = keys.slice(-maxDisplay)
  const lastIndex = displayedKeys.length - 1

  return (
    <div className="flex gap-1 font-mono text-sm">
      {displayedKeys.map((key, index) => (
        <span
          key={index}
          data-testid="key-item"
          className={index === lastIndex ? 'text-crt-bright' : 'text-crt-dim'}
        >
          {key}
        </span>
      ))}
    </div>
  )
}
