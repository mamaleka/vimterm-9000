export interface MotionIntent {
  count: number
  motion: string
  operator: string | null
  char: string | null
}

const OPERATORS = new Set(['d', 'c', 'y', '>', '<'])
const SIMPLE_MOTIONS = new Set(['h', 'j', 'k', 'l', 'w', 'b', 'e', 'G', '0', '^', '$', ';', ',', 'n', 'N', '%', '{', '}'])
const FIND_MOTIONS = new Set(['f', 'F', 't', 'T'])

function readCount(buffer: string[], start: number): [number, number] {
  let i = start
  let numStr = ''
  while (i < buffer.length) {
    const ch = buffer[i]!
    if (/^[1-9]$/.test(ch) || (numStr.length > 0 && /^\d$/.test(ch))) {
      numStr += ch
      i++
    } else {
      break
    }
  }
  return [numStr.length > 0 ? parseInt(numStr, 10) : 1, i]
}

export function parseMotion(buffer: string[]): MotionIntent | null {
  if (buffer.length === 0) return null

  let i = 0

  // Read optional outer count
  const [outerCount, afterOuterCount] = readCount(buffer, i)
  i = afterOuterCount

  if (i >= buffer.length) return null

  // Read optional operator
  let operator: string | null = null
  if (OPERATORS.has(buffer[i]!)) {
    // Special case: 'dd', 'cc', 'yy' — operator applied to line
    if (i + 1 < buffer.length && buffer[i + 1] === buffer[i]) {
      return { count: outerCount, motion: buffer[i]! + buffer[i]!, operator: null, char: null }
    }
    operator = buffer[i]!
    i++
    if (i >= buffer.length) return null // incomplete: operator with no motion yet
  }

  // Read optional inner count (after operator)
  const [innerCount, afterInnerCount] = readCount(buffer, i)
  i = afterInnerCount
  const count = outerCount * innerCount

  if (i >= buffer.length) return null

  const key = buffer[i]!

  // Handle 'gg'
  if (key === 'g') {
    if (i + 1 >= buffer.length) return null
    if (buffer[i + 1] === 'g') {
      return { count, motion: 'gg', operator, char: null }
    }
    return null
  }

  // Handle simple motions
  if (SIMPLE_MOTIONS.has(key)) {
    return { count, motion: key, operator, char: null }
  }

  // Handle find motions (need a char argument)
  if (FIND_MOTIONS.has(key)) {
    if (i + 1 >= buffer.length) return null
    return { count, motion: key, operator, char: buffer[i + 1]! }
  }

  return null
}
