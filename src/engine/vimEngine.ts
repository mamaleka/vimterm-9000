import type { VimState } from '../types/vim'

export function createInitialState(buffer: string[]): VimState {
  return {
    mode: 'normal',
    buffer,
    cursor: { row: 0, col: 0 },
    register: '',
    registerType: 'char',
    pendingOperator: null,
    pendingCount: null,
    pendingMotion: [],
    jumpList: [],
    jumpIndex: -1,
    marks: {},
    lastFindChar: null,
    lastFindDirection: null,
    lastFindTill: false,
    searchPattern: null,
    lastAction: null,
    insertedText: '',
    visitedPositions: [],
    motionCounts: {},
  }
}

function clampCol(col: number, line: string): number {
  if (line.length === 0) return 0
  return Math.min(col, line.length - 1)
}

function firstNonWhitespaceCol(line: string): number {
  for (let i = 0; i < line.length; i++) {
    if (!/\s/.test(line[i]!)) return i
  }
  return 0
}

function isWordChar(ch: string): boolean {
  return /\w/.test(ch)
}

function isSpace(ch: string): boolean {
  return /\s/.test(ch)
}

function tokenType(ch: string): 'word' | 'nonword' | 'space' {
  if (isSpace(ch)) return 'space'
  if (isWordChar(ch)) return 'word'
  return 'nonword'
}

function moveWordForward(
  buffer: string[],
  cursor: { row: number; col: number },
): { row: number; col: number } {
  const totalRows = buffer.length
  let { row, col } = cursor

  const bufferEnd = (): { row: number; col: number } => {
    const lastRow = totalRows - 1
    const lastLine = buffer[lastRow] ?? ''
    return { row: lastRow, col: Math.max(0, lastLine.length - 1) }
  }

  const line = buffer[row] ?? ''

  if (line.length === 0) {
    if (row + 1 < totalRows) {
      return { row: row + 1, col: 0 }
    }
    return { row, col: 0 }
  }

  if (col >= line.length) {
    if (row + 1 < totalRows) {
      return { row: row + 1, col: 0 }
    }
    return bufferEnd()
  }

  const curType = tokenType(line[col]!)

  let c = col
  if (curType !== 'space') {
    while (c < line.length && tokenType(line[c]!) === curType) {
      c++
    }
  }

  while (c < line.length && isSpace(line[c]!)) {
    c++
  }

  if (c < line.length) {
    return { row, col: c }
  }

  if (row + 1 < totalRows) {
    let nextCol = 0
    const nextLine = buffer[row + 1] ?? ''
    while (nextCol < nextLine.length && isSpace(nextLine[nextCol]!)) {
      nextCol++
    }
    return { row: row + 1, col: nextCol }
  }

  return bufferEnd()
}

function moveWordBackward(
  buffer: string[],
  cursor: { row: number; col: number },
): { row: number; col: number } {
  let { row, col } = cursor

  if (row === 0 && col === 0) return { row, col }

  if (col === 0) {
    row--
    col = Math.max(0, (buffer[row] ?? '').length - 1)
  } else {
    col--
  }

  while (true) {
    const line = buffer[row] ?? ''
    if (col >= 0 && col < line.length && !isSpace(line[col]!)) break
    if (col > 0) {
      col--
    } else if (row > 0) {
      row--
      col = Math.max(0, (buffer[row] ?? '').length - 1)
    } else {
      return { row: 0, col: 0 }
    }
  }

  const line = buffer[row] ?? ''
  const atWordChar = isWordChar(line[col]!)
  while (col > 0 && isWordChar(line[col - 1]!) === atWordChar) {
    col--
  }

  return { row, col }
}

function moveWordEnd(
  buffer: string[],
  cursor: { row: number; col: number },
): { row: number; col: number } {
  const totalRows = buffer.length
  let { row, col } = cursor

  const bufferEnd = (): { row: number; col: number } => {
    const lastRow = totalRows - 1
    const lastLine = buffer[lastRow] ?? ''
    return { row: lastRow, col: Math.max(0, lastLine.length - 1) }
  }

  const lastLine = buffer[totalRows - 1] ?? ''
  if (row === totalRows - 1 && col >= Math.max(0, lastLine.length - 1)) {
    return bufferEnd()
  }

  const currentLine = buffer[row] ?? ''
  if (col + 1 < currentLine.length) {
    col++
  } else if (row + 1 < totalRows) {
    row++
    col = 0
  } else {
    return bufferEnd()
  }

  while (row < totalRows) {
    const ln = buffer[row] ?? ''
    while (col < ln.length && isSpace(ln[col]!)) {
      col++
    }
    if (col < ln.length) break
    if (row + 1 < totalRows) {
      row++
      col = 0
    } else {
      return bufferEnd()
    }
  }

  if (row >= totalRows) return bufferEnd()

  const ln = buffer[row] ?? ''
  const startType = tokenType(ln[col]!)
  while (col + 1 < ln.length && tokenType(ln[col + 1]!) === startType) {
    col++
  }

  return { row, col }
}

function findCharForward(line: string, fromCol: number, ch: string, till: boolean): number | null {
  for (let i = fromCol + 1; i < line.length; i++) {
    if (line[i] === ch) return till ? i - 1 : i
  }
  return null
}

function findCharBackward(line: string, fromCol: number, ch: string, till: boolean): number | null {
  for (let i = fromCol - 1; i >= 0; i--) {
    if (line[i] === ch) return till ? i + 1 : i
  }
  return null
}

function executeFindMotion(
  state: VimState,
  char: string,
  direction: 'forward' | 'backward',
  till: boolean,
): VimState {
  const line = state.buffer[state.cursor.row] ?? ''
  const newCol =
    direction === 'forward'
      ? findCharForward(line, state.cursor.col, char, till)
      : findCharBackward(line, state.cursor.col, char, till)
  if (newCol === null) {
    return { ...state, lastFindChar: char, lastFindDirection: direction, lastFindTill: till, pendingMotion: [] }
  }
  return {
    ...state,
    cursor: { ...state.cursor, col: newCol },
    lastFindChar: char,
    lastFindDirection: direction,
    lastFindTill: till,
    pendingMotion: [],
  }
}

function searchBuffer(
  buffer: string[],
  pattern: string,
  fromRow: number,
  fromCol: number,
  direction: 'forward' | 'backward',
): { row: number; col: number } | null {
  const totalRows = buffer.length
  const all: Array<{ row: number; col: number }> = []

  if (direction === 'forward') {
    for (let r = 0; r < totalRows; r++) {
      const line = buffer[r] ?? ''
      for (let c = 0; c < line.length; c++) {
        all.push({ row: r, col: c })
      }
    }
  } else {
    for (let r = totalRows - 1; r >= 0; r--) {
      const line = buffer[r] ?? ''
      for (let c = line.length - 1; c >= 0; c--) {
        all.push({ row: r, col: c })
      }
    }
  }

  const startPredicate =
    direction === 'forward'
      ? (p: { row: number; col: number }) => p.row > fromRow || (p.row === fromRow && p.col > fromCol)
      : (p: { row: number; col: number }) => p.row < fromRow || (p.row === fromRow && p.col < fromCol)

  const startIdx = all.findIndex(startPredicate)
  const ordered = startIdx !== -1 ? [...all.slice(startIdx), ...all.slice(0, startIdx)] : all

  for (const pos of ordered) {
    const line = buffer[pos.row] ?? ''
    if (line.slice(pos.col, pos.col + pattern.length) === pattern) {
      return pos
    }
  }
  return null
}

function executeSearch(state: VimState, direction: 'forward' | 'backward'): VimState {
  if (!state.searchPattern) return state
  const match = searchBuffer(
    state.buffer,
    state.searchPattern,
    state.cursor.row,
    state.cursor.col,
    direction,
  )
  if (!match) return state
  return { ...state, cursor: match }
}

// ─── Operator helpers ──────────────────────────────────────────────────────────

/**
 * Compute where a motion would take the cursor (without modifying state).
 * Returns null for unrecognized motions.
 */
function computeMotionEnd(
  buffer: string[],
  cursor: { row: number; col: number },
  motion: string,
  count: number,
): { row: number; col: number } | null {
  let pos = { ...cursor }
  for (let i = 0; i < count; i++) {
    switch (motion) {
      case 'w':
        pos = moveWordForward(buffer, pos)
        break
      case 'b':
        pos = moveWordBackward(buffer, pos)
        break
      case 'e':
        pos = moveWordEnd(buffer, pos)
        break
      case '$': {
        const line = buffer[pos.row] ?? ''
        pos = { row: pos.row, col: Math.max(0, line.length - 1) }
        break
      }
      case '0':
        pos = { row: pos.row, col: 0 }
        break
      case '^': {
        const line = buffer[pos.row] ?? ''
        pos = { row: pos.row, col: firstNonWhitespaceCol(line) }
        break
      }
      case 'h':
        pos = { row: pos.row, col: Math.max(0, pos.col - 1) }
        break
      case 'l': {
        const line = buffer[pos.row] ?? ''
        pos = { row: pos.row, col: Math.min(Math.max(0, line.length - 1), pos.col + 1) }
        break
      }
      default:
        return null
    }
  }
  return pos
}

/**
 * For the `w` motion used with an operator: returns the exclusive end position.
 *
 * - For `d` (and `y`): behaves like moveWordForward but deletes to EOL when at last word.
 * - For `c`: acts like `e` motion (end of word, inclusive), i.e. `cw` = `ce`.
 *   This matches Vim semantics where `cw` does NOT consume trailing whitespace.
 */
function computeWordMotionForOperator(
  buffer: string[],
  cursor: { row: number; col: number },
  count: number,
  operator: 'd' | 'c' | 'y',
): { row: number; col: number } {
  // For 'c' operator: use word-end semantics (cw = ce in Vim)
  if (operator === 'c') {
    let pos = { ...cursor }
    for (let i = 0; i < count; i++) {
      pos = moveWordEnd(buffer, pos)
    }
    // moveWordEnd returns the last char of the word; deletion is inclusive, so +1
    return { row: pos.row, col: pos.col + 1 }
  }

  // For 'd' and 'y': delete to start of next word (including trailing space)
  let pos = { ...cursor }
  for (let i = 0; i < count; i++) {
    const nextPos = moveWordForward(buffer, pos)
    const lastRow = buffer.length - 1
    const lastLine = buffer[lastRow] ?? ''
    const bufferEndCol = Math.max(0, lastLine.length - 1)
    const isAtBufferEnd = nextPos.row === lastRow && nextPos.col === bufferEndCol
    if (isAtBufferEnd && nextPos.row === pos.row) {
      // Delete to end of current line (including last char)
      const line = buffer[pos.row] ?? ''
      return { row: pos.row, col: line.length }
    }
    pos = nextPos
  }
  return pos
}

/**
 * Execute an operator (d, c, y) paired with a motion.
 */
function executeOperator(
  state: VimState,
  operator: 'd' | 'c' | 'y',
  motion: string,
  count: number,
): VimState {
  const { cursor, buffer } = state

  // ── Linewise operations: dd / cc / yy ─────────────────────────────────────
  if (motion === 'd' || motion === 'y' || motion === 'c') {
    const yankContent = buffer[cursor.row] ?? ''

    if (operator === 'y') {
      return {
        ...state,
        register: yankContent,
        registerType: 'line',
        pendingOperator: null,
        pendingCount: null,
        lastAction: { type: 'operator', operator, motion, count },
      }
    }

    // 'd' or 'c': delete the line
    let newBuffer: string[]
    let newRow: number

    if (buffer.length === 1) {
      newBuffer = ['']
      newRow = 0
    } else {
      newBuffer = [...buffer]
      newBuffer.splice(cursor.row, 1)
      newRow = Math.min(cursor.row, newBuffer.length - 1)
    }

    const newCursor = { row: newRow, col: clampCol(0, newBuffer[newRow] ?? '') }

    return {
      ...state,
      buffer: newBuffer,
      cursor: operator === 'c' ? { row: cursor.row > newBuffer.length - 1 ? newBuffer.length - 1 : cursor.row, col: 0 } : newCursor,
      register: yankContent,
      registerType: 'line',
      mode: operator === 'c' ? 'insert' : 'normal',
      pendingOperator: null,
      pendingCount: null,
      insertedText: operator === 'c' ? '' : state.insertedText,
      lastAction: { type: 'operator', operator, motion, count: 1 },
    }
  }

  // ── Charwise motions ────────────────────────────────────────────────────────

  // Use operator-specific word end for 'w'
  // (c: word-end semantics; d: includes trailing space, deletes to EOL at last word)
  let endPos: { row: number; col: number } | null
  if (motion === 'w') {
    endPos = computeWordMotionForOperator(buffer, cursor, count, operator)
  } else {
    endPos = computeMotionEnd(buffer, cursor, motion, count)
  }

  if (endPos === null) {
    return { ...state, pendingOperator: null, pendingCount: null }
  }

  const startRow = cursor.row
  const startCol = cursor.col
  const endRow = endPos.row
  const endCol = endPos.col

  // Shared result builder: operator result on same row with charwise register.
  const mkResult = (
    newBuffer: string[],
    newCursorCol: number,
    deletedText: string,
  ): VimState => ({
    ...state,
    buffer: newBuffer,
    cursor: { row: startRow, col: newCursorCol },
    register: deletedText,
    registerType: 'char',
    mode: operator === 'c' ? 'insert' : 'normal',
    pendingOperator: null,
    pendingCount: null,
    insertedText: operator === 'c' ? '' : state.insertedText,
    lastAction: { type: 'operator', operator, motion, count },
  })

  if (operator === 'y') {
    // Yank: no buffer modification
    let yankText = ''
    if (startRow === endRow) {
      const line = buffer[startRow] ?? ''
      yankText = line.slice(Math.min(startCol, endCol), Math.max(startCol, endCol))
    }
    return mkResult(buffer, startCol, yankText)
  }

  // 'd' and 'c' operators: modify buffer

  if (motion === '$') {
    // '$' is inclusive to end of line; cursor for 'd' moves one left after deletion.
    const line = buffer[startRow] ?? ''
    const deletedText = line.slice(startCol)
    const newBuffer = [...buffer]
    newBuffer[startRow] = line.slice(0, startCol)
    const finalCol = operator === 'c' ? startCol : Math.max(0, startCol - 1)
    return mkResult(newBuffer, finalCol, deletedText)
  }

  // All other motions: exclusive [startCol, endCol) on same row, or multi-row
  if (startRow === endRow) {
    const line = buffer[startRow] ?? ''
    const fromCol = Math.min(startCol, endCol)
    const toCol = Math.max(startCol, endCol)
    const deletedText = line.slice(fromCol, toCol)
    const newBuffer = [...buffer]
    newBuffer[startRow] = line.slice(0, fromCol) + line.slice(toCol)
    return mkResult(newBuffer, fromCol, deletedText)
  }

  // Multi-row deletion
  const startLine = buffer[startRow] ?? ''
  const endLine = buffer[endRow] ?? ''
  const deletedText = startLine.slice(startCol) + '\n' + endLine.slice(0, endCol)
  const newBuffer = [...buffer]
  newBuffer.splice(startRow, endRow - startRow + 1, startLine.slice(0, startCol) + endLine.slice(endCol))
  return mkResult(newBuffer, startCol, deletedText)
}

// ─── Paste ───────────────────────────────────────────────────────────────────

function executePaste(state: VimState, before: boolean): VimState {
  const { buffer, cursor, register, registerType } = state

  if (register === '') return state

  if (registerType === 'line') {
    const newBuffer = [...buffer]
    const insertRow = before ? cursor.row : cursor.row + 1
    newBuffer.splice(insertRow, 0, register)
    return {
      ...state,
      buffer: newBuffer,
      cursor: { row: insertRow, col: 0 },
    }
  }

  // Charwise paste
  const line = buffer[cursor.row] ?? ''
  let newLine: string
  let newCol: number

  if (before) {
    newLine = line.slice(0, cursor.col) + register + line.slice(cursor.col)
    newCol = cursor.col + register.length - 1
  } else {
    const insertAt = Math.min(cursor.col + 1, line.length)
    newLine = line.slice(0, insertAt) + register + line.slice(insertAt)
    newCol = insertAt + register.length - 1
  }

  const newBuffer = [...buffer]
  newBuffer[cursor.row] = newLine

  return {
    ...state,
    buffer: newBuffer,
    cursor: { row: cursor.row, col: newCol },
  }
}

// ─── Insert mode ─────────────────────────────────────────────────────────────

function processInsertMode(state: VimState, key: string): VimState {
  const { cursor, buffer } = state
  const line = buffer[cursor.row] ?? ''

  if (key === 'Escape') {
    // Clamp to valid normal-mode cursor (not past last char)
    const newCol = line.length === 0 ? 0 : Math.max(0, Math.min(cursor.col, line.length - 1))

    // Store inserted text in lastAction for 'c' operations (dot-repeat)
    const lastAction = state.lastAction
    const updatedLastAction =
      lastAction && lastAction.operator === 'c'
        ? { ...lastAction, text: state.insertedText }
        : lastAction

    return {
      ...state,
      mode: 'normal',
      cursor: { row: cursor.row, col: newCol },
      insertedText: '',
      lastAction: updatedLastAction,
    }
  }

  if (key === 'Backspace') {
    if (cursor.col === 0) return state
    const newLine = line.slice(0, cursor.col - 1) + line.slice(cursor.col)
    const newBuffer = [...buffer]
    newBuffer[cursor.row] = newLine
    return {
      ...state,
      buffer: newBuffer,
      cursor: { row: cursor.row, col: cursor.col - 1 },
      insertedText: state.insertedText.slice(0, -1),
    }
  }

  // Regular character: insert at cursor position
  const newLine = line.slice(0, cursor.col) + key + line.slice(cursor.col)
  const newBuffer = [...buffer]
  newBuffer[cursor.row] = newLine
  return {
    ...state,
    buffer: newBuffer,
    cursor: { row: cursor.row, col: cursor.col + 1 },
    insertedText: state.insertedText + key,
  }
}

// ─── Dot repeat ──────────────────────────────────────────────────────────────

function executeDotRepeat(state: VimState): VimState {
  const { lastAction } = state
  if (!lastAction) return state

  const operator = lastAction.operator as 'd' | 'c' | 'y' | undefined
  if (!operator) return state

  const motion = lastAction.motion ?? ''
  const count = lastAction.count ?? 1

  // Text object motions: 'iw', 'aw', 'i"', 'a"', 'i(', etc.
  if (motion.length === 2 && (motion[0] === 'i' || motion[0] === 'a')) {
    const scope: 'inner' | 'outer' = motion[0] === 'i' ? 'inner' : 'outer'
    const delimiter = motion[1]!

    if (operator === 'c' && lastAction.text !== undefined) {
      let newState = executeTextObject(state, 'c', scope, delimiter)
      for (const ch of lastAction.text) {
        newState = processInsertMode(newState, ch)
      }
      newState = processInsertMode(newState, 'Escape')
      return { ...newState, lastAction }
    }

    return executeTextObject(state, operator, scope, delimiter)
  }

  if (operator === 'c' && lastAction.text !== undefined) {
    // Replay: execute operator then type recorded text
    let newState = executeOperator(state, 'c', motion, count)
    for (const ch of lastAction.text) {
      newState = processInsertMode(newState, ch)
    }
    newState = processInsertMode(newState, 'Escape')
    // Preserve lastAction so dot-repeat remains repeatable
    return { ...newState, lastAction }
  }

  return executeOperator(state, operator, motion, count)
}

// ─── Text Object helpers ──────────────────────────────────────────────────────

/**
 * Range returned by text object finders.
 * All positions are on the same row (charwise) for quote/bracket objects.
 * For paragraph objects, startRow..endRow covers the affected lines.
 */
interface TextObjectRange {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

/**
 * Find inner/outer word boundaries at cursor position.
 * "inner" (iw): the contiguous run of same-type chars under cursor.
 * "outer" (aw): inner word + one adjacent space (trailing preferred).
 */
function findWordTextObject(
  buffer: string[],
  cursor: { row: number; col: number },
  scope: 'inner' | 'outer',
): TextObjectRange | null {
  const line = buffer[cursor.row] ?? ''
  if (line.length === 0) return null

  const col = cursor.col
  const ch = line[col]
  if (ch === undefined) return null

  const curType = tokenType(ch)

  // Find start of the run
  let start = col
  while (start > 0 && tokenType(line[start - 1]!) === curType) {
    start--
  }

  // Find end of the run (exclusive)
  let end = col
  while (end < line.length && tokenType(line[end]!) === curType) {
    end++
  }

  if (scope === 'inner') {
    return { startRow: cursor.row, startCol: start, endRow: cursor.row, endCol: end }
  }

  // outer: add one adjacent space
  // Prefer trailing space
  if (end < line.length && isSpace(line[end]!)) {
    return { startRow: cursor.row, startCol: start, endRow: cursor.row, endCol: end + 1 }
  }
  // No trailing space: consume one leading space
  if (start > 0 && isSpace(line[start - 1]!)) {
    return { startRow: cursor.row, startCol: start - 1, endRow: cursor.row, endCol: end }
  }

  // No adjacent spaces at all
  return { startRow: cursor.row, startCol: start, endRow: cursor.row, endCol: end }
}

/**
 * Find inner range for a matching pair (quotes or brackets).
 * For brackets: walks outward from cursor to find the innermost enclosing pair.
 * For quotes: scans left then right on the current line.
 * Returns the range of content BETWEEN the delimiters (exclusive of the delimiters).
 */
function findPairTextObject(
  buffer: string[],
  cursor: { row: number; col: number },
  open: string,
  close: string,
): TextObjectRange | null {
  const line = buffer[cursor.row] ?? ''
  const col = cursor.col

  if (open === close) {
    return findQuoteTextObject(line, cursor.row, col, open)
  }

  // Bracket handling: find innermost enclosing pair by walking left to find '('
  // then right to find matching ')'
  let depth = 0
  let openCol = -1

  // Walk left from cursor (inclusive) to find the opening bracket
  for (let c = col; c >= 0; c--) {
    const ch = line[c]!
    if (ch === close) {
      depth++
    } else if (ch === open) {
      if (depth === 0) {
        openCol = c
        break
      }
      depth--
    }
  }

  if (openCol === -1) return null

  // Walk right from openCol+1 to find matching close
  depth = 0
  let closeCol = -1
  for (let c = openCol + 1; c < line.length; c++) {
    const ch = line[c]!
    if (ch === open) {
      depth++
    } else if (ch === close) {
      if (depth === 0) {
        closeCol = c
        break
      }
      depth--
    }
  }

  if (closeCol === -1) return null

  // Verify cursor is inside (openCol < cursor.col < closeCol)
  // OR cursor is on the open/close bracket itself
  if (col < openCol || col > closeCol) return null

  return {
    startRow: cursor.row,
    startCol: openCol + 1,
    endRow: cursor.row,
    endCol: closeCol,
  }
}

/**
 * Find inner range for quote text objects on a single line.
 * Pairs up consecutive quote positions; returns the range that contains cursor.
 * If cursor is outside any pair, returns null.
 */
function findQuoteTextObject(
  line: string,
  row: number,
  col: number,
  quote: string,
): TextObjectRange | null {
  const positions: number[] = []
  for (let i = 0; i < line.length; i++) {
    if (line[i] === quote) positions.push(i)
  }

  if (positions.length < 2) return null

  for (let i = 0; i + 1 < positions.length; i += 2) {
    const openQ = positions[i]!
    const closeQ = positions[i + 1]!
    if (col >= openQ && col <= closeQ) {
      return { startRow: row, startCol: openQ + 1, endRow: row, endCol: closeQ }
    }
  }

  return null
}

/**
 * Find the paragraph boundaries at the cursor row.
 * A paragraph is a maximal run of non-blank lines.
 * Blank = empty or only whitespace.
 */
function isBlankLine(line: string): boolean {
  return line.trim() === ''
}

function findParagraphBounds(
  buffer: string[],
  cursorRow: number,
): { paraStart: number; paraEnd: number } {
  // If cursor is on a blank line, treat it as a one-line "paragraph"
  if (isBlankLine(buffer[cursorRow] ?? '')) {
    return { paraStart: cursorRow, paraEnd: cursorRow }
  }

  let paraStart = cursorRow
  while (paraStart > 0 && !isBlankLine(buffer[paraStart - 1] ?? '')) {
    paraStart--
  }

  let paraEnd = cursorRow
  while (paraEnd < buffer.length - 1 && !isBlankLine(buffer[paraEnd + 1] ?? '')) {
    paraEnd++
  }

  return { paraStart, paraEnd }
}

/**
 * Delete a range of lines from buffer and build the resulting VimState.
 * Used by both `dip` and `dap`.
 */
function applyLinewiseDelete(
  state: VimState,
  operator: 'd' | 'c' | 'y',
  motionName: string,
  delStart: number,
  delEnd: number,
): VimState {
  const newBuffer = [...state.buffer]
  const deleted = newBuffer.splice(delStart, delEnd - delStart + 1)
  const finalBuffer = newBuffer.length === 0 ? [''] : newBuffer
  const newRow = Math.min(delStart, finalBuffer.length - 1)
  return {
    ...state,
    pendingOperator: null,
    pendingCount: null,
    pendingMotion: [],
    buffer: finalBuffer,
    cursor: { row: newRow, col: 0 },
    register: deleted.join('\n'),
    registerType: 'line',
    mode: operator === 'c' ? 'insert' : 'normal',
    insertedText: operator === 'c' ? '' : state.insertedText,
    lastAction: { type: 'operator', operator, motion: motionName, count: 1 },
  }
}

/**
 * Execute a text object operation: operator + scope ('inner'|'outer') + delimiter.
 * Returns the new state after applying the operator.
 */
function executeTextObject(
  state: VimState,
  operator: 'd' | 'c' | 'y',
  scope: 'inner' | 'outer',
  delimiter: string,
): VimState {
  const { buffer, cursor } = state
  const motionName = (scope === 'inner' ? 'i' : 'a') + delimiter
  const clearPending = { pendingOperator: null as null, pendingCount: null as null, pendingMotion: [] as string[] }

  // ── Paragraph text objects (ip / ap) ─────────────────────────────────────
  if (delimiter === 'p') {
    const { paraStart, paraEnd } = findParagraphBounds(buffer, cursor.row)

    if (scope === 'inner') {
      return applyLinewiseDelete(state, operator, motionName, paraStart, paraEnd)
    }

    // dap: delete paragraph + trailing blank lines
    let delEnd = paraEnd
    while (delEnd + 1 < buffer.length && isBlankLine(buffer[delEnd + 1] ?? '')) {
      delEnd++
    }
    return applyLinewiseDelete(state, operator, motionName, paraStart, delEnd)
  }

  // ── Word text objects (iw / aw) ───────────────────────────────────────────
  if (delimiter === 'w') {
    const range = findWordTextObject(buffer, cursor, scope)
    if (range === null) {
      return { ...state, ...clearPending }
    }

    const line = buffer[range.startRow] ?? ''
    const deletedText = line.slice(range.startCol, range.endCol)
    const newLine = line.slice(0, range.startCol) + line.slice(range.endCol)
    const newBuffer = [...buffer]
    newBuffer[range.startRow] = newLine
    const newCol = range.startCol

    if (operator === 'y') {
      return {
        ...state,
        ...clearPending,
        register: deletedText,
        registerType: 'char',
        lastAction: { type: 'operator', operator, motion: motionName, count: 1 },
      }
    }

    return {
      ...state,
      ...clearPending,
      buffer: newBuffer,
      cursor: { row: range.startRow, col: Math.max(0, newCol) },
      register: deletedText,
      registerType: 'char',
      mode: operator === 'c' ? 'insert' : 'normal',
      insertedText: operator === 'c' ? '' : state.insertedText,
      lastAction: { type: 'operator', operator, motion: motionName, count: 1 },
    }
  }

  // ── Quote and bracket text objects ────────────────────────────────────────
  const pairMap: Record<string, { open: string; close: string }> = {
    '"': { open: '"', close: '"' },
    "'": { open: "'", close: "'" },
    '(': { open: '(', close: ')' },
    ')': { open: '(', close: ')' },
    '[': { open: '[', close: ']' },
    ']': { open: '[', close: ']' },
    '{': { open: '{', close: '}' },
    '}': { open: '{', close: '}' },
  }

  const pair = pairMap[delimiter]
  if (!pair) {
    return { ...state, ...clearPending }
  }

  const range = findPairTextObject(buffer, cursor, pair.open, pair.close)
  if (range === null) {
    return { ...state, ...clearPending }
  }

  const line = buffer[range.startRow] ?? ''
  const deletedText = line.slice(range.startCol, range.endCol)
  const newLine = line.slice(0, range.startCol) + line.slice(range.endCol)
  const newBuffer = [...buffer]
  newBuffer[range.startRow] = newLine
  const newCursorCol = range.startCol

  if (operator === 'y') {
    return {
      ...state,
      ...clearPending,
      register: deletedText,
      registerType: 'char',
      lastAction: { type: 'operator', operator, motion: motionName, count: 1 },
    }
  }

  return {
    ...state,
    ...clearPending,
    buffer: newBuffer,
    cursor: { row: range.startRow, col: newCursorCol },
    register: deletedText,
    registerType: 'char',
    mode: operator === 'c' ? 'insert' : 'normal',
    insertedText: operator === 'c' ? '' : state.insertedText,
    lastAction: { type: 'operator', operator, motion: motionName, count: 1 },
  }
}

// ─── Normal mode ─────────────────────────────────────────────────────────────

function processKeyNormal(state: VimState, key: string): VimState {
  const { cursor, buffer } = state
  const lastRow = buffer.length - 1

  // Pending search accumulation (/ and ?)
  if (
    state.pendingMotion.length > 0 &&
    (state.pendingMotion[0] === '/' || state.pendingMotion[0] === '?')
  ) {
    if (key === 'Enter') {
      const dir = state.pendingMotion[0] === '/' ? 'forward' : 'backward'
      const pattern = state.pendingMotion.slice(1).join('')
      if (!pattern) return { ...state, pendingMotion: [] }
      const newState = { ...state, searchPattern: pattern, pendingMotion: [] }
      return executeSearch(newState, dir)
    }
    if (key === 'Escape') {
      return { ...state, pendingMotion: [] }
    }
    return { ...state, pendingMotion: [...state.pendingMotion, key] }
  }

  // Pending two-key find motions (f/F/t/T)
  if (state.pendingMotion.length > 0) {
    const pending = state.pendingMotion[0]!
    if (pending === 'f' || pending === 'F' || pending === 't' || pending === 'T') {
      const direction: 'forward' | 'backward' = (pending === 'f' || pending === 't') ? 'forward' : 'backward'
      const till = pending === 't' || pending === 'T'
      return executeFindMotion(state, key, direction, till)
    }

    // Text object pending: operator + scope ('i'/'a') + delimiter key
    if ((pending === 'i' || pending === 'a') && state.pendingOperator !== null) {
      const op = state.pendingOperator as 'd' | 'c' | 'y'
      const scope: 'inner' | 'outer' = pending === 'i' ? 'inner' : 'outer'
      return executeTextObject(
        { ...state, pendingMotion: [], pendingOperator: null, pendingCount: null },
        op,
        scope,
        key,
      )
    }
  }

  // Operator pending: next key is the motion (or same key for linewise)
  if (state.pendingOperator !== null) {
    const op = state.pendingOperator as 'd' | 'c' | 'y'
    const count = state.pendingCount ?? 1

    // Accumulate digits while in operator-pending mode
    if (/^[0-9]$/.test(key) && !(key === '0' && state.pendingCount === null)) {
      const digit = parseInt(key, 10)
      const newCount = state.pendingCount === null ? digit : state.pendingCount * 10 + digit
      return { ...state, pendingCount: newCount }
    }

    // Same key twice = linewise (dd, yy, cc)
    if (key === op) {
      return executeOperator({ ...state, pendingCount: null }, op, op, 1)
    }

    // Text object scope: 'i' or 'a' followed by delimiter
    if (key === 'i' || key === 'a') {
      return { ...state, pendingMotion: [key] }
    }

    // Recognized motion keys
    const motionKeys = ['w', 'b', 'e', '$', '0', '^', 'h', 'l', 'j', 'k']
    if (motionKeys.includes(key)) {
      return executeOperator({ ...state, pendingCount: null }, op, key, count)
    }

    // Unknown key cancels pending operator
    return { ...state, pendingOperator: null, pendingCount: null }
  }

  switch (key) {
    case 'h': {
      return { ...state, cursor: { row: cursor.row, col: Math.max(0, cursor.col - 1) } }
    }
    case 'l': {
      const line = buffer[cursor.row] ?? ''
      const maxCol = Math.max(0, line.length - 1)
      return { ...state, cursor: { row: cursor.row, col: Math.min(maxCol, cursor.col + 1) } }
    }
    case 'j': {
      const newRow = Math.min(lastRow, cursor.row + 1)
      const newCol = clampCol(cursor.col, buffer[newRow] ?? '')
      return { ...state, cursor: { row: newRow, col: newCol } }
    }
    case 'k': {
      const newRow = Math.max(0, cursor.row - 1)
      const newCol = clampCol(cursor.col, buffer[newRow] ?? '')
      return { ...state, cursor: { row: newRow, col: newCol } }
    }
    case 'w': {
      return { ...state, cursor: moveWordForward(buffer, cursor) }
    }
    case 'b': {
      return { ...state, cursor: moveWordBackward(buffer, cursor) }
    }
    case 'e': {
      return { ...state, cursor: moveWordEnd(buffer, cursor) }
    }
    case '0': {
      return { ...state, cursor: { row: cursor.row, col: 0 } }
    }
    case '^': {
      const line = buffer[cursor.row] ?? ''
      return { ...state, cursor: { row: cursor.row, col: firstNonWhitespaceCol(line) } }
    }
    case '$': {
      const line = buffer[cursor.row] ?? ''
      const col = Math.max(0, line.length - 1)
      return { ...state, cursor: { row: cursor.row, col } }
    }
    case 'G': {
      return { ...state, cursor: { row: lastRow, col: 0 } }
    }
    case 'g': {
      if (state.pendingMotion.includes('g')) {
        return { ...state, cursor: { row: 0, col: 0 }, pendingMotion: [] }
      }
      return { ...state, pendingMotion: ['g'] }
    }
    case 'f':
    case 'F':
    case 't':
    case 'T': {
      return { ...state, pendingMotion: [key] }
    }
    case '/': {
      return { ...state, pendingMotion: ['/'] }
    }
    case '?': {
      return { ...state, pendingMotion: ['?'] }
    }
    case 'n': {
      return executeSearch(state, 'forward')
    }
    case 'N': {
      return executeSearch(state, 'backward')
    }
    case ';': {
      if (!state.lastFindChar || !state.lastFindDirection) return state
      return executeFindMotion(state, state.lastFindChar, state.lastFindDirection, state.lastFindTill)
    }
    case ',': {
      if (!state.lastFindChar || !state.lastFindDirection) return state
      const reversed: 'forward' | 'backward' = state.lastFindDirection === 'forward' ? 'backward' : 'forward'
      return executeFindMotion(state, state.lastFindChar, reversed, state.lastFindTill)
    }
    case 'd':
    case 'c':
    case 'y': {
      return { ...state, pendingOperator: key, pendingCount: null }
    }
    case 'p': {
      return executePaste(state, false)
    }
    case 'P': {
      return executePaste(state, true)
    }
    case '.': {
      return executeDotRepeat(state)
    }
    default:
      return state
  }
}

export function processKey(state: VimState, key: string): VimState {
  // Insert mode: all keys go to insert handler
  if (state.mode === 'insert') {
    return processInsertMode(state, key)
  }

  // Normal mode: accumulate digits into pendingCount.
  // '0' only joins count when count already started.
  // Skip digit accumulation if operator is pending.
  if (
    (/^[1-9]$/.test(key) || (key === '0' && state.pendingCount !== null)) &&
    state.pendingOperator === null
  ) {
    const digit = parseInt(key, 10)
    const newCount = state.pendingCount === null ? digit : state.pendingCount * 10 + digit
    return { ...state, pendingCount: newCount }
  }

  const count = state.pendingCount ?? 1
  const stateWithReset = { ...state, pendingCount: null }

  // G with explicit count: jump to 1-indexed line
  if (key === 'G' && state.pendingCount !== null) {
    const targetRow = Math.min(count - 1, state.buffer.length - 1)
    return { ...stateWithReset, cursor: { row: targetRow, col: 0 } }
  }

  // When operator is pending, pass directly to processKeyNormal (it handles its own count)
  if (state.pendingOperator !== null) {
    return processKeyNormal(state, key)
  }

  // Apply motion `count` times
  let result: VimState = stateWithReset
  for (let i = 0; i < count; i++) {
    result = processKeyNormal(result, key)
  }
  return result
}
