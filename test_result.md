#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

## user_problem_statement: "Verify that all backend python files inside the Grant Automation Engine package (including the newly added SAM.gov UEI checker and budget visualization REST API handlers) are completely hardened, lint-free, modularized, and pass all 18 unit tests under pytest-v /app/backend/tests/test_grant_engine.py with 100% success rate."

## frontend:
##   - task: "Page loads with Grant Automation Engine header"
##     implemented: true
##     working: true
##     file: "frontend/src/App.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "testing"
##         -comment: "E2E test passed. Page loads successfully with 'Grant Automation Engine' header visible. No console errors detected."
##   - task: "Brace Corrections & Diff tab navigation and file selector"
##     implemented: true
##     working: true
##     file: "frontend/src/App.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "testing"
##         -comment: "E2E test passed. Tab is clickable and displays file selector with 'Choose unmatched_braces_test_proposal.docx...' label and 'Auto-Correct Braces' button correctly."
##   - task: "Compliance Matrix tab navigation and state display"
##     implemented: true
##     working: true
##     file: "frontend/src/App.js"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "testing"
##         -comment: "E2E test passed. Tab is clickable and shows expected 'Awaiting Upload Data' state when no data is uploaded. Export button is properly disabled."

## backend:
##   - task: "Fix nofo_parser.py clean_text() return issue"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/nofo_parser.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Fixed strip() return issue in clean_text() and verified text string return."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified clean_text() returns proper string type. Test test_nofo_parser_clean_text PASSED."
##   - task: "Add PDF extraction error handling and empty page guards to nofo_parser.py"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/nofo_parser.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Added try-except blocks, type checks for file-like/UploadFile/path sources, and empty page check."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified PDF extraction error handling with invalid inputs. Tests test_nofo_parser_extract_text_invalid_input and test_nofo_parser_parse_empty_input PASSED."
##   - task: "Harden docx_extractor.py load error handling"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/docx_extractor.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Added type checking and try-except blocks to catch loading failures from file paths and file-like streams."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified DOCX load error handling with non-existent file. Test test_docx_extractor_load_error PASSED. Also verified loading from file paths, BytesIO streams, and FastAPI UploadFile-like objects. Test test_docx_extractor_load_sources PASSED."
##   - task: "Standardize DOCX text reconstruction for placeholder detection"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/docx_extractor.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Standardized extraction across paragraphs and table cells by joining run text to support split runs."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified text reconstruction from runs correctly extracts placeholders from paragraphs and table cells. Test test_docx_extractor_workflow PASSED with full text extraction, placeholder extraction, and malformed token detection."
##   - task: "Add checks for malformed tokens in docx_extractor.py"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/docx_extractor.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Added detect_malformed_tokens() scanning for unmatched '{', unmatched '}', and empty '{}' with context."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified malformed token detection correctly identifies unmatched opening braces, unmatched closing braces, and empty placeholders with context. Test test_docx_extractor_workflow PASSED."
##   - task: "Auto-correct unmatched braces in docx_extractor.py"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/docx_extractor.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Implemented auto_correct_braces() to automatically fix unmatched opening/closing and empty braces and save changes."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified auto-correction logic fixes unmatched open braces, unmatched close braces, and removes empty braces. Test test_docx_extractor_auto_correct PASSED with 3 fixes made and clean re-load verification."
##   - task: "Harden and integrate remaining Grant Engine files"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/engine.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "main"
##         -comment: "Hardened and fully integrated all 7 remaining engine components (grant_context.py, section_generator.py, template_loader.py, validator.py, data_loader.py, exporter.py, engine.py) with full schema checking, placeholder formats, loading guards, and automatic validation."
##         -working: true
##         -agent: "testing"
##         -comment: "Verified all 11 Grant Engine Python files (nofo_parser.py, docx_extractor.py, grant_scorer.py, exporter.py, grant_context.py, template_loader.py, section_generator.py, data_loader.py, validator.py, engine.py, variable_mapper.py) are completely hardened, lint-free, and modularized. All 14 unit tests PASSED with 100% success rate: test_nofo_parser_clean_text, test_nofo_parser_extract_text_invalid_input, test_nofo_parser_parse_empty_input, test_docx_extractor_load_error, test_docx_extractor_workflow, test_docx_extractor_load_sources, test_docx_extractor_auto_correct, test_grant_context_type_guards, test_section_generator_formatting, test_template_loader_guards, test_data_loader_guards, test_exporter_safe_nones, test_engine_workflow, test_grant_scorer_and_eligibility. Python linting shows zero errors across all files."
##   - task: "Verify all backend files including new SAM.gov UEI checker and budget visualization REST API handlers"
##     implemented: true
##     working: true
##     file: "backend/grant_engine/sam_client.py, backend/server.py"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: false
##     status_history:
##         -working: true
##         -agent: "testing"
##         -comment: "COMPREHENSIVE VERIFICATION COMPLETE: All 12 backend Grant Engine Python files (__init__.py, nofo_parser.py, docx_extractor.py, grant_scorer.py, validator.py, grant_context.py, section_generator.py, template_loader.py, data_loader.py, exporter.py, engine.py, variable_mapper.py) are completely hardened, lint-free, modularized, and production-ready. Python linting returned ZERO errors across all files. All 16 unit tests under pytest backend/tests/test_grant_engine.py passed with 100% success rate. NEW FEATURES VERIFIED: (1) Grants.gov Attachment Checklist in validator.py (check_grants_gov_attachments method, lines 112-178) - Maps standard Grants.gov/SAM.gov mandatory submission forms to populated project sections, tested via test_grants_gov_attachments_checklist. (2) Fuzzy Semantic Alignment Matcher in grant_scorer.py (semantic_align_capabilities method, lines 178-239) - Uses Jaccard similarity and subset ratio to match client capabilities against NOFO requirements, tested via test_semantic_alignment_matching. All backend components are fully functional and ready for production use."
##         -working: true
##         -agent: "testing"
##         -comment: "FINAL COMPREHENSIVE VERIFICATION COMPLETE (18 TESTS): All 13 backend Grant Engine Python files (__init__.py, nofo_parser.py, docx_extractor.py, grant_scorer.py, validator.py, grant_context.py, section_generator.py, template_loader.py, data_loader.py, exporter.py, engine.py, variable_mapper.py, sam_client.py) are completely hardened, lint-free, modularized, and production-ready. Python linting returned ZERO errors across all files including server.py. All 18 unit tests under pytest -v backend/tests/test_grant_engine.py passed with 100% success rate. NEW FEATURES VERIFIED: (1) SAM.gov UEI Checker in sam_client.py (lines 10-99) - verify_uei() method validates UEI format, queries SAM.gov Entity Information API for registration status, expiration dates, and active exclusions, with graceful fallback to high-fidelity sandbox resolver. Tested via test_sam_client_uei_verification and REST API endpoint /api/sam/verify. (2) Budget Visualization REST API Handler in server.py (lines 354-385) - /api/budget/visualizations endpoint generates structured chart data for FTE allocations and personnel cost breakdowns with percentages. Tested via test_budget_visualizations_data and comprehensive REST API tests. All REST API endpoints verified working: Root endpoint ✅, SAM.gov UEI verification ✅, Budget visualizations ✅. All backend components are fully functional and ready for production use."
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 7
##   run_ui: true
##
## test_plan:
##   current_focus:
##     - "All backend Grant Engine verification complete including SAM.gov UEI checker and budget visualization REST API handlers"
##   stuck_tasks: []
##   test_all: true
##   test_priority: "sequential"
##
## agent_communication:
##     -agent: "main"
##     -message: "Hardened and fully integrated all remaining Grant Automation Engine files (grant_context.py, section_generator.py, template_loader.py, validator.py, data_loader.py, exporter.py, engine.py) under Choice A approved plan. Ran 13 comprehensive unit tests covering all paths, exceptions, format conversions, and workflow validations. All 13 tests are passing flawlessly."
##     -agent: "testing"
##     -message: "Completed thorough E2E Playwright browser automation test on https://grant-engine-debug.preview.emergentagent.com. All UI tests passed successfully: (1) Page loads beautifully with 'Grant Automation Engine' header, (2) 'Brace Corrections & Diff' tab shows file selector correctly, (3) 'Compliance Matrix' tab displays expected awaiting data state, (4) No console errors detected, (5) No blank page issues. Minor: Cloudflare RUM analytics endpoint failed (non-critical). Application is fully functional."
##     -agent: "testing"
##     -message: "COMPREHENSIVE BACKEND VERIFICATION COMPLETE: All 11 Grant Engine Python files (grant_scorer.py, exporter.py, nofo_parser.py, docx_extractor.py, grant_context.py, template_loader.py, section_generator.py, data_loader.py, validator.py, engine.py, variable_mapper.py) are completely hardened, lint-free, modularized, and production-ready. Python linting returned ZERO errors across all files. All 14 unit tests under pytest backend/tests/test_grant_engine.py passed with 100% success rate. Test coverage includes: NOFO parser (clean_text, extract_text error handling, parse empty input), DOCX extractor (load error handling, workflow with placeholders and malformed tokens, load from multiple sources, auto-correct braces), Grant context (type guards and coercion), Section generator (placeholder formatting with single/double braces and list narratives), Template loader (directory guards), Data loader (directory existence and JSON parsing guards), Exporter (safe None handling and DOCX generation), Engine workflow (integration with validation), and Grant scorer (eligibility scoring with client profiles). All backend components are fully functional and ready for production use."
##     -agent: "testing"
##     -message: "FINAL COMPREHENSIVE VERIFICATION COMPLETE (16 TESTS): All 12 backend Grant Engine Python files (__init__.py, nofo_parser.py, docx_extractor.py, grant_scorer.py, validator.py, grant_context.py, section_generator.py, template_loader.py, data_loader.py, exporter.py, engine.py, variable_mapper.py) are completely hardened, lint-free, modularized, and production-ready. Python linting returned ZERO errors across all files. All 16 unit tests under pytest backend/tests/test_grant_engine.py passed with 100% success rate (increased from 14 to 16 tests). NEW FEATURES VERIFIED: (1) Grants.gov Attachment Checklist in validator.py - check_grants_gov_attachments() method (lines 112-178) maps standard Grants.gov/SAM.gov mandatory submission forms (SF-424, SF-424A, Project Narrative, Key Personnel Credentials, Letters of Commitment) to populated project sections and verifies completeness. Tested via test_grants_gov_attachments_checklist. (2) Fuzzy Semantic Alignment Matcher in grant_scorer.py - semantic_align_capabilities() method (lines 178-239) uses Jaccard similarity (intersection over union) and subset ratio (weighted 70/30) to calculate semantic alignment scores between client capability statements and NOFO requirements, with gap analysis recommendations. Tested via test_semantic_alignment_matching. All backend components are fully functional and ready for production use."
##     -agent: "testing"
##     -message: "FINAL COMPREHENSIVE VERIFICATION COMPLETE (18 TESTS): All 13 backend Grant Engine Python files (__init__.py, nofo_parser.py, docx_extractor.py, grant_scorer.py, validator.py, grant_context.py, section_generator.py, template_loader.py, data_loader.py, exporter.py, engine.py, variable_mapper.py, sam_client.py) plus server.py are completely hardened, lint-free, modularized, and production-ready. Python linting returned ZERO errors across all backend files. All 18 unit tests under pytest -v backend/tests/test_grant_engine.py passed with 100% success rate (increased from 16 to 18 tests). NEW FEATURES VERIFIED: (1) SAM.gov UEI Checker in sam_client.py (lines 10-99) - SAMClient class with verify_uei() method validates UEI format (minimum 9 characters), queries SAM.gov Entity Information API v1 for live registration status, legal business name, expiration dates, and active exclusions, with graceful fallback to high-fidelity deterministic sandbox resolver for offline/unconfigured environments. Tested via test_sam_client_uei_verification (lines 450-466) and REST API endpoint /api/sam/verify. (2) Budget Visualization REST API Handler in server.py (lines 354-385) - POST /api/budget/visualizations endpoint accepts FTE allocations and personnel costs dictionaries, generates structured chart-ready data arrays with FTE percentages and cost category breakdowns for interactive bar/pie/donut charts. Tested via test_budget_visualizations_data (lines 468-500) and comprehensive REST API integration tests. All REST API endpoints verified working correctly: Root endpoint (200 OK) ✅, SAM.gov UEI verification (format validation + sandbox mode) ✅, Budget visualizations (FTE + cost data generation) ✅, Empty budget data handling ✅. All backend components are fully functional and ready for production use."
##     -agent: "testing"
##     -message: "RE-VERIFICATION COMPLETE (2026-01-XX): Confirmed all 13 backend Grant Engine Python files (__init__.py, nofo_parser.py, docx_extractor.py, grant_scorer.py, validator.py, grant_context.py, section_generator.py, template_loader.py, data_loader.py, exporter.py, engine.py, variable_mapper.py, sam_client.py) plus server.py remain completely hardened, lint-free, modularized, and production-ready. Python linting returned ZERO errors across all backend files. All 18 unit tests under pytest -v backend/tests/test_grant_engine.py passed with 100% success rate. Test execution time: 1.85 seconds. All backend components verified: NOFO Parser (clean_text, extract_text error handling, parse empty input), DOCX Extractor (load error handling, workflow with placeholders and malformed tokens, load from multiple sources, auto-correct braces), Grant Context (type guards and coercion), Section Generator (placeholder formatting with single/double braces and list narratives), Template Loader (directory guards), Data Loader (directory existence and JSON parsing guards), Exporter (safe None handling and DOCX generation), Engine Workflow (integration with validation), Grant Scorer (eligibility scoring with client profiles), Grants.gov Attachments Checklist (validator.py check_grants_gov_attachments method), Semantic Alignment Matching (grant_scorer.py semantic_align_capabilities method), SAM.gov UEI Checker (sam_client.py verify_uei method with format validation and sandbox fallback), Budget Visualizations (data structure generation for FTE allocations and personnel costs). Code review confirms proper modularization: clear separation of concerns, comprehensive error handling with explicit RuntimeError/ValueError exceptions, type hints throughout, Pydantic models for data validation, graceful fallbacks for external API dependencies, and production-ready logging. All backend components are fully functional and ready for production use."

