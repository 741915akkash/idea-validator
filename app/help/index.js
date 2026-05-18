import overview from './overview'
import interviews from './interviews'
import score from './score'
import history from './history'
import masterDetail from './master-detail'
import leadsPageContent from './leads-page-content'
import editorHeader from './editor-header'
import sequenceList from './sequence-list'

export const helpRegistry = {
  overview,
  interviews,
  score,
  history,
  'master-detail': masterDetail,
  'leads-page-content': leadsPageContent,
  'editor-header': editorHeader,
  'sequence-list': sequenceList
}
