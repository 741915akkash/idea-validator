export default {
  title: 'Score',

  subtitle: 'Understand your validation strength, market signal, and confidence trends.',

  purpose:
    'This page summarizes your idea score, checkpoint performance, and revision-level improvements so you can evaluate whether your idea is strengthening over time.',

  workflow: [
    'Review market and confidence scores.',
    'Identify weak checkpoints and low-signal areas.',
    'Compare revisions to evaluate whether changes improved results.'
  ],

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
