import os
import logging
from .template_loader import TemplateLoader
from .grant_context import GrantContext
from .variable_mapper import VariableMapper
from .section_generator import SectionGenerator
from .validator import Validator

logger = logging.getLogger(__name__)

class GrantAutomationEngine:
    """
    Orchestrates the full grant automation workflow:
    1. Load templates in workflow order
    2. Map variables
    3. Generate sections
    4. Populate GrantContext
    5. Perform automatic workflow validation and verification
    """

    def __init__(self, templates_dir):
        if not templates_dir:
            raise ValueError("Templates directory path cannot be empty.")
            
        if not os.path.exists(templates_dir):
            raise FileNotFoundError(f"Templates directory '{templates_dir}' does not exist.")
            
        self.loader = TemplateLoader(templates_dir)
        self.mapper = VariableMapper()
        self.generator = SectionGenerator()
        self.validator = Validator(self.loader)
        self.validation_results = None

    def run(self):
        """
        Execute the full workflow, automatically verify outputs, and return a populated GrantContext.
        """
        context = GrantContext()
        workflow_order = self.loader.get_workflow_order()
        
        if not workflow_order:
            raise ValueError("Templates manifest specifies an empty workflow order.")

        for template_id in workflow_order:
            template = self.loader.get_template(template_id)
            required_fields = template.get("required_fields", [])

            # Step 1 — Map variables from NOFO + context
            mapped_variables = self.mapper.map_variables(template_id, context)

            # Step 2 — Generate section content
            generated_section = self.generator.generate_section(
                template_text=template["text"],
                variables=mapped_variables
            )

            # Step 3 — Store results in GrantContext
            self._store_in_context(context, template_id, generated_section)

        # Step 4 — Run automatic validation/verification check
        self.validation_results = self.validator.validate(context)
        
        # Log validation outcomes for auditing
        errors = self.validation_results.get("errors", {})
        warnings = self.validation_results.get("warnings", {})
        
        if errors:
            logger.error(f"Grant Automation validation completed with critical errors: {errors}")
        if warnings:
            logger.warning(f"Grant Automation validation warning alert: {warnings}")

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
