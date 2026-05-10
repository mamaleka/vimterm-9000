import type { BossDefinition } from '../types/boss'

export const bosses: BossDefinition[] = [
  {
    id: 'arrow-key-phantom',
    name: 'The Arrow Key Phantom',
    zone: 1,
    asciiArt: `
  ╭─────────────────╮
  │   ↑ ↓ ← →       │
  │   ???           │
  │  /   \\          │
  │ │ ◎ ◎ │         │
  │  \\ _ /          │
  │   | |           │
  │   | |           │
  ╰─────────────────╯
    `,
    stages: [
      {
        id: 'phantom-stage-1',
        type: 'bossStage',
        initialBuffer: ['Navigate the maze', 'using hjkl only', 'Arrow keys blocked!'],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 2, col: 18 },
        },
        allowedMotions: ['h', 'j', 'k', 'l'],
        parTime: 15,
      },
      {
        id: 'phantom-stage-2',
        type: 'bossStage',
        initialBuffer: ['Move with', 'word motions', 'w b e now!'],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 2, col: 10 },
        },
        allowedMotions: ['h', 'j', 'k', 'l', 'w', 'b', 'e'],
        parTime: 12,
      },
      {
        id: 'phantom-stage-3',
        type: 'bossStage',
        initialBuffer: ['Jump to line start', 'middle and end', '^ $ master!'],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 2, col: 10 },
        },
        allowedMotions: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$'],
        parTime: 10,
      },
      {
        id: 'phantom-stage-4',
        type: 'bossStage',
        initialBuffer: ['File extremes', 'gg to start', 'G to end'],
        initialCursor: { row: 1, col: 0 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 2, col: 0 },
        },
        allowedMotions: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G'],
        parTime: 8,
      },
    ],
    dialogue: {
      wrongKey: [
        'You pressed an arrow key! Ha!',
        'Those ancient keys won\'t help you here.',
        'HJKL or nothing, learner!',
      ],
      timeout: [
        'Time\'s running out...',
        'Your cursor falters...',
        'The phantom grows impatient!',
      ],
      stageCleared: [
        'Impressive... but there\'s more.',
        'One barrier down.',
        'The phantom recoils!',
      ],
      defeat: [
        'You have fallen to the phantom.',
        'Your journey ends here... for now.',
        'The arrow keys may return.',
      ],
    },
  },
  {
    id: 'grep-golem',
    name: 'The Grep Golem',
    zone: 2,
    asciiArt: `
  ╭──────────────────╮
  │                  │
  │    ╔════════╗    │
  │    ║ [GREP] ║    │
  │    ║ / ? n  ║    │
  │    ║  / \\   ║    │
  │    ║ |  |   ║    │
  │    ╚════════╝    │
  │                  │
  ╰──────────────────╯
    `,
    stages: [
      {
        id: 'golem-stage-1',
        type: 'bossStage',
        initialBuffer: ['Find the pattern', 'somewhere here', 'with forward slash'],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['Find the pattern', 'somewhere here', 'with forward slash'],
        },
        allowedMotions: ['f', 'F', 't', 'T', ';', ','],
        parTime: 14,
      },
      {
        id: 'golem-stage-2',
        type: 'bossStage',
        initialBuffer: [
          'Search the text',
          'for the target word',
          'use / or ? to find',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['Search the text', 'for the target word', 'use / or ? to find'],
        },
        allowedMotions: ['f', 'F', 't', 'T', ';', ',', '/', '?', 'n', 'N'],
        parTime: 12,
      },
      {
        id: 'golem-stage-3',
        type: 'bossStage',
        initialBuffer: [
          'Jump through history',
          'Ctrl-o goes back',
          'Ctrl-i goes forward',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: [
            'Jump through history',
            'Ctrl-o goes back',
            'Ctrl-i goes forward',
          ],
        },
        allowedMotions: ['/', '?', 'n', 'N', 'Ctrl-o', 'Ctrl-i'],
        parTime: 13,
      },
    ],
    dialogue: {
      wrongKey: [
        'That\'s not a search.',
        'Wrong key, searcher.',
        'Try again!',
      ],
      timeout: [
        'The pattern fades...',
        'Search harder!',
        'Time slips away...',
      ],
      stageCleared: [
        'You found it.',
        'The golem trembles.',
        'One more pattern awaits.',
      ],
      defeat: [
        'The golem crushes you.',
        'Your search ends here.',
        'Try again later.',
      ],
    },
  },
  {
    id: 'syntax-serpent',
    name: 'The Syntax Serpent',
    zone: 3,
    asciiArt: `
  ╭──────────────────╮
  │   ~~~~>~~~~~~    │
  │  ~~ SYNTAX ~~    │
  │ ~~ d c y p . ~~  │
  │  ~~ > < ~ ~~     │
  │   ~~~~<~~~~~~    │
  │                  │
  ╰──────────────────╯
    `,
    stages: [
      {
        id: 'serpent-stage-1',
        type: 'bossStage',
        initialBuffer: [
          'Delete the error...',
          'dw removes a word',
          'Can you fix this?',
        ],
        initialCursor: { row: 1, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['Delete the error...', 'removes a word', 'Can you fix this?'],
        },
        allowedMotions: ['d', 'w'],
        parTime: 10,
      },
      {
        id: 'serpent-stage-2',
        type: 'bossStage',
        initialBuffer: [
          'Change this word',
          'to something else',
          'use c to change',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['Changed this word', 'to something else', 'use c to change'],
        },
        allowedMotions: ['c', 'w'],
        parTime: 11,
      },
      {
        id: 'serpent-stage-3',
        type: 'bossStage',
        initialBuffer: [
          'Yank this line',
          'then paste here',
          'y and p work well',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: [
            'Yank this line',
            'then paste here',
            'Yank this line',
            'y and p work well',
          ],
        },
        allowedMotions: ['y', 'y', 'p'],
        parTime: 12,
      },
      {
        id: 'serpent-stage-4',
        type: 'bossStage',
        initialBuffer: [
          'Fix . repeat error',
          'Change . repeat error',
          'Fix . repeat error',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: [
            'Fixed',
            'Changed',
            'Fixed',
          ],
        },
        allowedMotions: ['c', 'w', '.'],
        parTime: 14,
      },
    ],
    dialogue: {
      wrongKey: [
        'That\'s not an operator.',
        'Verb + noun, learner!',
        'You must understand grammar.',
      ],
      timeout: [
        'The serpent strikes!',
        'Time fades away...',
        'Syntax coils tighter...',
      ],
      stageCleared: [
        'The grammar holds!',
        'The serpent hisses.',
        'One pattern remains.',
      ],
      defeat: [
        'The serpent consumes you.',
        'Grammar is your weakness.',
        'Learn and return.',
      ],
    },
  },
  {
    id: 'json-jormungandr',
    name: 'The JSON Jormungandr',
    zone: 4,
    asciiArt: `
  ╭───────────────────╮
  │   {              │
  │    "data": {     │
  │      ...         │
  │    }    COILS    │
  │   }  ~~~~)~~~~ │
  │      ~~~~<~~~~  │
  ╰───────────────────╯
    `,
    stages: [
      {
        id: 'jormungandr-stage-1',
        type: 'bossStage',
        initialBuffer: [
          '{"name": "error"}',
          '{"value": 123}',
          'Fix with iw',
        ],
        initialCursor: { row: 0, col: 2 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['{"fixed": "error"}', '{"value": 123}', 'Fix with iw'],
        },
        allowedMotions: ['c', 'i', 'w'],
        parTime: 12,
      },
      {
        id: 'jormungandr-stage-2',
        type: 'bossStage',
        initialBuffer: [
          '{"quote": "bad"}',
          '{"other": "ok"}',
          'Change strings',
        ],
        initialCursor: { row: 0, col: 11 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['{"quote": "good"}', '{"other": "ok"}', 'Change strings'],
        },
        allowedMotions: ['c', 'i', '"'],
        parTime: 13,
      },
      {
        id: 'jormungandr-stage-3',
        type: 'bossStage',
        initialBuffer: [
          '[1, 2, 3, 4]',
          '{"arr": [5]}',
          'Fix brackets',
        ],
        initialCursor: { row: 0, col: 1 },
        successCondition: {
          type: 'bufferEquals',
          expected: ['[10, 20, 30, 40]', '{"arr": [50]}', 'Fix brackets'],
        },
        allowedMotions: ['c', 'i', '[', 'c', 'i', ')'],
        parTime: 15,
      },
    ],
    dialogue: {
      wrongKey: [
        'The JSON resists your ignorance.',
        'Text objects are your key.',
        'Understand the structure.',
      ],
      timeout: [
        'The coils tighten...',
        'The serpent hunts...',
        'Time devours all...',
      ],
      stageCleared: [
        'The structure bends.',
        'Jormungandr weakens.',
        'The end nears.',
      ],
      defeat: [
        'Swallowed by the serpent.',
        'Your journey ends.',
        'Return stronger.',
      ],
    },
  },
  {
    id: 'vim-wraith',
    name: 'The Vim Wraith',
    zone: 5,
    asciiArt: `
  ╭────────────────────╮
  │      . . . .       │
  │    ' WRAITH '      │
  │   m ' \` % { }     │
  │   * # ~ ^ ~ ~ ~    │
  │      ...~~~...     │
  │                    │
  ╰────────────────────╯
    `,
    stages: [
      {
        id: 'wraith-stage-1',
        type: 'bossStage',
        initialBuffer: [
          'Set marks here',
          'ma at this line',
          'Jump back \'a',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: [
            'Set marks here',
            'ma at this line',
            'Jump back \'a',
          ],
        },
        allowedMotions: ['m', 'a', "'", 'a'],
        parTime: 13,
      },
      {
        id: 'wraith-stage-2',
        type: 'bossStage',
        initialBuffer: [
          '(find matching)',
          '[brackets here]',
          '% finds pairs',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'bufferEquals',
          expected: [
            '(find matching)',
            '[brackets here]',
            '% finds pairs',
          ],
        },
        allowedMotions: ['%'],
        parTime: 11,
      },
      {
        id: 'wraith-stage-3',
        type: 'bossStage',
        initialBuffer: [
          'Navigate by',
          'paragraphs here',
          '',
          'Use { and } now',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 3, col: 0 },
        },
        allowedMotions: ['{', '}'],
        parTime: 12,
      },
      {
        id: 'wraith-stage-4',
        type: 'bossStage',
        initialBuffer: [
          'use * to find word',
          'use # to find back',
          'Search with them',
        ],
        initialCursor: { row: 0, col: 4 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 2, col: 15 },
        },
        allowedMotions: ['*', '#'],
        parTime: 11,
      },
      {
        id: 'wraith-stage-5',
        type: 'bossStage',
        initialBuffer: [
          'Master all motions',
          'from every zone',
          'Show the wraith',
          'your true power',
        ],
        initialCursor: { row: 0, col: 0 },
        successCondition: {
          type: 'cursorAt',
          position: { row: 3, col: 10 },
        },
        allowedMotions: [
          'h', 'j', 'k', 'l', 'w', 'b', 'e',
          '0', '^', '$', 'gg', 'G',
          'f', 'F', 't', 'T', ';', ',',
          '/', '?', 'n', 'N',
          'd', 'c', 'y', 'p',
          'i', 'a',
          'm', "'", '%', '{', '}', '*', '#',
        ],
        parTime: 16,
      },
    ],
    dialogue: {
      wrongKey: [
        'The wraith mocks you.',
        'You do not yet understand.',
        'How pitiful.',
      ],
      timeout: [
        'The wraith grows invisible...',
        'Time fades to darkness...',
        'All becomes void...',
      ],
      stageCleared: [
        'The wraith falters!',
        'You grow stronger.',
        'One final test remains.',
      ],
      defeat: [
        'You have been unmade.',
        'The wraith claims victory.',
        'Your legend ends.',
      ],
    },
  },
]
