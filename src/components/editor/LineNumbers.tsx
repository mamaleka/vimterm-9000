interface Props {
  lineCount: number
  currentLine: number
}

export function LineNumbers({ lineCount, currentLine }: Props) {
  return (
    <div className="flex flex-col text-right pr-2 select-none font-mono text-sm border-r border-crt-border">
      {Array.from({ length: lineCount }, (_, i) => (
        <div
          key={i}
          data-line-number={i + 1}
          className={i === currentLine ? 'text-crt-bright' : 'text-crt-dim'}
        >
          {i + 1}
        </div>
      ))}
    </div>
  )
}
