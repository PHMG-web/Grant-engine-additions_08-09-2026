class Validator:
    """
    Validates generated sections against manifest requirements.
    Checks:
    - required fields exist
    - no empty sections
    - NOFO alignment (placeholder for future logic)
    """

    def __init__(self, template_loader):
        self.template_loader = template_loader

    def validate(self, context):
        """
        Validate all sections in the GrantContext.
        Returns a dict of errors and warnings.
        """
        errors = {}
        warnings = {}

        workflow_order = self.template_loader.get_workflow_order()

        for template_id in workflow_order:
            template_meta = self.template_loader.get_template(template_id)
            required_fields = template_meta["required_fields"]

            section_data = self._get_section_data(context, template_id)

            # Check required fields
            missing_fields = [
                field for field in required_fields
                if field not in section_data or not section_data.get(field)
            ]

            if missing_fields:
                errors[template_id] = {
                    "missing_required_fields": missing_fields
                }

            # Check empty section
            if not section_data or all(v in [None, "", [], {}] for v in section_data.values()):
                warnings[template_id] = {
                    "empty_section": True
                }

        return {
            "errors": errors,
            "warnings": warnings
        }

    def _get_section_data(self, context, template_id):
        """
        Retrieve the correct section from GrantContext.
        """
        if template_id == "nofo":
            return context.nofo.get("sections", {})

        elif template_id == "organizational_profile":
            return context.organizational_profile

        elif template_id == "program_design":
            return context.program_design

        elif template_id == "implementation_plan":
            return context.implementation_plan

        elif template_id == "staffing_plan":
            return context.staffing_plan

        elif template_id == "budget_narrative":
            return context.budget_narrative

        elif template_id == "evaluation_plan":
            return context.evaluation_plan

        elif template_id == "sustainability_plan":
            return context.sustainability_plan

        else:
            return {}

