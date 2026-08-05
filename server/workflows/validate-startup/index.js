import { createWorkflow } from '../create-workflow.js'

export default createWorkflow({
  id: 'validate-startup',
  version: 1,

  name: 'Validate Startup',

  description: 'Research and validate a startup idea.',

  artifacts: ['market-research']
})
