-- Add pipeline relationships

ALTER TABLE pipeline_stages
ADD COLUMN pipeline_id INTEGER REFERENCES pipelines(id) ON DELETE CASCADE;

ALTER TABLE leads
ADD COLUMN pipeline_id INTEGER REFERENCES pipelines(id) ON DELETE SET NULL;

CREATE INDEX idx_pipeline_stages_pipeline_id
ON pipeline_stages(pipeline_id);

CREATE INDEX idx_leads_pipeline_id
ON leads(pipeline_id);