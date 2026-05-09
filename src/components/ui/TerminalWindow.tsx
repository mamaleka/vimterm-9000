import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

export function TerminalWindow({ children, className = '' }: Props) {
  return (
    <div
      className={`
        relative min-h-screen bg-crt-bg border border-crt-border
        text-crt-text font-terminal
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}
