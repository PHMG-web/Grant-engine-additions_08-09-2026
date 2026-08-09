import os
from .template_loader import TemplateLoader
from .grant_context import GrantContext
from .variable_mapper import VariableMapper
from .section_generator import SectionGenerator
from .validator import Validator

class GrantAutomationEngine:
    """
    Orchestrates the full grant automation workflow:
    1. Load templates in workflow order
    2. Map variables
    3. Generate sections
    4. Populate GrantContext
    """

    def __init__(self, templates_dir):
        self.loader = TemplateLoader(templates_dir)
        self.mapper = VariableMapper()
        self.generator = SectionGenerator()

    def run(self):
        """
        Execute the full workflow and return a populated GrantContext.
        """
        context = GrantContext()
        workflow_order = self.loader.get_workflow_order()

        for template_id in workflow_order:
            template = self.loader.get_template(template_id)
            required_fields = template["required_fields"]

            # Step 1 — Map variables from NOFO + context
            mapped_variables = self.mapper.map_variables(template_id, context)

            # Step 2 — Generate section content
            generated_section = self.generator.generate_section(
                template_text=template["text"],
                variables=mapped_variables
            )

            # Step 3 — Store results in GrantContext
            self._store_in_context(context, template_id, generated_section)

        return context

    def _store_in_context(self, context, template_id, generated_section):
        """
        Store generated content in the correct section of GrantContext.
        """
        if template_id == "nofo":
            context.nofo["sections"] = generated_section

        elif template_id == "organizational_profile":
            context.organizational_profile.update(generated_section)

        elif template_id == "program_design":
            context.program_design.update(generated_section)

        elif template_id == "implementation_plan":
            context.implementation_plan.update(generated_section)

        elif template_id == "staffing_plan":
            context.staffing_plan.update(generated_section)

        elif template_id == "budget_narrative":
            context.budget_narrative.update(generated_section)

        elif template_id == "evaluation_plan":
            context.evaluation_plan.update(generated_section)

        elif template_id == "sustainability_plan":
            context.sustainability_plan.update(generated_section)

        else:
            raise ValueError(f"Unknown template ID: {template_id}")
