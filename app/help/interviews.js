// interviews.js
export default {
  title: 'Interviews',

  subtitle: 'Collect real-world evidence through structured conversations.',

  purpose:
    'This page helps you conduct, organize, and review interviews so you can validate assumptions using direct user feedback instead of intuition.',

  workflow: {
    nodes: [
      {
        id: '1',
        label: 'Click Quick interview'
      },
      {
        id: '2',
        label: 'Interview Screen appears'
      },
      {
        id: '3',
        label: 'Fill the respondent info, hide or view with button'
      },
      {
        id: '4',
        label: 'Fill the title, tags'
      },
      {
        id: '5',
        label: 'Record the notes in interview notes panel'
      },
      {
        id: '6',
        label: 'Record the evidence in evidence panel'
      }
    ],

    edges: [
      ['1', '2'],
      ['2', '3'],
      ['3', '4'],
      ['4', '5'],
      ['5', '6']
    ]
  },

  bestPractices: [
    'Ask about real past behavior instead of hypothetical actions.',
    'Record exact wording for important responses.',
    'Follow up on conflicting signals in later interviews.'
  ],

  related: [
    {
      label: 'Overview',
      to: '/quiz/overview'
    },
    {
      label: 'Structured Validation',
      to: '/quiz/master-detail'
    }
  ]
}
