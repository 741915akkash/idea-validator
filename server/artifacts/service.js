import registry from './registry.js'

import { getParents } from '../services/artifacts/get-parents.js'
import { getChildren } from '../services/artifacts/get-children.js'
import { getAncestors } from '../services/artifacts/get-ancestors.js'
import { getDescendants } from '../services/artifacts/get-descendants.js'

function get(id) {
  return registry[id] ?? null
}

function getMany(ids = []) {
  return ids.map((id) => registry[id]).filter(Boolean)
}

function exists(id) {
  return id in registry
}

function validate(artifact) {
  const definition = get(artifact.type)

  if (!definition) {
    return false
  }

  return definition.validate(artifact)
}

function normalize(artifact) {
  const definition = get(artifact.type)

  if (!definition) {
    return null
  }

  return definition.normalize(artifact)
}

function validateAndNormalize(artifact) {
  const definition = get(artifact.type)

  if (!definition) {
    return {
      success: false,
      warning: {
        code: 'UNKNOWN_ARTIFACT_TYPE',
        message: `Unknown artifact type "${artifact.type}".`
      }
    }
  }

  if (!definition.validate(artifact)) {
    return {
      success: false,
      warning: {
        code: 'INVALID_ARTIFACT',
        message: `Artifact "${artifact.type}" failed validation.`
      }
    }
  }

  return {
    success: true,
    artifact: definition.normalize(artifact)
  }
}

function buildPromptSection(ids = []) {
  const artifacts = getMany(ids)

  const allowedTypes = artifacts.map((artifact) => `- ${artifact.id}`).join('\n')

  const descriptions = artifacts
    .map(
      (artifact) => `
### ${artifact.id}

${artifact.description}
`
    )
    .join('\n')

  return `
# Allowed Artifact Types

You may ONLY create these artifact types.

${allowedTypes}

# Artifact Descriptions

${descriptions}
`
}

async function parents(artifactId) {
  return getParents(artifactId)
}

async function children(artifactId) {
  return getChildren(artifactId)
}

async function ancestors(artifactId) {
  return getAncestors(artifactId)
}

async function descendants(artifactId) {
  return getDescendants(artifactId)
}

function isDraft(artifact) {
  return artifact?.status === 'draft'
}

function isApproved(artifact) {
  return artifact?.status === 'approved'
}

function isArchived(artifact) {
  return artifact?.status === 'archived'
}

function isSuperseded(artifact) {
  return artifact?.status === 'superseded'
}

function isUsable(artifact) {
  return artifact && !isArchived(artifact) && !isSuperseded(artifact)
}

function latest(artifacts = []) {
  if (!artifacts.length) {
    return null
  }

  return [...artifacts].sort((a, b) => b.revisionNumber - a.revisionNumber)[0]
}

function latestApproved(artifacts = []) {
  return latest(artifacts.filter(isApproved))
}

function latestUsable(artifacts = []) {
  return latest(artifacts.filter(isUsable))
}

function getLifecycle(id) {
  return get(id)?.lifecycle ?? 'immutable'
}

function isVersioned(id) {
  return getLifecycle(id) === 'versioned'
}

function isImmutable(id) {
  return getLifecycle(id) === 'immutable'
}

export default {
  get,
  getMany,
  exists,
  validate,
  normalize,
  validateAndNormalize,
  buildPromptSection,

  parents,
  children,
  ancestors,
  descendants,

  isDraft,
  isApproved,
  isArchived,
  isSuperseded,
  isUsable,

  latest,
  latestApproved,
  latestUsable,

  getLifecycle,
  isVersioned,
  isImmutable
}
