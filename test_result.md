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

## user_problem_statement: "Harden and fix nofo_parser.py and docx_extractor.py inside the Grant Automation Engine."

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
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 4
##   run_ui: true
##
## test_plan:
##   current_focus:
##     - "Workflow integration testing complete"
##   stuck_tasks: []
##   test_all: true
##   test_priority: "sequential"
##
## agent_communication:
##     -agent: "main"
##     -message: "Hardened and fully integrated all remaining Grant Automation Engine files (grant_context.py, section_generator.py, template_loader.py, validator.py, data_loader.py, exporter.py, engine.py) under Choice A approved plan. Ran 13 comprehensive unit tests covering all paths, exceptions, format conversions, and workflow validations. All 13 tests are passing flawlessly."
##     -agent: "testing"
##     -message: "Completed thorough E2E Playwright browser automation test on https://grant-engine-debug.preview.emergentagent.com. All UI tests passed successfully: (1) Page loads beautifully with 'Grant Automation Engine' header, (2) 'Brace Corrections & Diff' tab shows file selector correctly, (3) 'Compliance Matrix' tab displays expected awaiting data state, (4) No console errors detected, (5) No blank page issues. Minor: Cloudflare RUM analytics endpoint failed (non-critical). Application is fully functional."
