// leads-page-content.js
export default {
  title: 'CRM',

  subtitle: 'Manage leads, stage progression, and follow-up momentum.',

  purpose:
    'This page centralizes lead management across kanban and table views so you can track relationships, pipeline progress, and outreach activity.',

  workflow: {
    nodes: [
      // GROUP 1
      {
        id: '1',
        label: 'Click Add Lead'
      },
      {
        id: '2',
        label: 'Form appears'
      },
      {
        id: '3',
        label: 'Fill the form'
      },
      {
        id: '4',
        label: 'Lead shown in table'
      },

      // GROUP 2
      {
        id: '5',
        label: 'Click stage button in lead row'
      },
      {
        id: '6',
        label: 'Select stage from dropdown'
      },
      {
        id: '7',
        label: 'Search name, company, email, phone, activities in search bar'
      },
      {
        id: '8',
        label: 'Use filter button for stage, owner, source, sequence'
      },
      {
        id: '9',
        label: 'Use view button to show or hide columns'
      },

      // GROUP 3
      {
        id: '10',
        label: 'Click Kanban button to see Kanban view'
      },
      {
        id: '11',
        label: 'Click Sequences button to view follow-up sequences'
      }
    ],

    edges: [
      // GROUP 1
      ['1', '2'],
      ['2', '3'],
      ['3', '4'],

      // GROUP 2
      ['5', '6'],
      ['7'],
      ['8'],
      ['9'],

      // GROUP 3
      ['10', '11']
    ]
  },

  bestPractices: [
    'Keep stage definitions clear and measurable.',
    'Update lead status immediately after interactions.',
    'Use kanban for flow visibility and tables for detailed review.'
  ],

  related: [
    {
      label: 'Interviews',
      to: '/quiz/interviews'
    },
    {
      label: 'Sequences',
      to: '/crm/sequences'
    },
    {
      label: 'Overview',
      to: '/quiz/overview'
    }
  ]
}
