CREATE EXTENSION IF NOT EXISTS vector;
-- Create "answers" table
CREATE TABLE "public"."answers" (
  "id" serial NOT NULL,
  "quiz_id" uuid NULL,
  "question_id" integer NULL,
  "selected_option" text NULL,
  "answered_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "answers_quiz_id_question_id_key" UNIQUE ("quiz_id", "question_id")
);
-- Create "asq_questions" table
CREATE TABLE "public"."asq_questions" (
  "id" serial NOT NULL,
  "question_id" integer NOT NULL,
  "asq_key" text NOT NULL,
  "question_text" text NOT NULL,
  "input_type" text NOT NULL,
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "asq_questions_input_type_check" CHECK (input_type = ANY (ARRAY['number'::text, 'boolean'::text, 'text'::text]))
);
-- Create index "idx_asq_questions_question_id" to table: "asq_questions"
CREATE INDEX "idx_asq_questions_question_id" ON "public"."asq_questions" ("question_id");
-- Create "condition_results" table
CREATE TABLE "public"."condition_results" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "interview_id" uuid NOT NULL,
  "condition_id" uuid NOT NULL,
  "status" text NULL DEFAULT 'pending',
  "resolved_at" timestamp NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_condition_results_condition_id" to table: "condition_results"
CREATE INDEX "idx_condition_results_condition_id" ON "public"."condition_results" ("condition_id");
-- Create index "idx_condition_results_interview_id" to table: "condition_results"
CREATE INDEX "idx_condition_results_interview_id" ON "public"."condition_results" ("interview_id");
-- Create "conditions" table
CREATE TABLE "public"."conditions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "goal_id" uuid NOT NULL,
  "description" text NOT NULL,
  "evidence_required" text NULL,
  "order_index" integer NULL,
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "idx_conditions_goal_id" to table: "conditions"
CREATE INDEX "idx_conditions_goal_id" ON "public"."conditions" ("goal_id");
-- Create "evidence_entries" table
CREATE TABLE "public"."evidence_entries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "interview_id" uuid NOT NULL,
  "condition_id" uuid NOT NULL,
  "respondent_name" text NULL,
  "notes" text NULL,
  "structured_responses" jsonb NULL,
  "created_at" timestamp NULL DEFAULT now(),
  "evidence_log" text NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_evidence_entries_condition_id" to table: "evidence_entries"
CREATE INDEX "idx_evidence_entries_condition_id" ON "public"."evidence_entries" ("condition_id");
-- Create index "idx_evidence_entries_interview_id" to table: "evidence_entries"
CREATE INDEX "idx_evidence_entries_interview_id" ON "public"."evidence_entries" ("interview_id");
-- Create "goals" table
CREATE TABLE "public"."goals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "sub_uncertainty_id" uuid NOT NULL,
  "statement" text NOT NULL,
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "idx_goals_sub_uncertainty_id" to table: "goals"
CREATE INDEX "idx_goals_sub_uncertainty_id" ON "public"."goals" ("sub_uncertainty_id");
-- Create "interview_cache" table
CREATE TABLE "public"."interview_cache" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "level" text NOT NULL,
  "input_text" text NOT NULL,
  "normalized_text" text NOT NULL,
  "structured_json" jsonb NOT NULL,
  "embedding" public.vector(1536) NOT NULL,
  "hit_count" integer NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT now(),
  "success_count" integer NULL DEFAULT 0,
  "failure_count" integer NULL DEFAULT 0,
  "avg_similarity" double precision NULL DEFAULT 0,
  "confidence_score" integer NULL DEFAULT 100,
  PRIMARY KEY ("id")
);
-- Create index "interview_cache_embedding_idx" to table: "interview_cache"
CREATE INDEX "interview_cache_embedding_idx" ON "public"."interview_cache" USING IVFFLAT ("embedding" public.vector_cosine_ops);
-- Create "interview_questions" table
CREATE TABLE "public"."interview_questions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "condition_id" uuid NULL,
  "goal_id" uuid NOT NULL,
  "text" text NOT NULL,
  "order_index" integer NULL,
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "idx_interview_questions_condition_id" to table: "interview_questions"
CREATE INDEX "idx_interview_questions_condition_id" ON "public"."interview_questions" ("condition_id");
-- Create index "idx_interview_questions_goal_id" to table: "interview_questions"
CREATE INDEX "idx_interview_questions_goal_id" ON "public"."interview_questions" ("goal_id");
-- Create "interviews" table
CREATE TABLE "public"."interviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "quiz_id" uuid NOT NULL,
  "started_at" timestamp NOT NULL DEFAULT now(),
  "finished_at" timestamp NULL,
  "sub_uncertainty_id" uuid NULL,
  "completion_status" text NULL,
  "confidence_before" integer NULL,
  "confidence_after" integer NULL,
  "run_number" integer NULL DEFAULT 1,
  "status" text NULL DEFAULT 'active',
  "name" text NULL,
  "respondent_info" text NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_interviews_sub_uncertainty_id" to table: "interviews"
CREATE INDEX "idx_interviews_sub_uncertainty_id" ON "public"."interviews" ("sub_uncertainty_id");
-- Create "login_codes" table
CREATE TABLE "public"."login_codes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "code_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "attempts" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "login_codes_attempts_non_negative" CHECK (attempts >= 0)
);
-- Create index "idx_login_codes_email_created_at" to table: "login_codes"
CREATE INDEX "idx_login_codes_email_created_at" ON "public"."login_codes" ("email", "created_at" DESC);
-- Create "questions" table
CREATE TABLE "public"."questions" (
  "id" serial NOT NULL,
  "checkpoint" integer NOT NULL,
  "question_order" integer NOT NULL,
  "question_text" text NOT NULL,
  "option_map" jsonb NOT NULL,
  "critical" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);
-- Create "quiz_asq_answers" table
CREATE TABLE "public"."quiz_asq_answers" (
  "id" serial NOT NULL,
  "quiz_id" uuid NOT NULL,
  "question_id" integer NOT NULL,
  "asq_id" integer NOT NULL,
  "answer_value" jsonb NOT NULL,
  "answered_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "quiz_asq_answers_unique" UNIQUE ("quiz_id", "asq_id")
);
-- Create index "idx_quiz_asq_answers_question_id" to table: "quiz_asq_answers"
CREATE INDEX "idx_quiz_asq_answers_question_id" ON "public"."quiz_asq_answers" ("question_id");
-- Create "quiz_checkpoint_signals" table
CREATE TABLE "public"."quiz_checkpoint_signals" (
  "quiz_id" uuid NOT NULL,
  "signals" jsonb NOT NULL,
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("quiz_id")
);
-- Create "quiz_checkpoints" table
CREATE TABLE "public"."quiz_checkpoints" (
  "id" serial NOT NULL,
  "quiz_id" uuid NULL,
  "checkpoint" integer NOT NULL,
  "status" text NULL DEFAULT 'UNANSWERED',
  PRIMARY KEY ("id"),
  CONSTRAINT "quiz_checkpoints_status_check" CHECK (status = ANY (ARRAY['UNANSWERED'::text, 'ANSWERED'::text, 'COMPLETED'::text]))
);
-- Create index "idx_quiz_checkpoints_quiz_id" to table: "quiz_checkpoints"
CREATE INDEX "idx_quiz_checkpoints_quiz_id" ON "public"."quiz_checkpoints" ("quiz_id");
-- Create "quiz_question_notes" table
CREATE TABLE "public"."quiz_question_notes" (
  "quiz_id" uuid NOT NULL,
  "question_id" integer NOT NULL,
  "note_text" text NOT NULL,
  "created_at" timestamp NULL DEFAULT now(),
  "updated_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("quiz_id", "question_id")
);
-- Create "quiz_results" table
CREATE TABLE "public"."quiz_results" (
  "quiz_id" uuid NOT NULL,
  "market_score" integer NOT NULL,
  "decision" text NULL,
  "summary" jsonb NULL,
  "created_at" timestamp NULL DEFAULT now(),
  "confidence_score" integer NOT NULL,
  PRIMARY KEY ("quiz_id"),
  CONSTRAINT "quiz_results_decision_check" CHECK (decision = ANY (ARRAY['BUILD'::text, 'REFINE'::text, 'DO_NOT_BUILD'::text]))
);
-- Create "quiz_state" table
CREATE TABLE "public"."quiz_state" (
  "quiz_id" uuid NOT NULL,
  "current_checkpoint" integer NULL DEFAULT 1,
  "last_updated" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("quiz_id")
);
-- Create "quizzes" table
CREATE TABLE "public"."quizzes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NULL,
  "status" text NULL DEFAULT 'NOT_STARTED',
  "started_at" timestamp NULL,
  "completed_at" timestamp NULL,
  "name" text NULL DEFAULT 'New idea',
  "parent_quiz_id" uuid NULL,
  "revision_number" integer NOT NULL DEFAULT 0,
  "visitor_id" uuid NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "quizzes_parent_fk" FOREIGN KEY ("parent_quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "quizzes_status_check" CHECK (status = ANY (ARRAY['NOT_STARTED'::text, 'IN_PROGRESS'::text, 'READY_TO_SCORE'::text, 'COMPLETED'::text]))
);
-- Create index "idx_quizzes_parent_quiz_id" to table: "quizzes"
CREATE INDEX "idx_quizzes_parent_quiz_id" ON "public"."quizzes" ("parent_quiz_id");
-- Create index "idx_quizzes_user_created" to table: "quizzes"
CREATE INDEX "idx_quizzes_user_created" ON "public"."quizzes" ("user_id", "started_at" DESC);
-- Create index "idx_quizzes_visitor_id_unique" to table: "quizzes"
CREATE UNIQUE INDEX "idx_quizzes_visitor_id_unique" ON "public"."quizzes" ("visitor_id") WHERE (visitor_id IS NOT NULL);
-- Create "rag_knowledge" table
CREATE TABLE "public"."rag_knowledge" (
  "id" text NOT NULL,
  "checkpoint" text NOT NULL,
  "signal_conditions" jsonb NOT NULL,
  "type" text NOT NULL,
  "content" text NOT NULL,
  "active" boolean NULL DEFAULT true,
  "created_at" timestamp NULL DEFAULT now(),
  "updated_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "rag_knowledge_type_check" CHECK (type = ANY (ARRAY['explanation'::text, 'example'::text, 'playbook'::text]))
);
-- Create "rules" table
CREATE TABLE "public"."rules" (
  "id" text NOT NULL,
  "section" text NOT NULL,
  "checkpoint" text NOT NULL,
  "priority" integer NOT NULL,
  "conditions" jsonb NOT NULL,
  "copy" text NOT NULL,
  "active" boolean NULL DEFAULT true,
  "created_at" timestamp NULL DEFAULT now(),
  "updated_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "rules_section_check" CHECK (section = ANY (ARRAY['working'::text, 'risky'::text, 'proceed'::text]))
);
-- Create "schema_migrations" table
CREATE TABLE "public"."schema_migrations" (
  "id" serial NOT NULL,
  "filename" text NULL,
  "executed_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "schema_migrations_filename_key" UNIQUE ("filename")
);
-- Create "sessions" table
CREATE TABLE "public"."sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "idx_sessions_expires_at" to table: "sessions"
CREATE INDEX "idx_sessions_expires_at" ON "public"."sessions" ("expires_at");
-- Create index "idx_sessions_user_id" to table: "sessions"
CREATE INDEX "idx_sessions_user_id" ON "public"."sessions" ("user_id");
-- Create "sub_uncertainties" table
CREATE TABLE "public"."sub_uncertainties" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "uncertainty_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text NULL,
  "impact_level" text NULL,
  "status" text NULL DEFAULT 'pending',
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "idx_sub_uncertainties_uncertainty_id" to table: "sub_uncertainties"
CREATE INDEX "idx_sub_uncertainties_uncertainty_id" ON "public"."sub_uncertainties" ("uncertainty_id");
-- Create "uncertainties" table
CREATE TABLE "public"."uncertainties" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "quiz_id" uuid NOT NULL,
  "text" text NOT NULL,
  "normalized_text" text NOT NULL,
  "status" text NULL DEFAULT 'active',
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "idx_uncertainties_quiz_id" to table: "uncertainties"
CREATE INDEX "idx_uncertainties_quiz_id" ON "public"."uncertainties" ("quiz_id");
-- Create "uncertainty_templates" table
CREATE TABLE "public"."uncertainty_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "normalized_text" text NOT NULL,
  "embedding" public.vector(1536) NOT NULL,
  "structured_json" jsonb NOT NULL,
  "confidence_score" double precision NULL DEFAULT 0,
  "created_at" timestamp NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "uncertainty_templates_embedding_idx" to table: "uncertainty_templates"
CREATE INDEX "uncertainty_templates_embedding_idx" ON "public"."uncertainty_templates" USING IVFFLAT ("embedding" public.vector_cosine_ops);
-- Create "users" table
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "current_quiz_id" uuid NULL,
  "is_guest" boolean NULL DEFAULT true,
  PRIMARY KEY ("id"),
  CONSTRAINT "users_email_unique" UNIQUE ("email")
);
-- Create index "idx_users_current_quiz_id" to table: "users"
CREATE INDEX "idx_users_current_quiz_id" ON "public"."users" ("current_quiz_id");
-- Create index "idx_users_email_lower_unique" to table: "users"
CREATE UNIQUE INDEX "idx_users_email_lower_unique" ON "public"."users" ((lower(email)));
-- Modify "answers" table
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION, ADD CONSTRAINT "answers_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Modify "asq_questions" table
ALTER TABLE "public"."asq_questions" ADD CONSTRAINT "asq_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "condition_results" table
ALTER TABLE "public"."condition_results" ADD CONSTRAINT "condition_results_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "public"."conditions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE, ADD CONSTRAINT "condition_results_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "conditions" table
ALTER TABLE "public"."conditions" ADD CONSTRAINT "conditions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "evidence_entries" table
ALTER TABLE "public"."evidence_entries" ADD CONSTRAINT "evidence_entries_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "public"."conditions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE, ADD CONSTRAINT "evidence_entries_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "goals" table
ALTER TABLE "public"."goals" ADD CONSTRAINT "goals_sub_uncertainty_id_fkey" FOREIGN KEY ("sub_uncertainty_id") REFERENCES "public"."sub_uncertainties" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "interview_questions" table
ALTER TABLE "public"."interview_questions" ADD CONSTRAINT "interview_questions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "public"."conditions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE, ADD CONSTRAINT "interview_questions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "interviews" table
ALTER TABLE "public"."interviews" ADD CONSTRAINT "interviews_sub_uncertainty_id_fkey" FOREIGN KEY ("sub_uncertainty_id") REFERENCES "public"."sub_uncertainties" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Modify "quiz_asq_answers" table
ALTER TABLE "public"."quiz_asq_answers" ADD CONSTRAINT "quiz_asq_answers_asq_id_fkey" FOREIGN KEY ("asq_id") REFERENCES "public"."asq_questions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE, ADD CONSTRAINT "quiz_asq_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions" ("id") ON UPDATE NO ACTION ON DELETE CASCADE, ADD CONSTRAINT "quiz_asq_answers_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "quiz_checkpoint_signals" table
ALTER TABLE "public"."quiz_checkpoint_signals" ADD CONSTRAINT "quiz_checkpoint_signals_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "quiz_checkpoints" table
ALTER TABLE "public"."quiz_checkpoints" ADD CONSTRAINT "quiz_checkpoints_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Modify "quiz_results" table
ALTER TABLE "public"."quiz_results" ADD CONSTRAINT "quiz_results_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Modify "quiz_state" table
ALTER TABLE "public"."quiz_state" ADD CONSTRAINT "quiz_state_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Modify "quizzes" table
ALTER TABLE "public"."quizzes" ADD CONSTRAINT "quizzes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- Modify "sessions" table
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "sub_uncertainties" table
ALTER TABLE "public"."sub_uncertainties" ADD CONSTRAINT "sub_uncertainties_uncertainty_id_fkey" FOREIGN KEY ("uncertainty_id") REFERENCES "public"."uncertainties" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "uncertainties" table
ALTER TABLE "public"."uncertainties" ADD CONSTRAINT "uncertainties_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- Modify "users" table
ALTER TABLE "public"."users" ADD CONSTRAINT "users_current_quiz_id_fkey" FOREIGN KEY ("current_quiz_id") REFERENCES "public"."quizzes" ("id") ON UPDATE NO ACTION ON DELETE SET NULL;
