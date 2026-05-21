// score.js
export default {
  title: 'Score',

  subtitle: 'Understand your validation strength, market signal, and confidence trends.',

  purpose:
    'This page summarizes your idea score, checkpoint performance, and revision-level improvements so you can evaluate whether your idea is strengthening over time.',

  workflow: {
    nodes: [
      {
        id: 'review',
        label: 'Review scores'
      },
      {
        id: 'identify',
        label: 'Identify weak areas'
      },
      {
        id: 'compare',
        label: 'Compare revisions'
      },
      {
        id: 'improve',
        label: 'Improve validation'
      }
    ],

    edges: [
      ['review', 'identify'],
      ['identify', 'compare'],
      ['compare', 'improve'],
      ['improve', 'review']
    ]
  },


  bestPractices: [
    'Focus on the weakest checkpoint before optimizing strong areas.',
    'Support score improvements with interview evidence.',
    'Test one major improvement per revision for clearer learning.'
  ],

  related: [
    {
      label: 'Overview',
      to: '/quiz/overview'
    },
    {
      label: 'History',
      to: '/quiz/history?quiz_id=${quizId}'
    },
    {
      label: 'Interviews',
      to: '/quiz/interviews'
    }
  ]
}
