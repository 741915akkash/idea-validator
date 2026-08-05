CREATE TABLE artifact_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    artifact_id UUID NOT NULL
        REFERENCES artifacts(id)
        ON DELETE CASCADE,

    decision TEXT NOT NULL
        CHECK (
            decision IN (
                'approved',
                'needs_improvement'
            )
        ),

    feedback TEXT,

    reviewed_by UUID,

    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artifact_reviews_artifact
ON artifact_reviews (artifact_id);

CREATE INDEX idx_artifact_reviews_reviewed_at
ON artifact_reviews (reviewed_at DESC);