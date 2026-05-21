export default {
  title: 'Overview',

  subtitle: 'Track validation progress and identify the next highest-priority action.',

  purpose: `This page gives you a complete snapshot of your startup idea validation progress including checkpoints, notes, and revisions.`,

  workflow: {
    nodes: [
      // GRAPH 1
      {
        id: '1',
        label: 'Click Review'
      },
      {
        id: '2',
        label: 'Select options in questions based on assumptions'
      },
      {
        id: '3',
        label: 'Open ASQs to understand questions better'
      },
      {
        id: '4',
        label: 'Type thoughts, findings, and questions in notes panel'
      },
      {
        id: '5',
        label: 'Fill options in all questions'
      },
      {
        id: '6',
        label: 'View Score'
      },

      // GRAPH 2
      {
        id: '7',
        label: 'Update options based on research'
      },
      {
        id: '8',
        label: 'View New Score'
      },
      {
        id: '9',
        label: 'Click history to compare difference'
      }
    ],

    edges: [
      // GRAPH 1
      ['1', '2'],
      ['2', '3'],
      ['3', '4'],
      ['4', '5'],
      ['5', '6'],

      // GRAPH 2
      ['7', '8'],
      ['8', '9']
    ]
  },

  bestPractices: [
    `Quickly select options in questions based on assumptions,
    view score,
    then keep that or select new option with research findings.`,

    `Use relevant forums, reviews, communities, interviews and customer research
    to take notes in questions.`,

    `Think about the most important parts of your business through questions.`
  ],

  related: [
    {
      label: 'Interviews',
      to: '/quiz/interviews'
    },
    {
      label: 'History',
      to: '/quiz/history'
    }
  ]
}
