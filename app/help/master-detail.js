// master-detail.js
export default {
  title: 'Structured Validation',

  subtitle: 'Resolve uncertainties through structured validation workflows.',

  purpose:
    'This page breaks large uncertainties into smaller, testable sub-uncertainties and connects them directly to interview execution and evidence collection.',

  workflow: {
    nodes: [
      {
        id: '1',
        label: 'Select uncertainty'
      },
      {
        id: '2',
        label: 'Review sub-uncertainties'
      },
      {
        id: '3',
        label: 'Run interviews'
      },
      {
        id: '4',
        label: 'See interview analytics'
      }
    ],

    edges: [
      ['1', '2'],
      ['2', '3'],
      ['3', '4']
    ]
  },

  bestPractices: [
    'Keep uncertainty statements clear and testable.',
    'Interview multiple respondents before drawing conclusions.',
    'Use analytics only after gathering sufficient interview evidence.'
  ],

  related: [
    {
      label: 'Interviews',
      to: '/quiz/interviews'
    },
    {
      label: 'Overview',
      to: '/quiz/overview'
    }
  ]
}
