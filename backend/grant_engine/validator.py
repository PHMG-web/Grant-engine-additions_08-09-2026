import re
from typing import Dict, Any, List

class Validator:
    """
    Validates generated sections against manifest requirements and actual schema guidelines.
    Checks:
    - Required fields exist and are non-empty
    - No empty sections
    - Brace & Placeholder Compliance: All placeholders in a template are satisfied by the mapped variables
    - Type and Format validations (e.g., currency/numerical checking on budget totals)
    """

    def __init__(self, template_loader):
        self.template_loader = template_loader

    def validate(self, context) -> Dict[str, Any]:
        """
        Validate all sections in the GrantContext.
        Returns a dict of structured errors and warnings.
        """
        errors = {}
        warnings = {}

        workflow_order = self.template_loader.get_workflow_order()

        for template_id in workflow_order:
            template_meta = self.template_loader.get_template(template_id)
            required_fields = template_meta["required_fields"]
            template_text = template_meta["text"]

            section_data = self._get_section_data(context, template_id)
            section_errors = []
            section_warnings = []

            # 1. Required fields presence checks
            missing_fields = [
                field for field in required_fields
                if field not in section_data or section_data.get(field) in [None, "", [], {}]
            ]
            if missing_fields:
                section_errors.append(f"Missing required field(s): {', '.join(missing_fields)}")

            # 2. Section emptiness checks
            if not section_data or all(v in [None, "", [], {}] for v in section_data.values()):
                section_warnings.append("Section is entirely empty or unpopulated.")

            # 3. Brace & Placeholder Compliance Checking:
            # Safely verify that ALL template placeholders are fully satisfied
            placeholders = re.findall(r"\{+\s*([a-zA-Z0-9_.-]+)\s*\}+", template_text)
            unsatisfied = []
            for ph in placeholders:
                if ph not in section_data or section_data.get(ph) is None:
                    unsatisfied.append(ph)
            if unsatisfied:
                section_errors.append(f"Template contains placeholder(s) not satisfied by mapped variables: {', '.join(sorted(list(set(unsatisfied))))}")

            # 4. Specific type & format validations (e.g. Budget Total validation)
            if template_id == "budget_narrative" and section_data:
                budget_total = section_data.get("Budget_Total")
                if budget_total is not None and str(budget_total).strip():
                    # Check if budget_total has valid currency format or numeric representation
                    clean_total = re.sub(r"[\$,\s]", "", str(budget_total))
                    try:
                        float(clean_total)
                    except ValueError:
                        section_errors.append(f"Invalid numeric format for 'Budget_Total': '{budget_total}'. Must represent a valid number.")

            if section_errors:
                errors[template_id] = section_errors
            if section_warnings:
                warnings[template_id] = section_warnings

        return {
            "errors": errors,
            "warnings": warnings
        }

    def _get_section_data(self, context, template_id) -> Dict[str, Any]:
        """
        Safely retrieve the correct section data from GrantContext.
        """
        if not context:
            return {}

        if template_id == "nofo":
            return context.nofo.get("sections", {})

        # Access attributes dynamically with fallback
        if hasattr(context, template_id):
            val = getattr(context, template_id)
            return val if isinstance(val, dict) else {}

        # Fallback names
        mapping = {
            "organizational_profile": "organizational_profile",
            "program_design": "program_design",
            "implementation_plan": "implementation_plan",
            "staffing_plan": "staffing_plan",
            "budget_narrative": "budget_narrative",
            "evaluation_plan": "evaluation_plan",
            "sustainability_plan": "sustainability_plan"
        }
        
        attr_name = mapping.get(template_id)
        if attr_name and hasattr(context, attr_name):
            val = getattr(context, attr_name)
            return val if isinstance(val, dict) else {}

        return {}

    def check_grants_gov_attachments(self, context: Any) -> List[Dict[str, Any]]:
        """
        Scans GrantContext and maps standard Grants.gov/SAM.gov mandatory submission forms
        directly to populated project sections, verifying eligibility and completeness.
        """
        checklist = []
        
        # Define mandatory attachments schema mapping
        requirements = [
            {
                "form_name": "SF-424 (Application for Federal Assistance)",
                "grants_gov_requirement": "Mandatory Form",
                "mapped_section": "organizational_profile",
                "check_key": "Organization_Name",
                "description": "Applicant legal entity, SAM.gov UEI registration details"
            },
            {
                "form_name": "SF-424A (Budget Information - Non-Construction)",
                "grants_gov_requirement": "Mandatory Form",
                "mapped_section": "budget_narrative",
                "check_key": "Budget_Total",
                "description": "Total requested funds, personnel costs, cost justifications"
            },
            {
                "form_name": "Project Narrative Statement",
                "grants_gov_requirement": "Mandatory Attachment",
                "mapped_section": "program_design",
                "check_key": "Program_Name",
                "description": "Core program narrative, goals, logic model, and methodology"
            },
            {
                "form_name": "Key Personnel Credentials / Resumes",
                "grants_gov_requirement": "Required Attachment",
                "mapped_section": "staffing_plan",
                "check_key": "Key_Personnel",
                "description": "Bios and staffing justifications for key leadership"
            },
            {
                "form_name": "Letters of Commitment / Support",
                "grants_gov_requirement": "Optional / Highly Recommended",
                "mapped_section": "sustainability_plan",
                "check_key": "Partnerships",
                "description": "Commitment statements from project partner organizations"
            }
        ]

        for req in requirements:
            section_data = self._get_section_data(context, req["mapped_section"])
            val = section_data.get(req["check_key"])
            
            is_present = False
            if val is not None:
                if isinstance(val, (list, dict)):
                    is_present = len(val) > 0
                else:
                    is_present = len(str(val).strip()) > 0

            checklist.append({
                "form_name": req["form_name"],
                "requirement": req["grants_gov_requirement"],
                "mapped_section_title": req["mapped_section"].replace("_", " ").title(),
                "is_present": is_present,
                "status": "Compliant" if is_present else ("Missing Required Attachment" if req["grants_gov_requirement"] == "Mandatory Form" else "Pending Review"),
                "description": req["description"]
            })

        return checklist

