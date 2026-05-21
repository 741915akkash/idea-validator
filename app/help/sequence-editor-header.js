// editorheader.js
export default {
  title: 'Edit Sequence',

  subtitle: 'Improve and refine an existing outreach workflow.',

  purpose:
    'This page allows you to modify sequence timing, messaging flow, and outreach structure without rebuilding the workflow from scratch.',

  workflow: {
    nodes: [
      {
        id: '1',
        label: 'Review sequence'
      },
      {
        id: '2',
        label: 'Click the type of step to edit (email, call, task)'
      },
      {
        id: '3',
        label: 'Choose one from dropdown'
      },
      {
        id: '4',
        label: 'Click the time button to set day delay'
      },
      {
        id: '5',
        label: 'Choose number of days from dropdown'
      },
      {
        id: '6',
        label: 'Change the heading and body text'
      },
      {
        id: '7',
        label: 'Move the step up or down with arrow buttons'
      },
      {
        id: '8',
        label: 'Delete the step with delete button'
      },
      {
        id: '9',
        label: 'Add new step with Add Workflow Step button'
      }
    ],

    edges: [['1', '2'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '6'], ['7'], ['8'], ['9']]
  },

  bestPractices: [
    'Reduce long delays if lead momentum is dropping.',
    'Maintain consistent messaging across adjacent steps.'
  ],

  related: [
    {
      label: 'Sequences',
      to: '/crm/sequences'
    },
    {
      label: 'CRM',
      to: '/crm'
    },
    {
      label: 'Leads',
      to: '/crm/leads'
    }
  ]
}
