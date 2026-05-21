// history.js
export default {
  title: 'History',

  subtitle: 'Track how your idea evolves across revisions.',

  purpose:
    'This page compares revisions, score changes, and answer updates so you can measure whether your validation quality is improving over time.',

  workflow: {
    nodes: [
      {
        id: 'compare',
        label: 'Compare revisions'
      },
      {
        id: 'review',
        label: 'Review changes'
      },
      {
        id: 'evaluate',
        label: 'Evaluate trends'
      },
      {
        id: 'inspect',
        label: 'Inspect revision'
      }
    ],

    edges: [
      ['compare', 'review'],
      ['review', 'evaluate'],
      ['evaluate', 'inspect']
    ]
  },

  bestPractices: [
    'Look for consistent improvement patterns over time.',
    'Tie each revision to a specific learning goal or hypothesis.',
    'Review previous weak areas before creating another revision.'
  ],

  related: [
    {
      label: 'Overview',
      to: '/quiz/overview'
    },
    {
      label: 'Score',
      to: '/quiz/score?quiz_id=${requestedQuizId}'
    },
    {
      label: 'Interviews',
      to: '/quiz/interviews'
    }
  ]
}
