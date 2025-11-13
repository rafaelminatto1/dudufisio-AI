create sequence "public"."order_sequence";
drop trigger if exists "trigger_update_compliance_stats" on "public"."assessment_compliance_log";
drop trigger if exists "update_clinical_material_categories_updated_at" on "public"."clinical_material_categories";
drop trigger if exists "create_clinical_material_version" on "public"."clinical_materials";
drop trigger if exists "increment_clinical_materials_version" on "public"."clinical_materials";
drop trigger if exists "update_clinical_materials_updated_at" on "public"."clinical_materials";
drop trigger if exists "update_schedule_blocks_updated_at" on "public"."schedule_blocks";
drop trigger if exists "update_waitlist_entries_updated_at" on "public"."waitlist_entries";
drop policy "Admins can manage categories" on "public"."clinical_material_categories";
drop policy "Everyone can view categories" on "public"."clinical_material_categories";
drop policy "Users can view links in accessible materials" on "public"."clinical_material_links";
drop policy "Users can manage media in accessible materials" on "public"."clinical_material_media";
drop policy "Users can view media in accessible materials" on "public"."clinical_material_media";
drop policy "Users can create mentions in accessible materials" on "public"."clinical_material_mentions";
drop policy "Users can view mentions in accessible materials" on "public"."clinical_material_mentions";
drop policy "Users can create tasks for accessible materials" on "public"."clinical_material_tasks";
drop policy "Users can update their own tasks" on "public"."clinical_material_tasks";
drop policy "Users can view their own tasks" on "public"."clinical_material_tasks";
drop policy "Users can create versions for accessible materials" on "public"."clinical_material_versions";
drop policy "Users can view versions of accessible materials" on "public"."clinical_material_versions";
drop policy "Users can create materials" on "public"."clinical_materials";
drop policy "Users can delete own materials" on "public"."clinical_materials";
drop policy "Users can update own materials or if collaborator" on "public"."clinical_materials";
drop policy "Users can view published materials" on "public"."clinical_materials";
drop policy "Admins and therapists can create schedule blocks" on "public"."schedule_blocks";
drop policy "Admins and therapists can update schedule blocks" on "public"."schedule_blocks";
drop policy "Admins can delete schedule blocks" on "public"."schedule_blocks";
drop policy "Admins can view all schedule blocks" on "public"."schedule_blocks";
drop policy "Therapists can view their schedule blocks" on "public"."schedule_blocks";
drop policy "Admins and therapists can create waitlist entries" on "public"."waitlist_entries";
drop policy "Admins and therapists can update waitlist entries" on "public"."waitlist_entries";
drop policy "Admins can delete waitlist entries" on "public"."waitlist_entries";
drop policy "Admins can view all waitlist entries" on "public"."waitlist_entries";
drop policy "Therapists can view their waitlist entries" on "public"."waitlist_entries";
revoke delete on table "public"."appointment_requests" from "anon";
revoke insert on table "public"."appointment_requests" from "anon";
revoke references on table "public"."appointment_requests" from "anon";
revoke select on table "public"."appointment_requests" from "anon";
revoke trigger on table "public"."appointment_requests" from "anon";
revoke truncate on table "public"."appointment_requests" from "anon";
revoke update on table "public"."appointment_requests" from "anon";
revoke delete on table "public"."appointment_requests" from "authenticated";
revoke insert on table "public"."appointment_requests" from "authenticated";
revoke references on table "public"."appointment_requests" from "authenticated";
revoke select on table "public"."appointment_requests" from "authenticated";
revoke trigger on table "public"."appointment_requests" from "authenticated";
revoke truncate on table "public"."appointment_requests" from "authenticated";
revoke update on table "public"."appointment_requests" from "authenticated";
revoke delete on table "public"."appointment_requests" from "service_role";
revoke insert on table "public"."appointment_requests" from "service_role";
revoke references on table "public"."appointment_requests" from "service_role";
revoke select on table "public"."appointment_requests" from "service_role";
revoke trigger on table "public"."appointment_requests" from "service_role";
revoke truncate on table "public"."appointment_requests" from "service_role";
revoke update on table "public"."appointment_requests" from "service_role";
revoke delete on table "public"."appointments" from "anon";
revoke insert on table "public"."appointments" from "anon";
revoke references on table "public"."appointments" from "anon";
revoke select on table "public"."appointments" from "anon";
revoke trigger on table "public"."appointments" from "anon";
revoke truncate on table "public"."appointments" from "anon";
revoke update on table "public"."appointments" from "anon";
revoke delete on table "public"."appointments" from "authenticated";
revoke insert on table "public"."appointments" from "authenticated";
revoke references on table "public"."appointments" from "authenticated";
revoke select on table "public"."appointments" from "authenticated";
revoke trigger on table "public"."appointments" from "authenticated";
revoke truncate on table "public"."appointments" from "authenticated";
revoke update on table "public"."appointments" from "authenticated";
revoke delete on table "public"."appointments" from "service_role";
revoke insert on table "public"."appointments" from "service_role";
revoke references on table "public"."appointments" from "service_role";
revoke select on table "public"."appointments" from "service_role";
revoke trigger on table "public"."appointments" from "service_role";
revoke truncate on table "public"."appointments" from "service_role";
revoke update on table "public"."appointments" from "service_role";
revoke delete on table "public"."assessment_compliance_log" from "anon";
revoke insert on table "public"."assessment_compliance_log" from "anon";
revoke references on table "public"."assessment_compliance_log" from "anon";
revoke select on table "public"."assessment_compliance_log" from "anon";
revoke trigger on table "public"."assessment_compliance_log" from "anon";
revoke truncate on table "public"."assessment_compliance_log" from "anon";
revoke update on table "public"."assessment_compliance_log" from "anon";
revoke delete on table "public"."assessment_compliance_log" from "authenticated";
revoke insert on table "public"."assessment_compliance_log" from "authenticated";
revoke references on table "public"."assessment_compliance_log" from "authenticated";
revoke select on table "public"."assessment_compliance_log" from "authenticated";
revoke trigger on table "public"."assessment_compliance_log" from "authenticated";
revoke truncate on table "public"."assessment_compliance_log" from "authenticated";
revoke update on table "public"."assessment_compliance_log" from "authenticated";
revoke delete on table "public"."assessment_compliance_log" from "service_role";
revoke insert on table "public"."assessment_compliance_log" from "service_role";
revoke references on table "public"."assessment_compliance_log" from "service_role";
revoke select on table "public"."assessment_compliance_log" from "service_role";
revoke trigger on table "public"."assessment_compliance_log" from "service_role";
revoke truncate on table "public"."assessment_compliance_log" from "service_role";
revoke update on table "public"."assessment_compliance_log" from "service_role";
revoke delete on table "public"."attachments" from "anon";
revoke insert on table "public"."attachments" from "anon";
revoke references on table "public"."attachments" from "anon";
revoke select on table "public"."attachments" from "anon";
revoke trigger on table "public"."attachments" from "anon";
revoke truncate on table "public"."attachments" from "anon";
revoke update on table "public"."attachments" from "anon";
revoke delete on table "public"."attachments" from "authenticated";
revoke insert on table "public"."attachments" from "authenticated";
revoke references on table "public"."attachments" from "authenticated";
revoke select on table "public"."attachments" from "authenticated";
revoke trigger on table "public"."attachments" from "authenticated";
revoke truncate on table "public"."attachments" from "authenticated";
revoke update on table "public"."attachments" from "authenticated";
revoke delete on table "public"."attachments" from "service_role";
revoke insert on table "public"."attachments" from "service_role";
revoke references on table "public"."attachments" from "service_role";
revoke select on table "public"."attachments" from "service_role";
revoke trigger on table "public"."attachments" from "service_role";
revoke truncate on table "public"."attachments" from "service_role";
revoke update on table "public"."attachments" from "service_role";
revoke delete on table "public"."auto_replenishment_rules" from "anon";
revoke insert on table "public"."auto_replenishment_rules" from "anon";
revoke references on table "public"."auto_replenishment_rules" from "anon";
revoke select on table "public"."auto_replenishment_rules" from "anon";
revoke trigger on table "public"."auto_replenishment_rules" from "anon";
revoke truncate on table "public"."auto_replenishment_rules" from "anon";
revoke update on table "public"."auto_replenishment_rules" from "anon";
revoke delete on table "public"."auto_replenishment_rules" from "authenticated";
revoke insert on table "public"."auto_replenishment_rules" from "authenticated";
revoke references on table "public"."auto_replenishment_rules" from "authenticated";
revoke select on table "public"."auto_replenishment_rules" from "authenticated";
revoke trigger on table "public"."auto_replenishment_rules" from "authenticated";
revoke truncate on table "public"."auto_replenishment_rules" from "authenticated";
revoke update on table "public"."auto_replenishment_rules" from "authenticated";
revoke delete on table "public"."auto_replenishment_rules" from "service_role";
revoke insert on table "public"."auto_replenishment_rules" from "service_role";
revoke references on table "public"."auto_replenishment_rules" from "service_role";
revoke select on table "public"."auto_replenishment_rules" from "service_role";
revoke trigger on table "public"."auto_replenishment_rules" from "service_role";
revoke truncate on table "public"."auto_replenishment_rules" from "service_role";
revoke update on table "public"."auto_replenishment_rules" from "service_role";
revoke delete on table "public"."body_map_pain_regions" from "anon";
revoke insert on table "public"."body_map_pain_regions" from "anon";
revoke references on table "public"."body_map_pain_regions" from "anon";
revoke select on table "public"."body_map_pain_regions" from "anon";
revoke trigger on table "public"."body_map_pain_regions" from "anon";
revoke truncate on table "public"."body_map_pain_regions" from "anon";
revoke update on table "public"."body_map_pain_regions" from "anon";
revoke delete on table "public"."body_map_pain_regions" from "authenticated";
revoke insert on table "public"."body_map_pain_regions" from "authenticated";
revoke references on table "public"."body_map_pain_regions" from "authenticated";
revoke select on table "public"."body_map_pain_regions" from "authenticated";
revoke trigger on table "public"."body_map_pain_regions" from "authenticated";
revoke truncate on table "public"."body_map_pain_regions" from "authenticated";
revoke update on table "public"."body_map_pain_regions" from "authenticated";
revoke delete on table "public"."body_map_pain_regions" from "service_role";
revoke insert on table "public"."body_map_pain_regions" from "service_role";
revoke references on table "public"."body_map_pain_regions" from "service_role";
revoke select on table "public"."body_map_pain_regions" from "service_role";
revoke trigger on table "public"."body_map_pain_regions" from "service_role";
revoke truncate on table "public"."body_map_pain_regions" from "service_role";
revoke update on table "public"."body_map_pain_regions" from "service_role";
revoke delete on table "public"."body_map_sessions" from "anon";
revoke insert on table "public"."body_map_sessions" from "anon";
revoke references on table "public"."body_map_sessions" from "anon";
revoke select on table "public"."body_map_sessions" from "anon";
revoke trigger on table "public"."body_map_sessions" from "anon";
revoke truncate on table "public"."body_map_sessions" from "anon";
revoke update on table "public"."body_map_sessions" from "anon";
revoke delete on table "public"."body_map_sessions" from "authenticated";
revoke insert on table "public"."body_map_sessions" from "authenticated";
revoke references on table "public"."body_map_sessions" from "authenticated";
revoke select on table "public"."body_map_sessions" from "authenticated";
revoke trigger on table "public"."body_map_sessions" from "authenticated";
revoke truncate on table "public"."body_map_sessions" from "authenticated";
revoke update on table "public"."body_map_sessions" from "authenticated";
revoke delete on table "public"."body_map_sessions" from "service_role";
revoke insert on table "public"."body_map_sessions" from "service_role";
revoke references on table "public"."body_map_sessions" from "service_role";
revoke select on table "public"."body_map_sessions" from "service_role";
revoke trigger on table "public"."body_map_sessions" from "service_role";
revoke truncate on table "public"."body_map_sessions" from "service_role";
revoke update on table "public"."body_map_sessions" from "service_role";
revoke delete on table "public"."clinical_material_categories" from "anon";
revoke insert on table "public"."clinical_material_categories" from "anon";
revoke references on table "public"."clinical_material_categories" from "anon";
revoke select on table "public"."clinical_material_categories" from "anon";
revoke trigger on table "public"."clinical_material_categories" from "anon";
revoke truncate on table "public"."clinical_material_categories" from "anon";
revoke update on table "public"."clinical_material_categories" from "anon";
revoke delete on table "public"."clinical_material_categories" from "authenticated";
revoke insert on table "public"."clinical_material_categories" from "authenticated";
revoke references on table "public"."clinical_material_categories" from "authenticated";
revoke select on table "public"."clinical_material_categories" from "authenticated";
revoke trigger on table "public"."clinical_material_categories" from "authenticated";
revoke truncate on table "public"."clinical_material_categories" from "authenticated";
revoke update on table "public"."clinical_material_categories" from "authenticated";
revoke delete on table "public"."clinical_material_categories" from "service_role";
revoke insert on table "public"."clinical_material_categories" from "service_role";
revoke references on table "public"."clinical_material_categories" from "service_role";
revoke select on table "public"."clinical_material_categories" from "service_role";
revoke trigger on table "public"."clinical_material_categories" from "service_role";
revoke truncate on table "public"."clinical_material_categories" from "service_role";
revoke update on table "public"."clinical_material_categories" from "service_role";
revoke delete on table "public"."clinical_material_links" from "anon";
revoke insert on table "public"."clinical_material_links" from "anon";
revoke references on table "public"."clinical_material_links" from "anon";
revoke select on table "public"."clinical_material_links" from "anon";
revoke trigger on table "public"."clinical_material_links" from "anon";
revoke truncate on table "public"."clinical_material_links" from "anon";
revoke update on table "public"."clinical_material_links" from "anon";
revoke delete on table "public"."clinical_material_links" from "authenticated";
revoke insert on table "public"."clinical_material_links" from "authenticated";
revoke references on table "public"."clinical_material_links" from "authenticated";
revoke select on table "public"."clinical_material_links" from "authenticated";
revoke trigger on table "public"."clinical_material_links" from "authenticated";
revoke truncate on table "public"."clinical_material_links" from "authenticated";
revoke update on table "public"."clinical_material_links" from "authenticated";
revoke delete on table "public"."clinical_material_links" from "service_role";
revoke insert on table "public"."clinical_material_links" from "service_role";
revoke references on table "public"."clinical_material_links" from "service_role";
revoke select on table "public"."clinical_material_links" from "service_role";
revoke trigger on table "public"."clinical_material_links" from "service_role";
revoke truncate on table "public"."clinical_material_links" from "service_role";
revoke update on table "public"."clinical_material_links" from "service_role";
revoke delete on table "public"."clinical_material_media" from "anon";
revoke insert on table "public"."clinical_material_media" from "anon";
revoke references on table "public"."clinical_material_media" from "anon";
revoke select on table "public"."clinical_material_media" from "anon";
revoke trigger on table "public"."clinical_material_media" from "anon";
revoke truncate on table "public"."clinical_material_media" from "anon";
revoke update on table "public"."clinical_material_media" from "anon";
revoke delete on table "public"."clinical_material_media" from "authenticated";
revoke insert on table "public"."clinical_material_media" from "authenticated";
revoke references on table "public"."clinical_material_media" from "authenticated";
revoke select on table "public"."clinical_material_media" from "authenticated";
revoke trigger on table "public"."clinical_material_media" from "authenticated";
revoke truncate on table "public"."clinical_material_media" from "authenticated";
revoke update on table "public"."clinical_material_media" from "authenticated";
revoke delete on table "public"."clinical_material_media" from "service_role";
revoke insert on table "public"."clinical_material_media" from "service_role";
revoke references on table "public"."clinical_material_media" from "service_role";
revoke select on table "public"."clinical_material_media" from "service_role";
revoke trigger on table "public"."clinical_material_media" from "service_role";
revoke truncate on table "public"."clinical_material_media" from "service_role";
revoke update on table "public"."clinical_material_media" from "service_role";
revoke delete on table "public"."clinical_material_mentions" from "anon";
revoke insert on table "public"."clinical_material_mentions" from "anon";
revoke references on table "public"."clinical_material_mentions" from "anon";
revoke select on table "public"."clinical_material_mentions" from "anon";
revoke trigger on table "public"."clinical_material_mentions" from "anon";
revoke truncate on table "public"."clinical_material_mentions" from "anon";
revoke update on table "public"."clinical_material_mentions" from "anon";
revoke delete on table "public"."clinical_material_mentions" from "authenticated";
revoke insert on table "public"."clinical_material_mentions" from "authenticated";
revoke references on table "public"."clinical_material_mentions" from "authenticated";
revoke select on table "public"."clinical_material_mentions" from "authenticated";
revoke trigger on table "public"."clinical_material_mentions" from "authenticated";
revoke truncate on table "public"."clinical_material_mentions" from "authenticated";
revoke update on table "public"."clinical_material_mentions" from "authenticated";
revoke delete on table "public"."clinical_material_mentions" from "service_role";
revoke insert on table "public"."clinical_material_mentions" from "service_role";
revoke references on table "public"."clinical_material_mentions" from "service_role";
revoke select on table "public"."clinical_material_mentions" from "service_role";
revoke trigger on table "public"."clinical_material_mentions" from "service_role";
revoke truncate on table "public"."clinical_material_mentions" from "service_role";
revoke update on table "public"."clinical_material_mentions" from "service_role";
revoke delete on table "public"."clinical_material_tasks" from "anon";
revoke insert on table "public"."clinical_material_tasks" from "anon";
revoke references on table "public"."clinical_material_tasks" from "anon";
revoke select on table "public"."clinical_material_tasks" from "anon";
revoke trigger on table "public"."clinical_material_tasks" from "anon";
revoke truncate on table "public"."clinical_material_tasks" from "anon";
revoke update on table "public"."clinical_material_tasks" from "anon";
revoke delete on table "public"."clinical_material_tasks" from "authenticated";
revoke insert on table "public"."clinical_material_tasks" from "authenticated";
revoke references on table "public"."clinical_material_tasks" from "authenticated";
revoke select on table "public"."clinical_material_tasks" from "authenticated";
revoke trigger on table "public"."clinical_material_tasks" from "authenticated";
revoke truncate on table "public"."clinical_material_tasks" from "authenticated";
revoke update on table "public"."clinical_material_tasks" from "authenticated";
revoke delete on table "public"."clinical_material_tasks" from "service_role";
revoke insert on table "public"."clinical_material_tasks" from "service_role";
revoke references on table "public"."clinical_material_tasks" from "service_role";
revoke select on table "public"."clinical_material_tasks" from "service_role";
revoke trigger on table "public"."clinical_material_tasks" from "service_role";
revoke truncate on table "public"."clinical_material_tasks" from "service_role";
revoke update on table "public"."clinical_material_tasks" from "service_role";
revoke delete on table "public"."clinical_material_versions" from "anon";
revoke insert on table "public"."clinical_material_versions" from "anon";
revoke references on table "public"."clinical_material_versions" from "anon";
revoke select on table "public"."clinical_material_versions" from "anon";
revoke trigger on table "public"."clinical_material_versions" from "anon";
revoke truncate on table "public"."clinical_material_versions" from "anon";
revoke update on table "public"."clinical_material_versions" from "anon";
revoke delete on table "public"."clinical_material_versions" from "authenticated";
revoke insert on table "public"."clinical_material_versions" from "authenticated";
revoke references on table "public"."clinical_material_versions" from "authenticated";
revoke select on table "public"."clinical_material_versions" from "authenticated";
revoke trigger on table "public"."clinical_material_versions" from "authenticated";
revoke truncate on table "public"."clinical_material_versions" from "authenticated";
revoke update on table "public"."clinical_material_versions" from "authenticated";
revoke delete on table "public"."clinical_material_versions" from "service_role";
revoke insert on table "public"."clinical_material_versions" from "service_role";
revoke references on table "public"."clinical_material_versions" from "service_role";
revoke select on table "public"."clinical_material_versions" from "service_role";
revoke trigger on table "public"."clinical_material_versions" from "service_role";
revoke truncate on table "public"."clinical_material_versions" from "service_role";
revoke update on table "public"."clinical_material_versions" from "service_role";
revoke delete on table "public"."clinical_materials" from "anon";
revoke insert on table "public"."clinical_materials" from "anon";
revoke references on table "public"."clinical_materials" from "anon";
revoke select on table "public"."clinical_materials" from "anon";
revoke trigger on table "public"."clinical_materials" from "anon";
revoke truncate on table "public"."clinical_materials" from "anon";
revoke update on table "public"."clinical_materials" from "anon";
revoke delete on table "public"."clinical_materials" from "authenticated";
revoke insert on table "public"."clinical_materials" from "authenticated";
revoke references on table "public"."clinical_materials" from "authenticated";
revoke select on table "public"."clinical_materials" from "authenticated";
revoke trigger on table "public"."clinical_materials" from "authenticated";
revoke truncate on table "public"."clinical_materials" from "authenticated";
revoke update on table "public"."clinical_materials" from "authenticated";
revoke delete on table "public"."clinical_materials" from "service_role";
revoke insert on table "public"."clinical_materials" from "service_role";
revoke references on table "public"."clinical_materials" from "service_role";
revoke select on table "public"."clinical_materials" from "service_role";
revoke trigger on table "public"."clinical_materials" from "service_role";
revoke truncate on table "public"."clinical_materials" from "service_role";
revoke update on table "public"."clinical_materials" from "service_role";
revoke delete on table "public"."conduct_templates" from "anon";
revoke insert on table "public"."conduct_templates" from "anon";
revoke references on table "public"."conduct_templates" from "anon";
revoke select on table "public"."conduct_templates" from "anon";
revoke trigger on table "public"."conduct_templates" from "anon";
revoke truncate on table "public"."conduct_templates" from "anon";
revoke update on table "public"."conduct_templates" from "anon";
revoke delete on table "public"."conduct_templates" from "authenticated";
revoke insert on table "public"."conduct_templates" from "authenticated";
revoke references on table "public"."conduct_templates" from "authenticated";
revoke select on table "public"."conduct_templates" from "authenticated";
revoke trigger on table "public"."conduct_templates" from "authenticated";
revoke truncate on table "public"."conduct_templates" from "authenticated";
revoke update on table "public"."conduct_templates" from "authenticated";
revoke delete on table "public"."conduct_templates" from "service_role";
revoke insert on table "public"."conduct_templates" from "service_role";
revoke references on table "public"."conduct_templates" from "service_role";
revoke select on table "public"."conduct_templates" from "service_role";
revoke trigger on table "public"."conduct_templates" from "service_role";
revoke truncate on table "public"."conduct_templates" from "service_role";
revoke update on table "public"."conduct_templates" from "service_role";
revoke delete on table "public"."exercise_protocols" from "anon";
revoke insert on table "public"."exercise_protocols" from "anon";
revoke references on table "public"."exercise_protocols" from "anon";
revoke select on table "public"."exercise_protocols" from "anon";
revoke trigger on table "public"."exercise_protocols" from "anon";
revoke truncate on table "public"."exercise_protocols" from "anon";
revoke update on table "public"."exercise_protocols" from "anon";
revoke delete on table "public"."exercise_protocols" from "authenticated";
revoke insert on table "public"."exercise_protocols" from "authenticated";
revoke references on table "public"."exercise_protocols" from "authenticated";
revoke select on table "public"."exercise_protocols" from "authenticated";
revoke trigger on table "public"."exercise_protocols" from "authenticated";
revoke truncate on table "public"."exercise_protocols" from "authenticated";
revoke update on table "public"."exercise_protocols" from "authenticated";
revoke delete on table "public"."exercise_protocols" from "service_role";
revoke insert on table "public"."exercise_protocols" from "service_role";
revoke references on table "public"."exercise_protocols" from "service_role";
revoke select on table "public"."exercise_protocols" from "service_role";
revoke trigger on table "public"."exercise_protocols" from "service_role";
revoke truncate on table "public"."exercise_protocols" from "service_role";
revoke update on table "public"."exercise_protocols" from "service_role";
revoke delete on table "public"."exercises" from "anon";
revoke insert on table "public"."exercises" from "anon";
revoke references on table "public"."exercises" from "anon";
revoke select on table "public"."exercises" from "anon";
revoke trigger on table "public"."exercises" from "anon";
revoke truncate on table "public"."exercises" from "anon";
revoke update on table "public"."exercises" from "anon";
revoke delete on table "public"."exercises" from "authenticated";
revoke insert on table "public"."exercises" from "authenticated";
revoke references on table "public"."exercises" from "authenticated";
revoke select on table "public"."exercises" from "authenticated";
revoke trigger on table "public"."exercises" from "authenticated";
revoke truncate on table "public"."exercises" from "authenticated";
revoke update on table "public"."exercises" from "authenticated";
revoke delete on table "public"."exercises" from "service_role";
revoke insert on table "public"."exercises" from "service_role";
revoke references on table "public"."exercises" from "service_role";
revoke select on table "public"."exercises" from "service_role";
revoke trigger on table "public"."exercises" from "service_role";
revoke truncate on table "public"."exercises" from "service_role";
revoke update on table "public"."exercises" from "service_role";
revoke delete on table "public"."expense_categories" from "anon";
revoke insert on table "public"."expense_categories" from "anon";
revoke references on table "public"."expense_categories" from "anon";
revoke select on table "public"."expense_categories" from "anon";
revoke trigger on table "public"."expense_categories" from "anon";
revoke truncate on table "public"."expense_categories" from "anon";
revoke update on table "public"."expense_categories" from "anon";
revoke delete on table "public"."expense_categories" from "authenticated";
revoke insert on table "public"."expense_categories" from "authenticated";
revoke references on table "public"."expense_categories" from "authenticated";
revoke select on table "public"."expense_categories" from "authenticated";
revoke trigger on table "public"."expense_categories" from "authenticated";
revoke truncate on table "public"."expense_categories" from "authenticated";
revoke update on table "public"."expense_categories" from "authenticated";
revoke delete on table "public"."expense_categories" from "service_role";
revoke insert on table "public"."expense_categories" from "service_role";
revoke references on table "public"."expense_categories" from "service_role";
revoke select on table "public"."expense_categories" from "service_role";
revoke trigger on table "public"."expense_categories" from "service_role";
revoke truncate on table "public"."expense_categories" from "service_role";
revoke update on table "public"."expense_categories" from "service_role";
revoke delete on table "public"."financial_transactions" from "anon";
revoke insert on table "public"."financial_transactions" from "anon";
revoke references on table "public"."financial_transactions" from "anon";
revoke select on table "public"."financial_transactions" from "anon";
revoke trigger on table "public"."financial_transactions" from "anon";
revoke truncate on table "public"."financial_transactions" from "anon";
revoke update on table "public"."financial_transactions" from "anon";
revoke delete on table "public"."financial_transactions" from "authenticated";
revoke insert on table "public"."financial_transactions" from "authenticated";
revoke references on table "public"."financial_transactions" from "authenticated";
revoke select on table "public"."financial_transactions" from "authenticated";
revoke trigger on table "public"."financial_transactions" from "authenticated";
revoke truncate on table "public"."financial_transactions" from "authenticated";
revoke update on table "public"."financial_transactions" from "authenticated";
revoke delete on table "public"."financial_transactions" from "service_role";
revoke insert on table "public"."financial_transactions" from "service_role";
revoke references on table "public"."financial_transactions" from "service_role";
revoke select on table "public"."financial_transactions" from "service_role";
revoke trigger on table "public"."financial_transactions" from "service_role";
revoke truncate on table "public"."financial_transactions" from "service_role";
revoke update on table "public"."financial_transactions" from "service_role";
revoke delete on table "public"."mandatory_test_alerts" from "anon";
revoke insert on table "public"."mandatory_test_alerts" from "anon";
revoke references on table "public"."mandatory_test_alerts" from "anon";
revoke select on table "public"."mandatory_test_alerts" from "anon";
revoke trigger on table "public"."mandatory_test_alerts" from "anon";
revoke truncate on table "public"."mandatory_test_alerts" from "anon";
revoke update on table "public"."mandatory_test_alerts" from "anon";
revoke delete on table "public"."mandatory_test_alerts" from "authenticated";
revoke insert on table "public"."mandatory_test_alerts" from "authenticated";
revoke references on table "public"."mandatory_test_alerts" from "authenticated";
revoke select on table "public"."mandatory_test_alerts" from "authenticated";
revoke trigger on table "public"."mandatory_test_alerts" from "authenticated";
revoke truncate on table "public"."mandatory_test_alerts" from "authenticated";
revoke update on table "public"."mandatory_test_alerts" from "authenticated";
revoke delete on table "public"."mandatory_test_alerts" from "service_role";
revoke insert on table "public"."mandatory_test_alerts" from "service_role";
revoke references on table "public"."mandatory_test_alerts" from "service_role";
revoke select on table "public"."mandatory_test_alerts" from "service_role";
revoke trigger on table "public"."mandatory_test_alerts" from "service_role";
revoke truncate on table "public"."mandatory_test_alerts" from "service_role";
revoke update on table "public"."mandatory_test_alerts" from "service_role";
revoke delete on table "public"."medical_insights" from "anon";
revoke insert on table "public"."medical_insights" from "anon";
revoke references on table "public"."medical_insights" from "anon";
revoke select on table "public"."medical_insights" from "anon";
revoke trigger on table "public"."medical_insights" from "anon";
revoke truncate on table "public"."medical_insights" from "anon";
revoke update on table "public"."medical_insights" from "anon";
revoke delete on table "public"."medical_insights" from "authenticated";
revoke insert on table "public"."medical_insights" from "authenticated";
revoke references on table "public"."medical_insights" from "authenticated";
revoke select on table "public"."medical_insights" from "authenticated";
revoke trigger on table "public"."medical_insights" from "authenticated";
revoke truncate on table "public"."medical_insights" from "authenticated";
revoke update on table "public"."medical_insights" from "authenticated";
revoke delete on table "public"."medical_insights" from "service_role";
revoke insert on table "public"."medical_insights" from "service_role";
revoke references on table "public"."medical_insights" from "service_role";
revoke select on table "public"."medical_insights" from "service_role";
revoke trigger on table "public"."medical_insights" from "service_role";
revoke truncate on table "public"."medical_insights" from "service_role";
revoke update on table "public"."medical_insights" from "service_role";
revoke delete on table "public"."notification_logs" from "anon";
revoke insert on table "public"."notification_logs" from "anon";
revoke references on table "public"."notification_logs" from "anon";
revoke select on table "public"."notification_logs" from "anon";
revoke trigger on table "public"."notification_logs" from "anon";
revoke truncate on table "public"."notification_logs" from "anon";
revoke update on table "public"."notification_logs" from "anon";
revoke delete on table "public"."notification_logs" from "authenticated";
revoke insert on table "public"."notification_logs" from "authenticated";
revoke references on table "public"."notification_logs" from "authenticated";
revoke select on table "public"."notification_logs" from "authenticated";
revoke trigger on table "public"."notification_logs" from "authenticated";
revoke truncate on table "public"."notification_logs" from "authenticated";
revoke update on table "public"."notification_logs" from "authenticated";
revoke delete on table "public"."notification_logs" from "service_role";
revoke insert on table "public"."notification_logs" from "service_role";
revoke references on table "public"."notification_logs" from "service_role";
revoke select on table "public"."notification_logs" from "service_role";
revoke trigger on table "public"."notification_logs" from "service_role";
revoke truncate on table "public"."notification_logs" from "service_role";
revoke update on table "public"."notification_logs" from "service_role";
revoke delete on table "public"."notification_templates" from "anon";
revoke insert on table "public"."notification_templates" from "anon";
revoke references on table "public"."notification_templates" from "anon";
revoke select on table "public"."notification_templates" from "anon";
revoke trigger on table "public"."notification_templates" from "anon";
revoke truncate on table "public"."notification_templates" from "anon";
revoke update on table "public"."notification_templates" from "anon";
revoke delete on table "public"."notification_templates" from "authenticated";
revoke insert on table "public"."notification_templates" from "authenticated";
revoke references on table "public"."notification_templates" from "authenticated";
revoke select on table "public"."notification_templates" from "authenticated";
revoke trigger on table "public"."notification_templates" from "authenticated";
revoke truncate on table "public"."notification_templates" from "authenticated";
revoke update on table "public"."notification_templates" from "authenticated";
revoke delete on table "public"."notification_templates" from "service_role";
revoke insert on table "public"."notification_templates" from "service_role";
revoke references on table "public"."notification_templates" from "service_role";
revoke select on table "public"."notification_templates" from "service_role";
revoke trigger on table "public"."notification_templates" from "service_role";
revoke truncate on table "public"."notification_templates" from "service_role";
revoke update on table "public"."notification_templates" from "service_role";
revoke delete on table "public"."notifications" from "anon";
revoke insert on table "public"."notifications" from "anon";
revoke references on table "public"."notifications" from "anon";
revoke select on table "public"."notifications" from "anon";
revoke trigger on table "public"."notifications" from "anon";
revoke truncate on table "public"."notifications" from "anon";
revoke update on table "public"."notifications" from "anon";
revoke delete on table "public"."notifications" from "authenticated";
revoke insert on table "public"."notifications" from "authenticated";
revoke references on table "public"."notifications" from "authenticated";
revoke select on table "public"."notifications" from "authenticated";
revoke trigger on table "public"."notifications" from "authenticated";
revoke truncate on table "public"."notifications" from "authenticated";
revoke update on table "public"."notifications" from "authenticated";
revoke delete on table "public"."notifications" from "service_role";
revoke insert on table "public"."notifications" from "service_role";
revoke references on table "public"."notifications" from "service_role";
revoke select on table "public"."notifications" from "service_role";
revoke trigger on table "public"."notifications" from "service_role";
revoke truncate on table "public"."notifications" from "service_role";
revoke update on table "public"."notifications" from "service_role";
revoke delete on table "public"."pathologies" from "anon";
revoke insert on table "public"."pathologies" from "anon";
revoke references on table "public"."pathologies" from "anon";
revoke select on table "public"."pathologies" from "anon";
revoke trigger on table "public"."pathologies" from "anon";
revoke truncate on table "public"."pathologies" from "anon";
revoke update on table "public"."pathologies" from "anon";
revoke delete on table "public"."pathologies" from "authenticated";
revoke insert on table "public"."pathologies" from "authenticated";
revoke references on table "public"."pathologies" from "authenticated";
revoke select on table "public"."pathologies" from "authenticated";
revoke trigger on table "public"."pathologies" from "authenticated";
revoke truncate on table "public"."pathologies" from "authenticated";
revoke update on table "public"."pathologies" from "authenticated";
revoke delete on table "public"."pathologies" from "service_role";
revoke insert on table "public"."pathologies" from "service_role";
revoke references on table "public"."pathologies" from "service_role";
revoke select on table "public"."pathologies" from "service_role";
revoke trigger on table "public"."pathologies" from "service_role";
revoke truncate on table "public"."pathologies" from "service_role";
revoke update on table "public"."pathologies" from "service_role";
revoke delete on table "public"."patient_exercise_prescriptions" from "anon";
revoke insert on table "public"."patient_exercise_prescriptions" from "anon";
revoke references on table "public"."patient_exercise_prescriptions" from "anon";
revoke select on table "public"."patient_exercise_prescriptions" from "anon";
revoke trigger on table "public"."patient_exercise_prescriptions" from "anon";
revoke truncate on table "public"."patient_exercise_prescriptions" from "anon";
revoke update on table "public"."patient_exercise_prescriptions" from "anon";
revoke delete on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke insert on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke references on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke select on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke trigger on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke truncate on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke update on table "public"."patient_exercise_prescriptions" from "authenticated";
revoke delete on table "public"."patient_exercise_prescriptions" from "service_role";
revoke insert on table "public"."patient_exercise_prescriptions" from "service_role";
revoke references on table "public"."patient_exercise_prescriptions" from "service_role";
revoke select on table "public"."patient_exercise_prescriptions" from "service_role";
revoke trigger on table "public"."patient_exercise_prescriptions" from "service_role";
revoke truncate on table "public"."patient_exercise_prescriptions" from "service_role";
revoke update on table "public"."patient_exercise_prescriptions" from "service_role";
revoke delete on table "public"."patient_goals" from "anon";
revoke insert on table "public"."patient_goals" from "anon";
revoke references on table "public"."patient_goals" from "anon";
revoke select on table "public"."patient_goals" from "anon";
revoke trigger on table "public"."patient_goals" from "anon";
revoke truncate on table "public"."patient_goals" from "anon";
revoke update on table "public"."patient_goals" from "anon";
revoke delete on table "public"."patient_goals" from "authenticated";
revoke insert on table "public"."patient_goals" from "authenticated";
revoke references on table "public"."patient_goals" from "authenticated";
revoke select on table "public"."patient_goals" from "authenticated";
revoke trigger on table "public"."patient_goals" from "authenticated";
revoke truncate on table "public"."patient_goals" from "authenticated";
revoke update on table "public"."patient_goals" from "authenticated";
revoke delete on table "public"."patient_goals" from "service_role";
revoke insert on table "public"."patient_goals" from "service_role";
revoke references on table "public"."patient_goals" from "service_role";
revoke select on table "public"."patient_goals" from "service_role";
revoke trigger on table "public"."patient_goals" from "service_role";
revoke truncate on table "public"."patient_goals" from "service_role";
revoke update on table "public"."patient_goals" from "service_role";
revoke delete on table "public"."patient_messages" from "anon";
revoke insert on table "public"."patient_messages" from "anon";
revoke references on table "public"."patient_messages" from "anon";
revoke select on table "public"."patient_messages" from "anon";
revoke trigger on table "public"."patient_messages" from "anon";
revoke truncate on table "public"."patient_messages" from "anon";
revoke update on table "public"."patient_messages" from "anon";
revoke delete on table "public"."patient_messages" from "authenticated";
revoke insert on table "public"."patient_messages" from "authenticated";
revoke references on table "public"."patient_messages" from "authenticated";
revoke select on table "public"."patient_messages" from "authenticated";
revoke trigger on table "public"."patient_messages" from "authenticated";
revoke truncate on table "public"."patient_messages" from "authenticated";
revoke update on table "public"."patient_messages" from "authenticated";
revoke delete on table "public"."patient_messages" from "service_role";
revoke insert on table "public"."patient_messages" from "service_role";
revoke references on table "public"."patient_messages" from "service_role";
revoke select on table "public"."patient_messages" from "service_role";
revoke trigger on table "public"."patient_messages" from "service_role";
revoke truncate on table "public"."patient_messages" from "service_role";
revoke update on table "public"."patient_messages" from "service_role";
revoke delete on table "public"."patients" from "anon";
revoke insert on table "public"."patients" from "anon";
revoke references on table "public"."patients" from "anon";
revoke select on table "public"."patients" from "anon";
revoke trigger on table "public"."patients" from "anon";
revoke truncate on table "public"."patients" from "anon";
revoke update on table "public"."patients" from "anon";
revoke delete on table "public"."patients" from "authenticated";
revoke insert on table "public"."patients" from "authenticated";
revoke references on table "public"."patients" from "authenticated";
revoke select on table "public"."patients" from "authenticated";
revoke trigger on table "public"."patients" from "authenticated";
revoke truncate on table "public"."patients" from "authenticated";
revoke update on table "public"."patients" from "authenticated";
revoke delete on table "public"."patients" from "service_role";
revoke insert on table "public"."patients" from "service_role";
revoke references on table "public"."patients" from "service_role";
revoke select on table "public"."patients" from "service_role";
revoke trigger on table "public"."patients" from "service_role";
revoke truncate on table "public"."patients" from "service_role";
revoke update on table "public"."patients" from "service_role";
revoke delete on table "public"."payment_settings" from "anon";
revoke insert on table "public"."payment_settings" from "anon";
revoke references on table "public"."payment_settings" from "anon";
revoke select on table "public"."payment_settings" from "anon";
revoke trigger on table "public"."payment_settings" from "anon";
revoke truncate on table "public"."payment_settings" from "anon";
revoke update on table "public"."payment_settings" from "anon";
revoke delete on table "public"."payment_settings" from "authenticated";
revoke insert on table "public"."payment_settings" from "authenticated";
revoke references on table "public"."payment_settings" from "authenticated";
revoke select on table "public"."payment_settings" from "authenticated";
revoke trigger on table "public"."payment_settings" from "authenticated";
revoke truncate on table "public"."payment_settings" from "authenticated";
revoke update on table "public"."payment_settings" from "authenticated";
revoke delete on table "public"."payment_settings" from "service_role";
revoke insert on table "public"."payment_settings" from "service_role";
revoke references on table "public"."payment_settings" from "service_role";
revoke select on table "public"."payment_settings" from "service_role";
revoke trigger on table "public"."payment_settings" from "service_role";
revoke truncate on table "public"."payment_settings" from "service_role";
revoke update on table "public"."payment_settings" from "service_role";
revoke delete on table "public"."payment_transactions" from "anon";
revoke insert on table "public"."payment_transactions" from "anon";
revoke references on table "public"."payment_transactions" from "anon";
revoke select on table "public"."payment_transactions" from "anon";
revoke trigger on table "public"."payment_transactions" from "anon";
revoke truncate on table "public"."payment_transactions" from "anon";
revoke update on table "public"."payment_transactions" from "anon";
revoke delete on table "public"."payment_transactions" from "authenticated";
revoke insert on table "public"."payment_transactions" from "authenticated";
revoke references on table "public"."payment_transactions" from "authenticated";
revoke select on table "public"."payment_transactions" from "authenticated";
revoke trigger on table "public"."payment_transactions" from "authenticated";
revoke truncate on table "public"."payment_transactions" from "authenticated";
revoke update on table "public"."payment_transactions" from "authenticated";
revoke delete on table "public"."payment_transactions" from "service_role";
revoke insert on table "public"."payment_transactions" from "service_role";
revoke references on table "public"."payment_transactions" from "service_role";
revoke select on table "public"."payment_transactions" from "service_role";
revoke trigger on table "public"."payment_transactions" from "service_role";
revoke truncate on table "public"."payment_transactions" from "service_role";
revoke update on table "public"."payment_transactions" from "service_role";
revoke delete on table "public"."payments" from "anon";
revoke insert on table "public"."payments" from "anon";
revoke references on table "public"."payments" from "anon";
revoke select on table "public"."payments" from "anon";
revoke trigger on table "public"."payments" from "anon";
revoke truncate on table "public"."payments" from "anon";
revoke update on table "public"."payments" from "anon";
revoke delete on table "public"."payments" from "authenticated";
revoke insert on table "public"."payments" from "authenticated";
revoke references on table "public"."payments" from "authenticated";
revoke select on table "public"."payments" from "authenticated";
revoke trigger on table "public"."payments" from "authenticated";
revoke truncate on table "public"."payments" from "authenticated";
revoke update on table "public"."payments" from "authenticated";
revoke delete on table "public"."payments" from "service_role";
revoke insert on table "public"."payments" from "service_role";
revoke references on table "public"."payments" from "service_role";
revoke select on table "public"."payments" from "service_role";
revoke trigger on table "public"."payments" from "service_role";
revoke truncate on table "public"."payments" from "service_role";
revoke update on table "public"."payments" from "service_role";
revoke delete on table "public"."purchase_approvals" from "anon";
revoke insert on table "public"."purchase_approvals" from "anon";
revoke references on table "public"."purchase_approvals" from "anon";
revoke select on table "public"."purchase_approvals" from "anon";
revoke trigger on table "public"."purchase_approvals" from "anon";
revoke truncate on table "public"."purchase_approvals" from "anon";
revoke update on table "public"."purchase_approvals" from "anon";
revoke delete on table "public"."purchase_approvals" from "authenticated";
revoke insert on table "public"."purchase_approvals" from "authenticated";
revoke references on table "public"."purchase_approvals" from "authenticated";
revoke select on table "public"."purchase_approvals" from "authenticated";
revoke trigger on table "public"."purchase_approvals" from "authenticated";
revoke truncate on table "public"."purchase_approvals" from "authenticated";
revoke update on table "public"."purchase_approvals" from "authenticated";
revoke delete on table "public"."purchase_approvals" from "service_role";
revoke insert on table "public"."purchase_approvals" from "service_role";
revoke references on table "public"."purchase_approvals" from "service_role";
revoke select on table "public"."purchase_approvals" from "service_role";
revoke trigger on table "public"."purchase_approvals" from "service_role";
revoke truncate on table "public"."purchase_approvals" from "service_role";
revoke update on table "public"."purchase_approvals" from "service_role";
revoke delete on table "public"."purchase_order_items" from "anon";
revoke insert on table "public"."purchase_order_items" from "anon";
revoke references on table "public"."purchase_order_items" from "anon";
revoke select on table "public"."purchase_order_items" from "anon";
revoke trigger on table "public"."purchase_order_items" from "anon";
revoke truncate on table "public"."purchase_order_items" from "anon";
revoke update on table "public"."purchase_order_items" from "anon";
revoke delete on table "public"."purchase_order_items" from "authenticated";
revoke insert on table "public"."purchase_order_items" from "authenticated";
revoke references on table "public"."purchase_order_items" from "authenticated";
revoke select on table "public"."purchase_order_items" from "authenticated";
revoke trigger on table "public"."purchase_order_items" from "authenticated";
revoke truncate on table "public"."purchase_order_items" from "authenticated";
revoke update on table "public"."purchase_order_items" from "authenticated";
revoke delete on table "public"."purchase_order_items" from "service_role";
revoke insert on table "public"."purchase_order_items" from "service_role";
revoke references on table "public"."purchase_order_items" from "service_role";
revoke select on table "public"."purchase_order_items" from "service_role";
revoke trigger on table "public"."purchase_order_items" from "service_role";
revoke truncate on table "public"."purchase_order_items" from "service_role";
revoke update on table "public"."purchase_order_items" from "service_role";
revoke delete on table "public"."purchase_orders" from "anon";
revoke insert on table "public"."purchase_orders" from "anon";
revoke references on table "public"."purchase_orders" from "anon";
revoke select on table "public"."purchase_orders" from "anon";
revoke trigger on table "public"."purchase_orders" from "anon";
revoke truncate on table "public"."purchase_orders" from "anon";
revoke update on table "public"."purchase_orders" from "anon";
revoke delete on table "public"."purchase_orders" from "authenticated";
revoke insert on table "public"."purchase_orders" from "authenticated";
revoke references on table "public"."purchase_orders" from "authenticated";
revoke select on table "public"."purchase_orders" from "authenticated";
revoke trigger on table "public"."purchase_orders" from "authenticated";
revoke truncate on table "public"."purchase_orders" from "authenticated";
revoke update on table "public"."purchase_orders" from "authenticated";
revoke delete on table "public"."purchase_orders" from "service_role";
revoke insert on table "public"."purchase_orders" from "service_role";
revoke references on table "public"."purchase_orders" from "service_role";
revoke select on table "public"."purchase_orders" from "service_role";
revoke trigger on table "public"."purchase_orders" from "service_role";
revoke truncate on table "public"."purchase_orders" from "service_role";
revoke update on table "public"."purchase_orders" from "service_role";
revoke delete on table "public"."schedule_blocks" from "anon";
revoke insert on table "public"."schedule_blocks" from "anon";
revoke references on table "public"."schedule_blocks" from "anon";
revoke select on table "public"."schedule_blocks" from "anon";
revoke trigger on table "public"."schedule_blocks" from "anon";
revoke truncate on table "public"."schedule_blocks" from "anon";
revoke update on table "public"."schedule_blocks" from "anon";
revoke delete on table "public"."schedule_blocks" from "authenticated";
revoke insert on table "public"."schedule_blocks" from "authenticated";
revoke references on table "public"."schedule_blocks" from "authenticated";
revoke select on table "public"."schedule_blocks" from "authenticated";
revoke trigger on table "public"."schedule_blocks" from "authenticated";
revoke truncate on table "public"."schedule_blocks" from "authenticated";
revoke update on table "public"."schedule_blocks" from "authenticated";
revoke delete on table "public"."schedule_blocks" from "service_role";
revoke insert on table "public"."schedule_blocks" from "service_role";
revoke references on table "public"."schedule_blocks" from "service_role";
revoke select on table "public"."schedule_blocks" from "service_role";
revoke trigger on table "public"."schedule_blocks" from "service_role";
revoke truncate on table "public"."schedule_blocks" from "service_role";
revoke update on table "public"."schedule_blocks" from "service_role";
revoke delete on table "public"."session_evolutions" from "anon";
revoke insert on table "public"."session_evolutions" from "anon";
revoke references on table "public"."session_evolutions" from "anon";
revoke select on table "public"."session_evolutions" from "anon";
revoke trigger on table "public"."session_evolutions" from "anon";
revoke truncate on table "public"."session_evolutions" from "anon";
revoke update on table "public"."session_evolutions" from "anon";
revoke delete on table "public"."session_evolutions" from "authenticated";
revoke insert on table "public"."session_evolutions" from "authenticated";
revoke references on table "public"."session_evolutions" from "authenticated";
revoke select on table "public"."session_evolutions" from "authenticated";
revoke trigger on table "public"."session_evolutions" from "authenticated";
revoke truncate on table "public"."session_evolutions" from "authenticated";
revoke update on table "public"."session_evolutions" from "authenticated";
revoke delete on table "public"."session_evolutions" from "service_role";
revoke insert on table "public"."session_evolutions" from "service_role";
revoke references on table "public"."session_evolutions" from "service_role";
revoke select on table "public"."session_evolutions" from "service_role";
revoke trigger on table "public"."session_evolutions" from "service_role";
revoke truncate on table "public"."session_evolutions" from "service_role";
revoke update on table "public"."session_evolutions" from "service_role";
revoke delete on table "public"."soap_notes" from "anon";
revoke insert on table "public"."soap_notes" from "anon";
revoke references on table "public"."soap_notes" from "anon";
revoke select on table "public"."soap_notes" from "anon";
revoke trigger on table "public"."soap_notes" from "anon";
revoke truncate on table "public"."soap_notes" from "anon";
revoke update on table "public"."soap_notes" from "anon";
revoke delete on table "public"."soap_notes" from "authenticated";
revoke insert on table "public"."soap_notes" from "authenticated";
revoke references on table "public"."soap_notes" from "authenticated";
revoke select on table "public"."soap_notes" from "authenticated";
revoke trigger on table "public"."soap_notes" from "authenticated";
revoke truncate on table "public"."soap_notes" from "authenticated";
revoke update on table "public"."soap_notes" from "authenticated";
revoke delete on table "public"."soap_notes" from "service_role";
revoke insert on table "public"."soap_notes" from "service_role";
revoke references on table "public"."soap_notes" from "service_role";
revoke select on table "public"."soap_notes" from "service_role";
revoke trigger on table "public"."soap_notes" from "service_role";
revoke truncate on table "public"."soap_notes" from "service_role";
revoke update on table "public"."soap_notes" from "service_role";
revoke delete on table "public"."stock_movements" from "anon";
revoke insert on table "public"."stock_movements" from "anon";
revoke references on table "public"."stock_movements" from "anon";
revoke select on table "public"."stock_movements" from "anon";
revoke trigger on table "public"."stock_movements" from "anon";
revoke truncate on table "public"."stock_movements" from "anon";
revoke update on table "public"."stock_movements" from "anon";
revoke delete on table "public"."stock_movements" from "authenticated";
revoke insert on table "public"."stock_movements" from "authenticated";
revoke references on table "public"."stock_movements" from "authenticated";
revoke select on table "public"."stock_movements" from "authenticated";
revoke trigger on table "public"."stock_movements" from "authenticated";
revoke truncate on table "public"."stock_movements" from "authenticated";
revoke update on table "public"."stock_movements" from "authenticated";
revoke delete on table "public"."stock_movements" from "service_role";
revoke insert on table "public"."stock_movements" from "service_role";
revoke references on table "public"."stock_movements" from "service_role";
revoke select on table "public"."stock_movements" from "service_role";
revoke trigger on table "public"."stock_movements" from "service_role";
revoke truncate on table "public"."stock_movements" from "service_role";
revoke update on table "public"."stock_movements" from "service_role";
revoke delete on table "public"."suppliers" from "anon";
revoke insert on table "public"."suppliers" from "anon";
revoke references on table "public"."suppliers" from "anon";
revoke select on table "public"."suppliers" from "anon";
revoke trigger on table "public"."suppliers" from "anon";
revoke truncate on table "public"."suppliers" from "anon";
revoke update on table "public"."suppliers" from "anon";
revoke delete on table "public"."suppliers" from "authenticated";
revoke insert on table "public"."suppliers" from "authenticated";
revoke references on table "public"."suppliers" from "authenticated";
revoke select on table "public"."suppliers" from "authenticated";
revoke trigger on table "public"."suppliers" from "authenticated";
revoke truncate on table "public"."suppliers" from "authenticated";
revoke update on table "public"."suppliers" from "authenticated";
revoke delete on table "public"."suppliers" from "service_role";
revoke insert on table "public"."suppliers" from "service_role";
revoke references on table "public"."suppliers" from "service_role";
revoke select on table "public"."suppliers" from "service_role";
revoke trigger on table "public"."suppliers" from "service_role";
revoke truncate on table "public"."suppliers" from "service_role";
revoke update on table "public"."suppliers" from "service_role";
revoke delete on table "public"."supplies" from "anon";
revoke insert on table "public"."supplies" from "anon";
revoke references on table "public"."supplies" from "anon";
revoke select on table "public"."supplies" from "anon";
revoke trigger on table "public"."supplies" from "anon";
revoke truncate on table "public"."supplies" from "anon";
revoke update on table "public"."supplies" from "anon";
revoke delete on table "public"."supplies" from "authenticated";
revoke insert on table "public"."supplies" from "authenticated";
revoke references on table "public"."supplies" from "authenticated";
revoke select on table "public"."supplies" from "authenticated";
revoke trigger on table "public"."supplies" from "authenticated";
revoke truncate on table "public"."supplies" from "authenticated";
revoke update on table "public"."supplies" from "authenticated";
revoke delete on table "public"."supplies" from "service_role";
revoke insert on table "public"."supplies" from "service_role";
revoke references on table "public"."supplies" from "service_role";
revoke select on table "public"."supplies" from "service_role";
revoke trigger on table "public"."supplies" from "service_role";
revoke truncate on table "public"."supplies" from "service_role";
revoke update on table "public"."supplies" from "service_role";
revoke delete on table "public"."supply_alerts" from "anon";
revoke insert on table "public"."supply_alerts" from "anon";
revoke references on table "public"."supply_alerts" from "anon";
revoke select on table "public"."supply_alerts" from "anon";
revoke trigger on table "public"."supply_alerts" from "anon";
revoke truncate on table "public"."supply_alerts" from "anon";
revoke update on table "public"."supply_alerts" from "anon";
revoke delete on table "public"."supply_alerts" from "authenticated";
revoke insert on table "public"."supply_alerts" from "authenticated";
revoke references on table "public"."supply_alerts" from "authenticated";
revoke select on table "public"."supply_alerts" from "authenticated";
revoke trigger on table "public"."supply_alerts" from "authenticated";
revoke truncate on table "public"."supply_alerts" from "authenticated";
revoke update on table "public"."supply_alerts" from "authenticated";
revoke delete on table "public"."supply_alerts" from "service_role";
revoke insert on table "public"."supply_alerts" from "service_role";
revoke references on table "public"."supply_alerts" from "service_role";
revoke select on table "public"."supply_alerts" from "service_role";
revoke trigger on table "public"."supply_alerts" from "service_role";
revoke truncate on table "public"."supply_alerts" from "service_role";
revoke update on table "public"."supply_alerts" from "service_role";
revoke delete on table "public"."supply_batches" from "anon";
revoke insert on table "public"."supply_batches" from "anon";
revoke references on table "public"."supply_batches" from "anon";
revoke select on table "public"."supply_batches" from "anon";
revoke trigger on table "public"."supply_batches" from "anon";
revoke truncate on table "public"."supply_batches" from "anon";
revoke update on table "public"."supply_batches" from "anon";
revoke delete on table "public"."supply_batches" from "authenticated";
revoke insert on table "public"."supply_batches" from "authenticated";
revoke references on table "public"."supply_batches" from "authenticated";
revoke select on table "public"."supply_batches" from "authenticated";
revoke trigger on table "public"."supply_batches" from "authenticated";
revoke truncate on table "public"."supply_batches" from "authenticated";
revoke update on table "public"."supply_batches" from "authenticated";
revoke delete on table "public"."supply_batches" from "service_role";
revoke insert on table "public"."supply_batches" from "service_role";
revoke references on table "public"."supply_batches" from "service_role";
revoke select on table "public"."supply_batches" from "service_role";
revoke trigger on table "public"."supply_batches" from "service_role";
revoke truncate on table "public"."supply_batches" from "service_role";
revoke update on table "public"."supply_batches" from "service_role";
revoke delete on table "public"."surgeries" from "anon";
revoke insert on table "public"."surgeries" from "anon";
revoke references on table "public"."surgeries" from "anon";
revoke select on table "public"."surgeries" from "anon";
revoke trigger on table "public"."surgeries" from "anon";
revoke truncate on table "public"."surgeries" from "anon";
revoke update on table "public"."surgeries" from "anon";
revoke delete on table "public"."surgeries" from "authenticated";
revoke insert on table "public"."surgeries" from "authenticated";
revoke references on table "public"."surgeries" from "authenticated";
revoke select on table "public"."surgeries" from "authenticated";
revoke trigger on table "public"."surgeries" from "authenticated";
revoke truncate on table "public"."surgeries" from "authenticated";
revoke update on table "public"."surgeries" from "authenticated";
revoke delete on table "public"."surgeries" from "service_role";
revoke insert on table "public"."surgeries" from "service_role";
revoke references on table "public"."surgeries" from "service_role";
revoke select on table "public"."surgeries" from "service_role";
revoke trigger on table "public"."surgeries" from "service_role";
revoke truncate on table "public"."surgeries" from "service_role";
revoke update on table "public"."surgeries" from "service_role";
revoke delete on table "public"."task_supplies_used" from "anon";
revoke insert on table "public"."task_supplies_used" from "anon";
revoke references on table "public"."task_supplies_used" from "anon";
revoke select on table "public"."task_supplies_used" from "anon";
revoke trigger on table "public"."task_supplies_used" from "anon";
revoke truncate on table "public"."task_supplies_used" from "anon";
revoke update on table "public"."task_supplies_used" from "anon";
revoke delete on table "public"."task_supplies_used" from "authenticated";
revoke insert on table "public"."task_supplies_used" from "authenticated";
revoke references on table "public"."task_supplies_used" from "authenticated";
revoke select on table "public"."task_supplies_used" from "authenticated";
revoke trigger on table "public"."task_supplies_used" from "authenticated";
revoke truncate on table "public"."task_supplies_used" from "authenticated";
revoke update on table "public"."task_supplies_used" from "authenticated";
revoke delete on table "public"."task_supplies_used" from "service_role";
revoke insert on table "public"."task_supplies_used" from "service_role";
revoke references on table "public"."task_supplies_used" from "service_role";
revoke select on table "public"."task_supplies_used" from "service_role";
revoke trigger on table "public"."task_supplies_used" from "service_role";
revoke truncate on table "public"."task_supplies_used" from "service_role";
revoke update on table "public"."task_supplies_used" from "service_role";
revoke delete on table "public"."task_type_supply_templates" from "anon";
revoke insert on table "public"."task_type_supply_templates" from "anon";
revoke references on table "public"."task_type_supply_templates" from "anon";
revoke select on table "public"."task_type_supply_templates" from "anon";
revoke trigger on table "public"."task_type_supply_templates" from "anon";
revoke truncate on table "public"."task_type_supply_templates" from "anon";
revoke update on table "public"."task_type_supply_templates" from "anon";
revoke delete on table "public"."task_type_supply_templates" from "authenticated";
revoke insert on table "public"."task_type_supply_templates" from "authenticated";
revoke references on table "public"."task_type_supply_templates" from "authenticated";
revoke select on table "public"."task_type_supply_templates" from "authenticated";
revoke trigger on table "public"."task_type_supply_templates" from "authenticated";
revoke truncate on table "public"."task_type_supply_templates" from "authenticated";
revoke update on table "public"."task_type_supply_templates" from "authenticated";
revoke delete on table "public"."task_type_supply_templates" from "service_role";
revoke insert on table "public"."task_type_supply_templates" from "service_role";
revoke references on table "public"."task_type_supply_templates" from "service_role";
revoke select on table "public"."task_type_supply_templates" from "service_role";
revoke trigger on table "public"."task_type_supply_templates" from "service_role";
revoke truncate on table "public"."task_type_supply_templates" from "service_role";
revoke update on table "public"."task_type_supply_templates" from "service_role";
revoke delete on table "public"."teleconsultas" from "anon";
revoke insert on table "public"."teleconsultas" from "anon";
revoke references on table "public"."teleconsultas" from "anon";
revoke select on table "public"."teleconsultas" from "anon";
revoke trigger on table "public"."teleconsultas" from "anon";
revoke truncate on table "public"."teleconsultas" from "anon";
revoke update on table "public"."teleconsultas" from "anon";
revoke delete on table "public"."teleconsultas" from "authenticated";
revoke insert on table "public"."teleconsultas" from "authenticated";
revoke references on table "public"."teleconsultas" from "authenticated";
revoke select on table "public"."teleconsultas" from "authenticated";
revoke trigger on table "public"."teleconsultas" from "authenticated";
revoke truncate on table "public"."teleconsultas" from "authenticated";
revoke update on table "public"."teleconsultas" from "authenticated";
revoke delete on table "public"."teleconsultas" from "service_role";
revoke insert on table "public"."teleconsultas" from "service_role";
revoke references on table "public"."teleconsultas" from "service_role";
revoke select on table "public"."teleconsultas" from "service_role";
revoke trigger on table "public"."teleconsultas" from "service_role";
revoke truncate on table "public"."teleconsultas" from "service_role";
revoke update on table "public"."teleconsultas" from "service_role";
revoke delete on table "public"."therapists" from "anon";
revoke insert on table "public"."therapists" from "anon";
revoke references on table "public"."therapists" from "anon";
revoke select on table "public"."therapists" from "anon";
revoke trigger on table "public"."therapists" from "anon";
revoke truncate on table "public"."therapists" from "anon";
revoke update on table "public"."therapists" from "anon";
revoke delete on table "public"."therapists" from "authenticated";
revoke insert on table "public"."therapists" from "authenticated";
revoke references on table "public"."therapists" from "authenticated";
revoke select on table "public"."therapists" from "authenticated";
revoke trigger on table "public"."therapists" from "authenticated";
revoke truncate on table "public"."therapists" from "authenticated";
revoke update on table "public"."therapists" from "authenticated";
revoke delete on table "public"."therapists" from "service_role";
revoke insert on table "public"."therapists" from "service_role";
revoke references on table "public"."therapists" from "service_role";
revoke select on table "public"."therapists" from "service_role";
revoke trigger on table "public"."therapists" from "service_role";
revoke truncate on table "public"."therapists" from "service_role";
revoke update on table "public"."therapists" from "service_role";
revoke delete on table "public"."users" from "anon";
revoke insert on table "public"."users" from "anon";
revoke references on table "public"."users" from "anon";
revoke select on table "public"."users" from "anon";
revoke trigger on table "public"."users" from "anon";
revoke truncate on table "public"."users" from "anon";
revoke update on table "public"."users" from "anon";
revoke delete on table "public"."users" from "authenticated";
revoke insert on table "public"."users" from "authenticated";
revoke references on table "public"."users" from "authenticated";
revoke select on table "public"."users" from "authenticated";
revoke trigger on table "public"."users" from "authenticated";
revoke truncate on table "public"."users" from "authenticated";
revoke update on table "public"."users" from "authenticated";
revoke delete on table "public"."users" from "service_role";
revoke insert on table "public"."users" from "service_role";
revoke references on table "public"."users" from "service_role";
revoke select on table "public"."users" from "service_role";
revoke trigger on table "public"."users" from "service_role";
revoke truncate on table "public"."users" from "service_role";
revoke update on table "public"."users" from "service_role";
revoke delete on table "public"."waitlist" from "anon";
revoke insert on table "public"."waitlist" from "anon";
revoke references on table "public"."waitlist" from "anon";
revoke select on table "public"."waitlist" from "anon";
revoke trigger on table "public"."waitlist" from "anon";
revoke truncate on table "public"."waitlist" from "anon";
revoke update on table "public"."waitlist" from "anon";
revoke delete on table "public"."waitlist" from "authenticated";
revoke insert on table "public"."waitlist" from "authenticated";
revoke references on table "public"."waitlist" from "authenticated";
revoke select on table "public"."waitlist" from "authenticated";
revoke trigger on table "public"."waitlist" from "authenticated";
revoke truncate on table "public"."waitlist" from "authenticated";
revoke update on table "public"."waitlist" from "authenticated";
revoke delete on table "public"."waitlist" from "service_role";
revoke insert on table "public"."waitlist" from "service_role";
revoke references on table "public"."waitlist" from "service_role";
revoke select on table "public"."waitlist" from "service_role";
revoke trigger on table "public"."waitlist" from "service_role";
revoke truncate on table "public"."waitlist" from "service_role";
revoke update on table "public"."waitlist" from "service_role";
revoke delete on table "public"."waitlist_entries" from "anon";
revoke insert on table "public"."waitlist_entries" from "anon";
revoke references on table "public"."waitlist_entries" from "anon";
revoke select on table "public"."waitlist_entries" from "anon";
revoke trigger on table "public"."waitlist_entries" from "anon";
revoke truncate on table "public"."waitlist_entries" from "anon";
revoke update on table "public"."waitlist_entries" from "anon";
revoke delete on table "public"."waitlist_entries" from "authenticated";
revoke insert on table "public"."waitlist_entries" from "authenticated";
revoke references on table "public"."waitlist_entries" from "authenticated";
revoke select on table "public"."waitlist_entries" from "authenticated";
revoke trigger on table "public"."waitlist_entries" from "authenticated";
revoke truncate on table "public"."waitlist_entries" from "authenticated";
revoke update on table "public"."waitlist_entries" from "authenticated";
revoke delete on table "public"."waitlist_entries" from "service_role";
revoke insert on table "public"."waitlist_entries" from "service_role";
revoke references on table "public"."waitlist_entries" from "service_role";
revoke select on table "public"."waitlist_entries" from "service_role";
revoke trigger on table "public"."waitlist_entries" from "service_role";
revoke truncate on table "public"."waitlist_entries" from "service_role";
revoke update on table "public"."waitlist_entries" from "service_role";
alter table "public"."assessment_compliance_log" drop constraint "assessment_compliance_log_patient_id_fkey";
alter table "public"."assessment_compliance_log" drop constraint "assessment_compliance_log_recorded_by_fkey";
alter table "public"."assessment_compliance_log" drop constraint "assessment_compliance_log_timing_check";
alter table "public"."clinical_material_categories" drop constraint "clinical_material_categories_name_key";
alter table "public"."clinical_material_links" drop constraint "clinical_material_links_from_material_id_fkey";
alter table "public"."clinical_material_links" drop constraint "clinical_material_links_from_material_id_to_material_id_key";
alter table "public"."clinical_material_links" drop constraint "clinical_material_links_to_material_id_fkey";
alter table "public"."clinical_material_media" drop constraint "clinical_material_media_material_id_fkey";
alter table "public"."clinical_material_media" drop constraint "clinical_material_media_type_check";
alter table "public"."clinical_material_mentions" drop constraint "clinical_material_mentions_material_id_fkey";
alter table "public"."clinical_material_mentions" drop constraint "clinical_material_mentions_status_check";
alter table "public"."clinical_material_mentions" drop constraint "clinical_material_mentions_user_id_fkey";
alter table "public"."clinical_material_tasks" drop constraint "clinical_material_tasks_material_id_fkey";
alter table "public"."clinical_material_tasks" drop constraint "clinical_material_tasks_mention_id_fkey";
alter table "public"."clinical_material_tasks" drop constraint "clinical_material_tasks_priority_check";
alter table "public"."clinical_material_tasks" drop constraint "clinical_material_tasks_status_check";
alter table "public"."clinical_material_tasks" drop constraint "clinical_material_tasks_user_id_fkey";
alter table "public"."clinical_material_versions" drop constraint "clinical_material_versions_created_by_fkey";
alter table "public"."clinical_material_versions" drop constraint "clinical_material_versions_material_id_fkey";
alter table "public"."clinical_materials" drop constraint "clinical_materials_created_by_fkey";
alter table "public"."clinical_materials" drop constraint "clinical_materials_status_check";
alter table "public"."clinical_materials" drop constraint "clinical_materials_updated_by_fkey";
alter table "public"."schedule_blocks" drop constraint "schedule_blocks_created_by_fkey";
alter table "public"."schedule_blocks" drop constraint "schedule_blocks_time_check";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_created_by_fkey";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_no_show_risk_check";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_patient_id_fkey";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_status_check";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_therapist_id_fkey";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_urgency_check";
alter table "public"."schedule_blocks" drop constraint "schedule_blocks_block_type_check";
drop function if exists "public"."calculate_patient_compliance_rate"(p_patient_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone);
drop function if exists "public"."create_material_version"();
drop function if exists "public"."create_notification"(p_user_id uuid, p_type text, p_title text, p_message text, p_metadata jsonb);
drop function if exists "public"."find_available_slots"(p_therapist_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_duration_minutes integer);
drop function if exists "public"."get_compliance_report"(p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_test_type character varying);
drop function if exists "public"."get_related_materials"(material_id uuid);
drop function if exists "public"."increment_material_version"();
drop view if exists "public"."schedule_blocks_with_therapist";
drop function if exists "public"."search_materials"(search_query text, category_filter uuid, tag_filter text[], status_filter text);
drop function if exists "public"."update_compliance_stats"();
drop view if exists "public"."v_assessment_compliance_summary";
drop view if exists "public"."waitlist_with_patient_info";
drop function if exists "public"."create_notification"(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb, p_scheduled_for timestamp with time zone, p_channels text[]);
alter table "public"."assessment_compliance_log" drop constraint "assessment_compliance_log_pkey";
alter table "public"."clinical_material_categories" drop constraint "clinical_material_categories_pkey";
alter table "public"."clinical_material_links" drop constraint "clinical_material_links_pkey";
alter table "public"."clinical_material_media" drop constraint "clinical_material_media_pkey";
alter table "public"."clinical_material_mentions" drop constraint "clinical_material_mentions_pkey";
alter table "public"."clinical_material_tasks" drop constraint "clinical_material_tasks_pkey";
alter table "public"."clinical_material_versions" drop constraint "clinical_material_versions_pkey";
alter table "public"."clinical_materials" drop constraint "clinical_materials_pkey";
alter table "public"."waitlist_entries" drop constraint "waitlist_entries_pkey";
drop index if exists "public"."assessment_compliance_log_pkey";
drop index if exists "public"."clinical_material_categories_name_key";
drop index if exists "public"."clinical_material_categories_pkey";
drop index if exists "public"."clinical_material_links_from_material_id_to_material_id_key";
drop index if exists "public"."clinical_material_links_pkey";
drop index if exists "public"."clinical_material_media_pkey";
drop index if exists "public"."clinical_material_mentions_pkey";
drop index if exists "public"."clinical_material_tasks_pkey";
drop index if exists "public"."clinical_material_versions_pkey";
drop index if exists "public"."clinical_materials_pkey";
drop index if exists "public"."idx_assessment_compliance_log_patient";
drop index if exists "public"."idx_assessment_compliance_log_patient_session";
drop index if exists "public"."idx_assessment_compliance_log_recorded_at";
drop index if exists "public"."idx_assessment_compliance_log_session";
drop index if exists "public"."idx_assessment_compliance_log_test_config";
drop index if exists "public"."idx_assessment_compliance_log_was_measured";
drop index if exists "public"."idx_clinical_materials_category";
drop index if exists "public"."idx_clinical_materials_created_by";
drop index if exists "public"."idx_clinical_materials_name_search";
drop index if exists "public"."idx_clinical_materials_status";
drop index if exists "public"."idx_clinical_materials_tags";
drop index if exists "public"."idx_clinical_materials_updated_at";
drop index if exists "public"."idx_links_from";
drop index if exists "public"."idx_links_to";
drop index if exists "public"."idx_mentions_material";
drop index if exists "public"."idx_mentions_status";
drop index if exists "public"."idx_mentions_user";
drop index if exists "public"."idx_schedule_blocks_end_time";
drop index if exists "public"."idx_schedule_blocks_therapist_id";
drop index if exists "public"."idx_schedule_blocks_time_range";
drop index if exists "public"."idx_schedule_blocks_type";
drop index if exists "public"."idx_tasks_due_date";
drop index if exists "public"."idx_tasks_status";
drop index if exists "public"."idx_tasks_user";
drop index if exists "public"."idx_waitlist_entries_created_at";
drop index if exists "public"."idx_waitlist_entries_patient_id";
drop index if exists "public"."idx_waitlist_entries_preferred_days";
drop index if exists "public"."idx_waitlist_entries_status";
drop index if exists "public"."idx_waitlist_entries_therapist_id";
drop index if exists "public"."idx_waitlist_entries_urgency";
drop index if exists "public"."waitlist_entries_pkey";
drop index if exists "public"."idx_schedule_blocks_active";
drop table "public"."assessment_compliance_log";
drop table "public"."clinical_material_categories";
drop table "public"."clinical_material_links";
drop table "public"."clinical_material_media";
drop table "public"."clinical_material_mentions";
drop table "public"."clinical_material_tasks";
drop table "public"."clinical_material_versions";
drop table "public"."clinical_materials";
drop table "public"."waitlist_entries";
alter table "public"."appointment_requests" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."appointments" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."body_map_pain_regions" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."body_map_sessions" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."conduct_templates" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."exercise_protocols" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."exercises" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."expense_categories" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."financial_transactions" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."mandatory_test_alerts" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."medical_insights" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."notification_logs" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."notification_templates" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."notifications" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."pathologies" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."patient_exercise_prescriptions" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."patient_goals" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."patient_messages" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."patients" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."payment_settings" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."payment_transactions" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."payments" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."schedule_blocks" drop column "created_by";
alter table "public"."schedule_blocks" drop column "metadata";
alter table "public"."schedule_blocks" drop column "reason";
alter table "public"."schedule_blocks" drop column "recurrence_rule";
alter table "public"."schedule_blocks" add column "deleted_at" timestamp with time zone;
alter table "public"."schedule_blocks" add column "is_recurring" boolean default false;
alter table "public"."schedule_blocks" add column "recurrence_end_date" date;
alter table "public"."schedule_blocks" add column "recurrence_pattern" text;
alter table "public"."schedule_blocks" alter column "block_type" set default 'unavailable'::text;
alter table "public"."schedule_blocks" alter column "block_type" drop not null;
alter table "public"."schedule_blocks" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."schedule_blocks" alter column "therapist_id" drop not null;
alter table "public"."session_evolutions" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."soap_notes" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."surgeries" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."teleconsultas" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."therapists" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."users" alter column "id" set default extensions.uuid_generate_v4();
alter table "public"."waitlist" alter column "id" set default extensions.uuid_generate_v4();
drop extension if exists "pg_trgm";
CREATE INDEX idx_schedule_blocks_therapist ON public.schedule_blocks USING btree (therapist_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_schedule_blocks_active ON public.schedule_blocks USING btree (is_active);
alter table "public"."schedule_blocks" add constraint "schedule_blocks_block_type_check" CHECK ((block_type = ANY (ARRAY['unavailable'::text, 'break'::text, 'meeting'::text, 'personal'::text]))) not valid;
alter table "public"."schedule_blocks" validate constraint "schedule_blocks_block_type_check";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.cancel_teleconsulta(p_teleconsulta_id uuid, p_user_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Atualizar status
  UPDATE teleconsultas
  SET
    status = 'cancelled',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{cancellation_reason}',
      to_jsonb(p_reason)
    ),
    metadata = jsonb_set(
      metadata,
      '{cancelled_by}',
      to_jsonb(p_user_id)
    ),
    metadata = jsonb_set(
      metadata,
      '{cancelled_at}',
      to_jsonb(NOW())
    )
  WHERE id = p_teleconsulta_id
    AND status IN ('scheduled', 'waiting')
    AND (patient_id = p_user_id OR therapist_id = p_user_id);

  -- Notificar a outra parte
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    CASE
      WHEN patient_id = p_user_id THEN therapist_id
      ELSE patient_id
    END,
    'teleconsulta_cancelled',
    'Teleconsulta Cancelada',
    'A teleconsulta agendada foi cancelada.',
    jsonb_build_object(
      'teleconsulta_id', p_teleconsulta_id,
      'reason', p_reason
    )
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  RETURN TRUE;
END;
$function$;
CREATE OR REPLACE FUNCTION public.check_and_create_low_stock_alert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Verifica se o estoque está abaixo do mínimo
  IF NEW.current_stock <= NEW.minimum_stock THEN
    -- Verifica se já existe um alerta não resolvido para este insumo
    IF NOT EXISTS (
      SELECT 1 FROM supply_alerts 
      WHERE supply_id = NEW.id 
      AND alert_type IN ('low_stock', 'critical_stock')
      AND is_resolved = false
    ) THEN
      -- Determina o tipo e severidade do alerta
      IF NEW.current_stock = 0 THEN
        INSERT INTO supply_alerts (
          supply_id, 
          alert_type, 
          severity, 
          message
        ) VALUES (
          NEW.id, 
          'critical_stock', 
          'critical',
          'Estoque zerado! Insumo: ' || NEW.name
        );
      ELSE
        INSERT INTO supply_alerts (
          supply_id, 
          alert_type, 
          severity, 
          message
        ) VALUES (
          NEW.id, 
          'low_stock', 
          'high',
          'Estoque baixo! Insumo: ' || NEW.name || ' - Estoque atual: ' || NEW.current_stock
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(p_therapist_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone, p_appointment_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE therapist_id = p_therapist_id
    AND status NOT IN ('cancelled', 'no_show')
    AND deleted_at IS NULL
    AND id != COALESCE(p_appointment_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );

  RETURN conflict_count > 0;
END;
$function$;
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE v_count INTEGER;
BEGIN
  UPDATE notifications
  SET deleted_at = NOW()
  WHERE read = TRUE AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb, p_scheduled_for timestamp with time zone DEFAULT now(), p_channels text[] DEFAULT ARRAY['in_app'::text])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_notification_id UUID;
  v_user_prefs JSONB;
BEGIN
  -- Buscar preferências do usuário
  SELECT notification_preferences INTO v_user_prefs
  FROM users WHERE id = p_user_id;

  -- Verificar se usuário permite este tipo de notificação
  IF v_user_prefs IS NOT NULL AND v_user_prefs ? p_type AND (v_user_prefs ->> p_type)::boolean = false THEN
    RETURN NULL; -- Usuário não quer receber
  END IF;

  -- Inserir notificação usando a coluna 'type'
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    scheduled_for,
    sent_via,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    COALESCE(p_data, '{}'::jsonb),
    COALESCE(p_scheduled_for, NOW()),
    COALESCE(p_channels, ARRAY['in_app']),
    NOW()
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_payment(p_patient_id uuid, p_appointment_id uuid, p_amount numeric, p_payment_method text, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_payment_id UUID;
BEGIN
  -- Inserir pagamento
  INSERT INTO payments (
    patient_id,
    appointment_id,
    amount,
    payment_method,
    description,
    metadata,
    status
  ) VALUES (
    p_patient_id,
    p_appointment_id,
    p_amount,
    p_payment_method,
    p_description,
    p_metadata,
    'pending'
  )
  RETURNING id INTO v_payment_id;

  -- Log do evento
  INSERT INTO payment_transactions (
    payment_id,
    event_type,
    amount,
    status
  ) VALUES (
    v_payment_id,
    'payment_created',
    p_amount,
    'pending'
  );

  RETURN v_payment_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.create_teleconsulta(p_patient_id uuid, p_therapist_id uuid, p_appointment_id uuid, p_scheduled_start timestamp with time zone, p_scheduled_end timestamp with time zone)
 RETURNS TABLE(teleconsulta_id uuid, room_name text, moderator_password text, participant_password text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_room_name TEXT;
  v_mod_password TEXT;
  v_part_password TEXT;
  v_teleconsulta_id UUID;
BEGIN
  -- Gerar room name único
  v_room_name := 'dudufisio-' ||
                 EXTRACT(EPOCH FROM p_scheduled_start)::TEXT || '-' ||
                 substring(md5(random()::text) from 1 for 8);

  -- Gerar senhas aleatórias
  v_mod_password := substring(md5(random()::text) from 1 for 12);
  v_part_password := substring(md5(random()::text) from 1 for 12);

  -- Inserir teleconsulta
  INSERT INTO teleconsultas (
    patient_id,
    therapist_id,
    appointment_id,
    room_name,
    scheduled_start,
    scheduled_end,
    moderator_password,
    participant_password,
    status
  ) VALUES (
    p_patient_id,
    p_therapist_id,
    p_appointment_id,
    v_room_name,
    p_scheduled_start,
    p_scheduled_end,
    v_mod_password,
    v_part_password,
    'scheduled'
  )
  RETURNING id INTO v_teleconsulta_id;

  RETURN QUERY
  SELECT
    v_teleconsulta_id,
    v_room_name,
    v_mod_password,
    v_part_password;
END;
$function$;
CREATE OR REPLACE FUNCTION public.end_teleconsulta(p_teleconsulta_id uuid, p_therapist_notes text DEFAULT NULL::text, p_connection_quality text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_duration INTEGER;
BEGIN
  -- Buscar informações
  SELECT started_at INTO v_start_time
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  IF v_start_time IS NULL THEN
    RAISE EXCEPTION 'Teleconsulta não foi iniciada';
  END IF;

  -- Calcular duração
  v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;

  -- Atualizar teleconsulta
  UPDATE teleconsultas
  SET
    status = 'completed',
    ended_at = NOW(),
    duration_minutes = v_duration,
    therapist_notes = COALESCE(p_therapist_notes, therapist_notes),
    connection_quality = COALESCE(p_connection_quality, connection_quality)
  WHERE id = p_teleconsulta_id
    AND status = 'in_progress';

  -- Criar notificação para o paciente
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    patient_id,
    'teleconsulta_completed',
    'Teleconsulta Finalizada',
    'Sua teleconsulta foi concluída. Por favor, avalie a experiência.',
    jsonb_build_object('teleconsulta_id', p_teleconsulta_id)
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  RETURN TRUE;
END;
$function$;
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.order_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(COALESCE((SELECT COUNT(*) + 1 FROM purchase_orders WHERE DATE(created_at) = DATE(NOW()))::TEXT, '1'), 4, '0');
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_exercise_statistics()
 RETURNS TABLE(total_exercises integer, by_category jsonb, by_difficulty jsonb, most_used_exercises jsonb)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_exercises,
    jsonb_object_agg(category, count) AS by_category,
    jsonb_object_agg(difficulty_level, diff_count) AS by_difficulty,
    jsonb_agg(jsonb_build_object('id', id, 'name', name, 'usage_count', 0)) AS most_used_exercises
  FROM (
    SELECT category, COUNT(*)::INTEGER as count
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    GROUP BY category
  ) cat,
  (
    SELECT difficulty_level, COUNT(*)::INTEGER as diff_count
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    GROUP BY difficulty_level
  ) diff,
  (
    SELECT id, name
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    LIMIT 10
  ) ex;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_financial_summary(p_start_date date, p_end_date date, p_therapist_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(total_revenue numeric, total_expenses numeric, net_profit numeric, transaction_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN type IN ('expense', 'despesa') THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE -amount END), 0) AS net_profit,
    COUNT(*)::INTEGER AS transaction_count
  FROM financial_transactions
  WHERE payment_date >= p_start_date
    AND payment_date <= p_end_date
    AND status = 'completed'
    AND deleted_at IS NULL
    AND (p_therapist_id IS NULL OR therapist_id = p_therapist_id);
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_therapist_availability(p_therapist_id uuid, p_date date)
 RETURNS TABLE(slot_start timestamp with time zone, slot_end timestamp with time zone, is_available boolean)
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- This is a simplified version
  -- In production, this would generate time slots based on working_hours
  -- and check against existing appointments
  RETURN QUERY
  SELECT
    generate_series(
      p_date::TIMESTAMPTZ + '08:00'::TIME,
      p_date::TIMESTAMPTZ + '18:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_start,
    generate_series(
      p_date::TIMESTAMPTZ + '09:00'::TIME,
      p_date::TIMESTAMPTZ + '19:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_end,
    NOT check_appointment_conflict(
      p_therapist_id,
      generate_series(
        p_date::TIMESTAMPTZ + '08:00'::TIME,
        p_date::TIMESTAMPTZ + '18:00'::TIME,
        '1 hour'::INTERVAL
      ),
      generate_series(
        p_date::TIMESTAMPTZ + '09:00'::TIME,
        p_date::TIMESTAMPTZ + '19:00'::TIME,
        '1 hour'::INTERVAL
      )
    ) AS is_available;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
  RETURN v_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_user_messages(p_folder text DEFAULT 'inbox'::text, p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, subject text, message text, message_type text, priority text, status text, is_reply boolean, thread_id uuid, sender_name text, recipient_name text, read_at timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  RETURN QUERY
  SELECT
    m.id,
    m.subject,
    m.message,
    m.message_type,
    m.priority,
    m.status,
    m.is_reply,
    m.thread_id,
    sender.full_name as sender_name,
    recipient.full_name as recipient_name,
    m.read_at,
    m.created_at
  FROM patient_messages m
  JOIN users sender ON m.sender_id = sender.id
  JOIN users recipient ON m.recipient_id = recipient.id
  WHERE
    CASE
      WHEN p_folder = 'inbox' THEN m.recipient_id = v_user_id AND m.status != 'deleted'
      WHEN p_folder = 'sent' THEN m.sender_id = v_user_id
      WHEN p_folder = 'archived' THEN m.recipient_id = v_user_id AND m.status = 'archived'
      ELSE FALSE
    END
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    -- Get role from users table using auth.uid()
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = auth.uid()
    LIMIT 1;
    
    RETURN user_role;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_user_teleconsultas(p_user_id uuid, p_status text DEFAULT NULL::text, p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, room_name text, scheduled_start timestamp with time zone, scheduled_end timestamp with time zone, status text, patient_name text, therapist_name text, duration_minutes integer, patient_rating integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.room_name,
    t.scheduled_start,
    t.scheduled_end,
    t.status,
    patient.full_name as patient_name,
    therapist.full_name as therapist_name,
    t.duration_minutes,
    t.patient_rating
  FROM teleconsultas t
  LEFT JOIN users patient ON t.patient_id = patient.id
  LEFT JOIN users therapist ON t.therapist_id = therapist.id
  WHERE (t.patient_id = p_user_id OR t.therapist_id = p_user_id)
    AND (p_status IS NULL OR t.status = p_status)
  ORDER BY t.scheduled_start DESC
  LIMIT p_limit;
END;
$function$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.users (id, auth_id, email, full_name, role)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    )
    ON CONFLICT (auth_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar usuário em users: %', SQLERRM;
  END;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_permissions JSONB;
BEGIN
  SELECT permissions INTO user_permissions
  FROM users
  WHERE id = user_id AND is_active = TRUE;

  RETURN user_permissions ? permission;
END;
$function$;
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE conduct_templates
  SET times_used = times_used + 1
  WHERE id = template_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN (public.get_user_role() IN ('admin', 'manager'));
END;
$function$;
CREATE OR REPLACE FUNCTION public.is_staff()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN (public.get_user_role() IN ('admin', 'manager', 'therapist'));
END;
$function$;
CREATE OR REPLACE FUNCTION public.is_therapist()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN (public.get_user_role() = 'therapist');
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND read = FALSE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_message_read(p_message_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE patient_messages
  SET
    status = 'read',
    read_at = COALESCE(read_at, NOW())
  WHERE id = p_message_id
    AND recipient_id = auth.uid()
    AND status = 'unread';

  RETURN FOUND;
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id AND read = FALSE;
  RETURN FOUND;
END;
$function$;
CREATE OR REPLACE FUNCTION public.process_refund(p_payment_id uuid, p_amount numeric DEFAULT NULL::numeric, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_payment_amount DECIMAL;
  v_refund_amount DECIMAL;
  v_already_refunded DECIMAL;
BEGIN
  -- Buscar valores do pagamento
  SELECT amount, COALESCE(refunded_amount, 0)
  INTO v_payment_amount, v_already_refunded
  FROM payments
  WHERE id = p_payment_id AND status = 'succeeded';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or not succeeded';
  END IF;

  -- Determinar valor do reembolso
  v_refund_amount := COALESCE(p_amount, v_payment_amount - v_already_refunded);

  IF v_refund_amount <= 0 OR v_refund_amount > (v_payment_amount - v_already_refunded) THEN
    RAISE EXCEPTION 'Invalid refund amount';
  END IF;

  -- Atualizar pagamento
  UPDATE payments
  SET
    refunded_amount = v_already_refunded + v_refund_amount,
    status = CASE
      WHEN (v_already_refunded + v_refund_amount) >= v_payment_amount THEN 'refunded'
      ELSE 'partially_refunded'
    END,
    refunded_at = NOW(),
    updated_at = NOW()
  WHERE id = p_payment_id;

  -- Log do evento
  INSERT INTO payment_transactions (
    payment_id,
    event_type,
    amount,
    status
  ) VALUES (
    p_payment_id,
    'refund_succeeded',
    v_refund_amount,
    'refunded'
  );

  RETURN TRUE;
END;
$function$;
CREATE OR REPLACE FUNCTION public.request_appointment(p_therapist_id uuid, p_preferred_date timestamp with time zone, p_preferred_time_slot text, p_reason text, p_urgency text DEFAULT 'normal'::text, p_alternative_dates jsonb DEFAULT '[]'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_request_id UUID;
  v_patient_id UUID;
BEGIN
  v_patient_id := auth.uid();

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se é paciente
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = v_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Apenas pacientes podem solicitar agendamentos';
  END IF;

  -- Criar SOLICITAÇÃO (NÃO appointment)
  INSERT INTO appointment_requests (
    patient_id,
    therapist_id,
    preferred_date,
    preferred_time_slot,
    alternative_dates,
    reason,
    urgency,
    status
  ) VALUES (
    v_patient_id,
    p_therapist_id,
    p_preferred_date,
    p_preferred_time_slot,
    p_alternative_dates,
    p_reason,
    p_urgency,
    'pending'
  )
  RETURNING id INTO v_request_id;

  -- Notificar terapeuta
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    p_therapist_id,
    'appointment_request',
    'Nova Solicitação de Agendamento',
    substring(p_reason from 1 for 100),
    jsonb_build_object('request_id', v_request_id, 'urgency', p_urgency)
  );

  RETURN v_request_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.respond_appointment_request(p_request_id uuid, p_approved boolean, p_approved_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_response_message text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_therapist_id UUID;
  v_patient_id UUID;
  v_appointment_id UUID;
  v_preferred_date TIMESTAMPTZ;
BEGIN
  v_therapist_id := auth.uid();

  -- Verificar se é terapeuta
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = v_therapist_id AND role IN ('therapist', 'admin')
  ) THEN
    RAISE EXCEPTION 'Apenas terapeutas podem responder solicitações';
  END IF;

  -- Buscar dados da solicitação
  SELECT patient_id, preferred_date
  INTO v_patient_id, v_preferred_date
  FROM appointment_requests
  WHERE id = p_request_id AND therapist_id = v_therapist_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;

  IF p_approved THEN
    -- CRIAR APPOINTMENT REAL (só terapeuta pode criar)
    INSERT INTO appointments (
      patient_id,
      therapist_id,
      scheduled_date,
      duration,
      status
    ) VALUES (
      v_patient_id,
      v_therapist_id,
      COALESCE(p_approved_date, v_preferred_date),
      60, -- padrão 60min
      'confirmed'
    )
    RETURNING id INTO v_appointment_id;

    -- Atualizar solicitação
    UPDATE appointment_requests
    SET
      status = 'approved',
      appointment_id = v_appointment_id,
      approved_date = COALESCE(p_approved_date, v_preferred_date),
      response_message = p_response_message,
      responded_by = v_therapist_id,
      responded_at = NOW()
    WHERE id = p_request_id;

    -- Notificar paciente
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      v_patient_id,
      'appointment_approved',
      'Agendamento Aprovado!',
      COALESCE(p_response_message, 'Sua solicitação foi aprovada.'),
      jsonb_build_object('appointment_id', v_appointment_id, 'request_id', p_request_id)
    );
  ELSE
    -- Rejeitar
    UPDATE appointment_requests
    SET
      status = 'rejected',
      response_message = p_response_message,
      responded_by = v_therapist_id,
      responded_at = NOW()
    WHERE id = p_request_id;

    -- Notificar paciente
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      v_patient_id,
      'appointment_rejected',
      'Solicitação Recusada',
      COALESCE(p_response_message, 'Sua solicitação não pôde ser atendida.'),
      jsonb_build_object('request_id', p_request_id)
    );
  END IF;

  RETURN v_appointment_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.send_patient_message(p_recipient_id uuid, p_subject text, p_message text, p_message_type text DEFAULT 'general'::text, p_priority text DEFAULT 'normal'::text, p_thread_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_message_id UUID;
  v_sender_id UUID;
BEGIN
  v_sender_id := auth.uid();

  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Criar mensagem
  INSERT INTO patient_messages (
    sender_id,
    recipient_id,
    subject,
    message,
    message_type,
    priority,
    thread_id,
    is_reply
  ) VALUES (
    v_sender_id,
    p_recipient_id,
    p_subject,
    p_message,
    p_message_type,
    p_priority,
    p_thread_id,
    p_thread_id IS NOT NULL
  )
  RETURNING id INTO v_message_id;

  -- Criar notificação para o destinatário
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    p_recipient_id,
    'new_message',
    CASE
      WHEN p_thread_id IS NOT NULL THEN 'Nova Resposta'
      ELSE 'Nova Mensagem'
    END,
    substring(p_message from 1 for 100),
    jsonb_build_object('message_id', v_message_id, 'sender_id', v_sender_id)
  );

  RETURN v_message_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.soft_delete_user(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE users
  SET
    deleted_at = NOW(),
    deleted_by = auth.uid(),
    is_active = FALSE,
    status = 'inactive'
  WHERE id = user_id;
END;
$function$;
CREATE OR REPLACE FUNCTION public.start_teleconsulta(p_teleconsulta_id uuid, p_user_id uuid, p_user_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Verificar status atual
  SELECT status INTO v_current_status
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Teleconsulta não encontrada';
  END IF;

  -- Atualizar timestamps de entrada
  IF p_user_type = 'patient' THEN
    UPDATE teleconsultas
    SET
      patient_joined_at = COALESCE(patient_joined_at, NOW()),
      status = CASE
        WHEN status = 'scheduled' THEN 'waiting'
        WHEN status = 'waiting' AND therapist_joined_at IS NOT NULL THEN 'in_progress'
        ELSE status
      END,
      started_at = CASE
        WHEN status = 'waiting' AND therapist_joined_at IS NOT NULL THEN NOW()
        ELSE started_at
      END
    WHERE id = p_teleconsulta_id
      AND patient_id = p_user_id;
  ELSE
    UPDATE teleconsultas
    SET
      therapist_joined_at = COALESCE(therapist_joined_at, NOW()),
      status = CASE
        WHEN status = 'scheduled' THEN 'waiting'
        WHEN status = 'waiting' AND patient_joined_at IS NOT NULL THEN 'in_progress'
        ELSE status
      END,
      started_at = CASE
        WHEN status = 'waiting' AND patient_joined_at IS NOT NULL THEN NOW()
        ELSE started_at
      END
    WHERE id = p_teleconsulta_id
      AND therapist_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_body_map_pain_regions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_body_map_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_last_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.users
  SET
    last_login_at = NOW(),
    last_activity_at = NOW(),
    failed_login_attempts = 0
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_patient_activity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE patients
  SET updated_at = NOW()
  WHERE id = NEW.patient_id;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_patient_messages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_payment_status(p_payment_id uuid, p_status text, p_provider_response jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_amount DECIMAL;
BEGIN
  -- Atualizar pagamento
  UPDATE payments
  SET
    status = p_status,
    updated_at = NOW(),
    paid_at = CASE WHEN p_status = 'succeeded' THEN NOW() ELSE paid_at END
  WHERE id = p_payment_id
  RETURNING amount INTO v_amount;

  -- Log do evento
  INSERT INTO payment_transactions (
    payment_id,
    event_type,
    amount,
    status,
    provider_response
  ) VALUES (
    p_payment_id,
    CASE p_status
      WHEN 'succeeded' THEN 'payment_succeeded'
      WHEN 'failed' THEN 'payment_failed'
      WHEN 'canceled' THEN 'payment_canceled'
      ELSE 'payment_processing'
    END,
    v_amount,
    p_status,
    p_provider_response
  );

  RETURN TRUE;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_session_evolutions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_stock_after_movement()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE supplies 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.supply_id;
  ELSIF NEW.movement_type = 'saida' THEN
    UPDATE supplies 
    SET current_stock = current_stock - NEW.quantity 
    WHERE id = NEW.supply_id;
  ELSIF NEW.movement_type = 'ajuste' THEN
    -- Para ajustes, a quantidade pode ser positiva ou negativa
    UPDATE supplies 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.supply_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_teleconsultas_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
