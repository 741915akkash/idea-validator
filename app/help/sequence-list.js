// sequence-list.js
export default {
  title: 'Sequences',

  subtitle: 'Create structured outreach workflows for consistent follow-ups.',

  purpose:
    'Sequences help you automate and standardize outreach through timed calls, emails, and follow-up actions across the lead lifecycle.',

  workflow: {
    nodes: [
      {
        id: 'create',
        label: 'Create sequence'
      },
      {
        id: 'define',
        label: 'Define steps'
      },
      {
        id: 'schedule',
        label: 'Set timing'
      },
      {
        id: 'apply',
        label: 'Apply to leads'
      }
    ],

    edges: [
      ['create', 'define'],
      ['define', 'schedule'],
      ['schedule', 'apply']
    ]
  },

  bestPractices: [
    'Keep steps concise and outcome-focused.',
    'Allow realistic spacing between follow-ups.',
    'Continuously refine low-performing steps.'
  ],

  related: [
    {
      label: 'CRM',
      to: '/crm'
    },
    {
      label: 'Leads',
      to: '/crm'
    },
    {
      label: 'Edit Sequence',
      to: '/crm/sequences'
    }
  ]
}
