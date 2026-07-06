const USABLE_STATUSES = ['draft', 'approved']

export function isUsable(status) {
  return USABLE_STATUSES.includes(status)
}

export function isDraft(status) {
  return status === 'draft'
}

export function isApproved(status) {
  return status === 'approved'
}

export function isSuperseded(status) {
  return status === 'superseded'
}

export function isArchived(status) {
  return status === 'archived'
}

export function isGenerating(status) {
  return status === 'generating'
}

export function isFailed(status) {
  return status === 'failed'
}
