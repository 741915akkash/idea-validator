table "answers" {
  schema = schema.public
  column "id" {
    null = false
    type = serial
  }
  column "quiz_id" {
    null = true
    type = uuid
  }
  column "question_id" {
    null = true
    type = integer
  }
  column "selected_option" {
    null = true
    type = text
  }
  column "answered_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "answers_question_id_fkey" {
    columns     = [column.question_id]
    ref_columns = [table.questions.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "answers_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  unique "answers_quiz_id_question_id_key" {
    columns = [column.quiz_id, column.question_id]
  }
}
table "asq_questions" {
  schema = schema.public
  column "id" {
    null = false
    type = serial
  }
  column "question_id" {
    null = false
    type = integer
  }
  column "asq_key" {
    null = false
    type = text
  }
  column "question_text" {
    null = false
    type = text
  }
  column "input_type" {
    null = false
    type = text
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "asq_questions_question_id_fkey" {
    columns     = [column.question_id]
    ref_columns = [table.questions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_asq_questions_question_id" {
    columns = [column.question_id]
  }
  check "asq_questions_input_type_check" {
    expr = "(input_type = ANY (ARRAY['number'::text, 'boolean'::text, 'text'::text]))"
  }
}
table "condition_results" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "interview_id" {
    null = false
    type = uuid
  }
  column "condition_id" {
    null = false
    type = uuid
  }
  column "status" {
    null    = true
    type    = text
    default = "pending"
  }
  column "resolved_at" {
    null = true
    type = timestamp
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "condition_results_condition_id_fkey" {
    columns     = [column.condition_id]
    ref_columns = [table.conditions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "condition_results_interview_id_fkey" {
    columns     = [column.interview_id]
    ref_columns = [table.interviews.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_condition_results_condition_id" {
    columns = [column.condition_id]
  }
  index "idx_condition_results_interview_id" {
    columns = [column.interview_id]
  }
}
table "conditions" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "goal_id" {
    null = false
    type = uuid
  }
  column "description" {
    null = false
    type = text
  }
  column "evidence_required" {
    null = true
    type = text
  }
  column "order_index" {
    null = true
    type = integer
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "conditions_goal_id_fkey" {
    columns     = [column.goal_id]
    ref_columns = [table.goals.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_conditions_goal_id" {
    columns = [column.goal_id]
  }
}
table "evidence_entries" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "interview_id" {
    null = false
    type = uuid
  }
  column "condition_id" {
    null = false
    type = uuid
  }
  column "respondent_name" {
    null = true
    type = text
  }
  column "notes" {
    null = true
    type = text
  }
  column "structured_responses" {
    null = true
    type = jsonb
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  column "evidence_log" {
    null = true
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "evidence_entries_condition_id_fkey" {
    columns     = [column.condition_id]
    ref_columns = [table.conditions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "evidence_entries_interview_id_fkey" {
    columns     = [column.interview_id]
    ref_columns = [table.interviews.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_evidence_entries_condition_id" {
    columns = [column.condition_id]
  }
  index "idx_evidence_entries_interview_id" {
    columns = [column.interview_id]
  }
}
table "goals" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "sub_uncertainty_id" {
    null = false
    type = uuid
  }
  column "statement" {
    null = false
    type = text
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "goals_sub_uncertainty_id_fkey" {
    columns     = [column.sub_uncertainty_id]
    ref_columns = [table.sub_uncertainties.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_goals_sub_uncertainty_id" {
    columns = [column.sub_uncertainty_id]
  }
}
table "interview_cache" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "level" {
    null = false
    type = text
  }
  column "input_text" {
    null = false
    type = text
  }
  column "normalized_text" {
    null = false
    type = text
  }
  column "structured_json" {
    null = false
    type = jsonb
  }
  column "embedding" {
    null = false
    type = sql("public.vector(1536)")
  }
  column "hit_count" {
    null    = true
    type    = integer
    default = 0
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  column "success_count" {
    null    = true
    type    = integer
    default = 0
  }
  column "failure_count" {
    null    = true
    type    = integer
    default = 0
  }
  column "avg_similarity" {
    null    = true
    type    = double_precision
    default = 0
  }
  column "confidence_score" {
    null    = true
    type    = integer
    default = 100
  }
  primary_key {
    columns = [column.id]
  }
  index "interview_cache_embedding_idx" {
    type = "IVFFLAT"
    on {
      column = column.embedding
      ops    = "public.vector_cosine_ops"
    }
  }
}
table "interview_questions" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "condition_id" {
    null = true
    type = uuid
  }
  column "goal_id" {
    null = false
    type = uuid
  }
  column "text" {
    null = false
    type = text
  }
  column "order_index" {
    null = true
    type = integer
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "interview_questions_condition_id_fkey" {
    columns     = [column.condition_id]
    ref_columns = [table.conditions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "interview_questions_goal_id_fkey" {
    columns     = [column.goal_id]
    ref_columns = [table.goals.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_interview_questions_condition_id" {
    columns = [column.condition_id]
  }
  index "idx_interview_questions_goal_id" {
    columns = [column.goal_id]
  }
}
table "interviews" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "started_at" {
    null    = false
    type    = timestamp
    default = sql("now()")
  }
  column "finished_at" {
    null = true
    type = timestamp
  }
  column "sub_uncertainty_id" {
    null = true
    type = uuid
  }
  column "completion_status" {
    null = true
    type = text
  }
  column "confidence_before" {
    null = true
    type = integer
  }
  column "confidence_after" {
    null = true
    type = integer
  }
  column "run_number" {
    null    = true
    type    = integer
    default = 1
  }
  column "status" {
    null    = true
    type    = text
    default = "active"
  }
  column "name" {
    null = true
    type = text
  }
  column "respondent_info" {
    null = true
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "interviews_sub_uncertainty_id_fkey" {
    columns     = [column.sub_uncertainty_id]
    ref_columns = [table.sub_uncertainties.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "idx_interviews_sub_uncertainty_id" {
    columns = [column.sub_uncertainty_id]
  }
}
table "login_codes" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "email" {
    null = false
    type = text
  }
  column "code_hash" {
    null = false
    type = text
  }
  column "expires_at" {
    null = false
    type = timestamptz
  }
  column "attempts" {
    null    = false
    type    = integer
    default = 0
  }
  column "created_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_login_codes_email_created_at" {
    on {
      column = column.email
    }
    on {
      desc   = true
      column = column.created_at
    }
  }
  check "login_codes_attempts_non_negative" {
    expr = "(attempts >= 0)"
  }
}
table "questions" {
  schema = schema.public
  column "id" {
    null = false
    type = serial
  }
  column "checkpoint" {
    null = false
    type = integer
  }
  column "question_order" {
    null = false
    type = integer
  }
  column "question_text" {
    null = false
    type = text
  }
  column "option_map" {
    null = false
    type = jsonb
  }
  column "critical" {
    null    = false
    type    = boolean
    default = false
  }
  primary_key {
    columns = [column.id]
  }
}
table "quiz_asq_answers" {
  schema = schema.public
  column "id" {
    null = false
    type = serial
  }
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "question_id" {
    null = false
    type = integer
  }
  column "asq_id" {
    null = false
    type = integer
  }
  column "answer_value" {
    null = false
    type = jsonb
  }
  column "answered_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "quiz_asq_answers_asq_id_fkey" {
    columns     = [column.asq_id]
    ref_columns = [table.asq_questions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "quiz_asq_answers_question_id_fkey" {
    columns     = [column.question_id]
    ref_columns = [table.questions.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  foreign_key "quiz_asq_answers_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_quiz_asq_answers_question_id" {
    columns = [column.question_id]
  }
  unique "quiz_asq_answers_unique" {
    columns = [column.quiz_id, column.asq_id]
  }
}
table "quiz_checkpoint_signals" {
  schema = schema.public
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "signals" {
    null = false
    type = jsonb
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.quiz_id]
  }
  foreign_key "quiz_checkpoint_signals_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
}
table "quiz_checkpoints" {
  schema = schema.public
  column "id" {
    null = false
    type = serial
  }
  column "quiz_id" {
    null = true
    type = uuid
  }
  column "checkpoint" {
    null = false
    type = integer
  }
  column "status" {
    null    = true
    type    = text
    default = "UNANSWERED"
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "quiz_checkpoints_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "idx_quiz_checkpoints_quiz_id" {
    columns = [column.quiz_id]
  }
  check "quiz_checkpoints_status_check" {
    expr = "(status = ANY (ARRAY['UNANSWERED'::text, 'ANSWERED'::text, 'COMPLETED'::text]))"
  }
}
table "quiz_question_notes" {
  schema = schema.public
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "question_id" {
    null = false
    type = integer
  }
  column "note_text" {
    null = false
    type = text
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  column "updated_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.quiz_id, column.question_id]
  }
}
table "quiz_results" {
  schema = schema.public
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "market_score" {
    null = false
    type = integer
  }
  column "decision" {
    null = true
    type = text
  }
  column "summary" {
    null = true
    type = jsonb
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  column "confidence_score" {
    null = false
    type = integer
  }
  primary_key {
    columns = [column.quiz_id]
  }
  foreign_key "quiz_results_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  check "quiz_results_decision_check" {
    expr = "(decision = ANY (ARRAY['BUILD'::text, 'REFINE'::text, 'DO_NOT_BUILD'::text]))"
  }
}
table "quiz_state" {
  schema = schema.public
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "current_checkpoint" {
    null    = true
    type    = integer
    default = 1
  }
  column "last_updated" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.quiz_id]
  }
  foreign_key "quiz_state_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
}
table "quizzes" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "user_id" {
    null = true
    type = uuid
  }
  column "status" {
    null    = true
    type    = text
    default = "NOT_STARTED"
  }
  column "started_at" {
    null = true
    type = timestamp
  }
  column "completed_at" {
    null = true
    type = timestamp
  }
  column "name" {
    null    = true
    type    = text
    default = "New idea"
  }
  column "parent_quiz_id" {
    null = true
    type = uuid
  }
  column "revision_number" {
    null    = false
    type    = integer
    default = 0
  }
  column "visitor_id" {
    null = true
    type = uuid
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "quizzes_parent_fk" {
    columns     = [column.parent_quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  foreign_key "quizzes_user_id_fkey" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = NO_ACTION
  }
  index "idx_quizzes_parent_quiz_id" {
    columns = [column.parent_quiz_id]
  }
  index "idx_quizzes_user_created" {
    on {
      column = column.user_id
    }
    on {
      desc   = true
      column = column.started_at
    }
  }
  index "idx_quizzes_visitor_id_unique" {
    unique  = true
    columns = [column.visitor_id]
    where   = "(visitor_id IS NOT NULL)"
  }
  check "quizzes_status_check" {
    expr = "(status = ANY (ARRAY['NOT_STARTED'::text, 'IN_PROGRESS'::text, 'READY_TO_SCORE'::text, 'COMPLETED'::text]))"
  }
}
table "rag_knowledge" {
  schema = schema.public
  column "id" {
    null = false
    type = text
  }
  column "checkpoint" {
    null = false
    type = text
  }
  column "signal_conditions" {
    null = false
    type = jsonb
  }
  column "type" {
    null = false
    type = text
  }
  column "content" {
    null = false
    type = text
  }
  column "active" {
    null    = true
    type    = boolean
    default = true
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  column "updated_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  check "rag_knowledge_type_check" {
    expr = "(type = ANY (ARRAY['explanation'::text, 'example'::text, 'playbook'::text]))"
  }
}
table "rules" {
  schema = schema.public
  column "id" {
    null = false
    type = text
  }
  column "section" {
    null = false
    type = text
  }
  column "checkpoint" {
    null = false
    type = text
  }
  column "priority" {
    null = false
    type = integer
  }
  column "conditions" {
    null = false
    type = jsonb
  }
  column "copy" {
    null = false
    type = text
  }
  column "active" {
    null    = true
    type    = boolean
    default = true
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  column "updated_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  check "rules_section_check" {
    expr = "(section = ANY (ARRAY['working'::text, 'risky'::text, 'proceed'::text]))"
  }
}
table "schema_migrations" {
  schema = schema.public
  column "id" {
    null = false
    type = serial
  }
  column "filename" {
    null = true
    type = text
  }
  column "executed_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  unique "schema_migrations_filename_key" {
    columns = [column.filename]
  }
}
table "sessions" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "user_id" {
    null = false
    type = uuid
  }
  column "expires_at" {
    null = false
    type = timestamptz
  }
  column "created_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "sessions_user_id_fkey" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_sessions_expires_at" {
    columns = [column.expires_at]
  }
  index "idx_sessions_user_id" {
    columns = [column.user_id]
  }
}
table "sub_uncertainties" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "uncertainty_id" {
    null = false
    type = uuid
  }
  column "title" {
    null = false
    type = text
  }
  column "description" {
    null = true
    type = text
  }
  column "impact_level" {
    null = true
    type = text
  }
  column "status" {
    null    = true
    type    = text
    default = "pending"
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "sub_uncertainties_uncertainty_id_fkey" {
    columns     = [column.uncertainty_id]
    ref_columns = [table.uncertainties.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_sub_uncertainties_uncertainty_id" {
    columns = [column.uncertainty_id]
  }
}
table "uncertainties" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "quiz_id" {
    null = false
    type = uuid
  }
  column "text" {
    null = false
    type = text
  }
  column "normalized_text" {
    null = false
    type = text
  }
  column "status" {
    null    = true
    type    = text
    default = "active"
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "uncertainties_quiz_id_fkey" {
    columns     = [column.quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = CASCADE
  }
  index "idx_uncertainties_quiz_id" {
    columns = [column.quiz_id]
  }
}
table "uncertainty_templates" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "normalized_text" {
    null = false
    type = text
  }
  column "embedding" {
    null = false
    type = sql("public.vector(1536)")
  }
  column "structured_json" {
    null = false
    type = jsonb
  }
  column "confidence_score" {
    null    = true
    type    = double_precision
    default = 0
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("now()")
  }
  primary_key {
    columns = [column.id]
  }
  index "uncertainty_templates_embedding_idx" {
    type = "IVFFLAT"
    on {
      column = column.embedding
      ops    = "public.vector_cosine_ops"
    }
  }
}
table "users" {
  schema = schema.public
  column "id" {
    null    = false
    type    = uuid
    default = sql("gen_random_uuid()")
  }
  column "email" {
    null = false
    type = text
  }
  column "created_at" {
    null    = false
    type    = timestamptz
    default = sql("now()")
  }
  column "current_quiz_id" {
    null = true
    type = uuid
  }
  column "is_guest" {
    null    = true
    type    = boolean
    default = true
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "users_current_quiz_id_fkey" {
    columns     = [column.current_quiz_id]
    ref_columns = [table.quizzes.column.id]
    on_update   = NO_ACTION
    on_delete   = SET_NULL
  }
  index "idx_users_current_quiz_id" {
    columns = [column.current_quiz_id]
  }
  index "idx_users_email_lower_unique" {
    unique = true
    on {
      expr = "lower(email)"
    }
  }
  unique "users_email_unique" {
    columns = [column.email]
  }
}
schema "public" {
  comment = "standard public schema"
}
