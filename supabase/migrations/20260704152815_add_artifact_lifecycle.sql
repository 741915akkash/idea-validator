ALTER TABLE artifacts
ADD COLUMN status text NOT NULL DEFAULT 'draft';

ALTER TABLE artifacts
ADD COLUMN revision_number integer NOT NULL DEFAULT 1;

ALTER TABLE artifacts
ADD COLUMN superseded_by uuid NULL
REFERENCES artifacts(id);

ALTER TABLE artifacts
ADD COLUMN approved_by uuid NULL;

ALTER TABLE artifacts
ADD COLUMN approved_at timestamptz NULL;

CREATE INDEX idx_artifacts_status
ON artifacts(status);

CREATE INDEX idx_artifacts_revision
ON artifacts(workspace_id, type, revision_number);

CREATE INDEX idx_artifacts_superseded_by
ON artifacts(superseded_by);