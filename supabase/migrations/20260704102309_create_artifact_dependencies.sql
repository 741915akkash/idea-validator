CREATE TABLE artifact_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_artifact_id uuid NOT NULL
        REFERENCES artifacts(id)
        ON DELETE CASCADE,

    child_artifact_id uuid NOT NULL
        REFERENCES artifacts(id)
        ON DELETE CASCADE,

    relationship text NOT NULL DEFAULT 'derived-from',

    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT artifact_dependencies_unique
        UNIQUE (
            parent_artifact_id,
            child_artifact_id,
            relationship
        )
);

CREATE INDEX idx_artifact_dependencies_parent
ON artifact_dependencies(parent_artifact_id);

CREATE INDEX idx_artifact_dependencies_child
ON artifact_dependencies(child_artifact_id);