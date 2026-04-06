-- Seed canonical quiz questions from zmisc/all_question_options.json
-- and ensure every existing quiz has checkpoint rows.

BEGIN;

INSERT INTO public.questions (id, checkpoint, question_order, question_text, option_map, critical)
VALUES
  (1, 1, 1, 'How often does this problem occur?', '{"RARE":{"label":"Rare","market":1},"DAILY":{"label":"Daily","market":6},"UNSURE":{"label":"Unsure","market":0},"WEEKLY":{"label":"Weekly","market":5},"MONTHLY":{"label":"Monthly","market":3}}'::jsonb, false),
  (2, 1, 2, 'What happens if this problem is not solved?', '{"MILD":{"label":"Mild inconvenience","market":1},"NONE":{"label":"No real impact","market":0},"STRESS":{"label":"Reputation or stress impact","market":3},"REVENUE":{"label":"Loses revenue / customers","market":6},"PRODUCTIVITY":{"label":"Misses deadlines / productivity loss","market":4}}'::jsonb, false),
  (3, 1, 3, 'How do you know this problem exists?', '{"HEARD":{"label":"Heard about it","market":1},"OBSERVED":{"label":"Observed others with example","market":3},"PERSONAL":{"label":"Personally experienced with example","market":4},"ASSUMPTION":{"label":"Just an assumption","market":0}}'::jsonb, false),
  (4, 1, 4, 'How often do people discuss this problem publicly?', '{"NONE":{"label":"None","market":0},"RARE":{"label":"Rare mention","market":1},"SOME":{"label":"Some discussion","market":2},"FREQUENT":{"label":"Frequent discussion","market":4}}'::jsonb, false),
  (5, 2, 1, 'What triggers someone to act?', '{"NONE":{"label":"No trigger","market":0},"MONEY":{"label":"Money loss","market":5},"DEADLINE":{"label":"Deadline / compliance","market":6},"REPUTATION":{"label":"Reputation risk","market":4},"CONVENIENCE":{"label":"Convenience","market":2}}'::jsonb, false),
  (6, 2, 2, 'Is there a panic moment?', '{"RARE":{"label":"Rarely","market":1},"CLEAR":{"label":"Yes, clearly","market":4},"NEVER":{"label":"Never","market":0},"SOMETIMES":{"label":"Sometimes","market":2}}'::jsonb, false),
  (7, 2, 3, 'What happens if they delay solving it?', '{"NONE":{"label":"None","market":0},"MINOR":{"label":"Minor","market":1},"MODERATE":{"label":"Moderate impact","market":3},"COMPOUNDS":{"label":"Compounds fast","market":5}}'::jsonb, false),
  (8, 3, 1, 'Have people paid for similar solutions before?', '{"FREE":{"label":"Used free tools only","market":2},"NEVER":{"label":"Never paid","market":0},"DIRECT":{"label":"Paid directly","market":8},"INDIRECT":{"label":"Paid via agency or labor","market":5}}'::jsonb, false),
  (9, 3, 2, 'Who controls the budget?', '{"NONE":{"label":"No buyer","market":0},"DECIDER":{"label":"Buyer decides","market":6},"UNCLEAR":{"label":"Unclear","market":1},"APPROVAL":{"label":"Needs approval","market":3}}'::jsonb, false),
  (10, 3, 3, 'What is the cost of current workaround?', '{"LOW":{"label":"Low cost","market":2},"HIGH":{"label":"High time or money cost","market":6},"NONE":{"label":"No workaround","market":0},"MEDIUM":{"label":"Medium cost","market":4}}'::jsonb, false),
  (11, 4, 1, 'How clearly defined is the ideal customer?', '{"BROAD":{"label":"Broad segment","market":2},"CLEAR":{"label":"One clear role and context","market":6},"NARROW":{"label":"Narrow but fuzzy","market":4},"EVERYONE":{"label":"Everyone","market":0}}'::jsonb, false),
  (12, 4, 2, 'How similar is the pain across this customer group?', '{"SAME":{"label":"Same pain across ICP","market":5},"MOSTLY":{"label":"Mostly similar","market":3},"VARIES":{"label":"Varies widely","market":1},"UNCLEAR":{"label":"Unclear","market":0}}'::jsonb, false),
  (13, 4, 3, 'How easy is it to find 10+ such people?', '{"EASY":{"label":"Easy to find","market":4},"HARD":{"label":"Hard to find","market":1},"SOME":{"label":"Some effort required","market":2},"UNKNOWN":{"label":"Unknown","market":0}}'::jsonb, false),
  (14, 5, 1, 'Is there a clear differentiation wedge?', '{"NONE":{"label":"None","market":0},"PARITY":{"label":"Feature parity","market":2},"NEGLECTED":{"label":"Clear neglected angle","market":6},"POSITIONING":{"label":"Positioning gap","market":4}}'::jsonb, false),
  (15, 5, 2, 'Do users complain about existing solutions?', '{"NONE":{"label":"None","market":0},"SOME":{"label":"Some complaints","market":3},"MINOR":{"label":"Minor issues","market":1},"STRONG":{"label":"Repeated strong complaints","market":5}}'::jsonb, false),
  (16, 5, 3, 'How is the competitive landscape structured?', '{"FEW":{"label":"Few players","market":2},"DOMINATED":{"label":"Dominated by incumbents","market":0},"FRAGMENTED":{"label":"Fragmented market","market":4}}'::jsonb, false),
  (17, 6, 1, 'Do you know at least one proven distribution channel?', '{"NONE":{"label":"No known channel","market":0},"PROVEN":{"label":"One proven channel","market":6},"MULTIPLE":{"label":"Multiple possible channels","market":4},"EXPERIMENTAL":{"label":"Experimental","market":2}}'::jsonb, false),
  (18, 6, 2, 'What is the cost of reaching customers?', '{"LOW":{"label":"Low / organic","market":5},"HIGH":{"label":"High cost","market":1},"MEDIUM":{"label":"Medium cost","market":3},"UNKNOWN":{"label":"Unknown","market":0}}'::jsonb, false),
  (19, 6, 3, 'How much control do you have over the channel?', '{"NONE":{"label":"No control","market":0},"DIRECT":{"label":"Direct access","market":4},"PARTIAL":{"label":"Partial control","market":2},"PLATFORM":{"label":"Platform-dependent","market":1}}'::jsonb, false),
  (20, 7, 1, 'What is your experience level in this domain?', '{"DEEP":{"label":"Deep domain experience","confidence":8},"NONE":{"label":"No experience","confidence":0},"LEARN":{"label":"Can learn","confidence":2},"ADJACENT":{"label":"Adjacent experience","confidence":5}}'::jsonb, false),
  (21, 7, 2, 'What credibility or proof do you have?', '{"NONE":{"label":"None","confidence":0},"SOME":{"label":"Some proof","confidence":4},"WEAK":{"label":"Weak proof","confidence":2},"PROVEN":{"label":"Proven results / portfolio","confidence":7}}'::jsonb, false),
  (22, 7, 3, 'How fast can you build and deliver this?', '{"FAST":{"label":"Can build/deliver fast","confidence":5},"SLOW":{"label":"Slow","confidence":1},"MODERATE":{"label":"Moderate","confidence":3},"VERY_SLOW":{"label":"Very slow","confidence":0}}'::jsonb, false),
  (23, 7, 4, 'Do you have an unfair advantage here?', '{"NONE":{"label":"None","confidence":0},"TEMP":{"label":"Temporary","confidence":3},"WEAK":{"label":"Weak","confidence":1},"CLEAR":{"label":"Clear and defensible","confidence":5}}'::jsonb, false),
  (24, 8, 1, 'How financially ready are you to pursue this?', '{"NONE":{"label":"None","confidence":0},"LIMITED":{"label":"Limited","confidence":3},"COMFORTABLE":{"label":"Can invest comfortably","confidence":5}}'::jsonb, false),
  (25, 8, 2, 'What is your realistic time runway?', '{"MID":{"label":"3–6 months","confidence":3},"LONG":{"label":"6–12 months runway","confidence":5},"SHORT":{"label":"<3 months","confidence":0}}'::jsonb, false),
  (26, 8, 3, 'Which execution mode do you naturally prefer?', '{"NEUTRAL":{"label":"Neutral","confidence":3},"PRODUCT":{"label":"Loves systems/products","confidence":5},"SERVICE":{"label":"Prefers services","confidence":0}}'::jsonb, false),
  (27, 9, 1, 'Will you accept the result even if it says NOT TO BUILD?', '{"ACCEPTS":{"label":"Accepts any outcome","confidence":10},"REJECTS":{"label":"Rejects negative outcome","confidence":0},"HESITATES":{"label":"Accepts with hesitation","confidence":5}}'::jsonb, false),
  (28, 9, 2, 'How do you emotionally feel about pursuing this?', '{"UNSURE":{"label":"Interested but unsure","confidence":5},"EXCITED":{"label":"Excited + realistic","confidence":10},"FEARFUL":{"label":"Fearful / conflicted","confidence":0}}'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
  checkpoint = EXCLUDED.checkpoint,
  question_order = EXCLUDED.question_order,
  question_text = EXCLUDED.question_text,
  option_map = EXCLUDED.option_map,
  critical = EXCLUDED.critical;

SELECT setval(
  pg_get_serial_sequence('public.questions', 'id'),
  GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.questions), 1),
  true
);

INSERT INTO public.quiz_checkpoints (quiz_id, checkpoint, status)
SELECT q.id, cp.checkpoint, 'UNANSWERED'
FROM public.quizzes q
CROSS JOIN (
  SELECT DISTINCT checkpoint
  FROM public.questions
) cp
LEFT JOIN public.quiz_checkpoints qc
  ON qc.quiz_id = q.id
 AND qc.checkpoint = cp.checkpoint
WHERE qc.id IS NULL;

COMMIT;
