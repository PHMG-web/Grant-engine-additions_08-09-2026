class VariableMapper:
    """
    Maps data from GrantContext into variables used by templates.
    This is the intelligence layer that decides what information
    each template receives.
    """

    def map_variables(self, template_id, context):
        """
        Return a dictionary of variables for the given template.
        """
        if template_id == "nofo":
            return self._map_nofo(context)

        elif template_id == "organizational_profile":
            return self._map_org_profile(context)

        elif template_id == "program_design":
            return self._map_program_design(context)

        elif template_id == "implementation_plan":
            return self._map_implementation_plan(context)

        elif template_id == "staffing_plan":
            return self._map_staffing_plan(context)

        elif template_id == "budget_narrative":
            return self._map_budget(context)

        elif template_id == "evaluation_plan":
            return self._map_evaluation(context)

        elif template_id == "sustainability_plan":
            return self._map_sustainability(context)

        else:
            return {}

    # -------------------------
    # Mapping Functions
    # -------------------------

    def _map_nofo(self, context):
        sections = context.nofo.get("sections", {})
        # Expose all extracted fields in NOFOData directly as top-level template variables
        res = {
            "NOFO_Sections": sections
        }
        if isinstance(sections, dict):
            for k, v in sections.items():
                res[k] = v
        return res

    def _map_org_profile(self, context):
        return {
            "Organization_Name": context.organizational_profile.get("Organization_Name"),
            "Mission": context.organizational_profile.get("Mission"),
            "Capacity": context.organizational_profile.get("Capacity"),
        }

    def _map_program_design(self, context):
        return {
            "Program_Name": context.program_design.get("Program_Name"),
            "Target_Population": context.program_design.get("Target_Population"),
            "Objectives": context.program_design.get("Objectives"),
            "Activities": context.program_design.get("Activities"),
            "Logic_Model": context.program_design.get("Logic_Model"),
        }

    def _map_implementation_plan(self, context):
        return {
            "Activities": context.implementation_plan.get("Activities"),
            "Timeline": context.implementation_plan.get("Timeline"),
            "Milestones": context.implementation_plan.get("Milestones"),
            "Operational_Steps": context.implementation_plan.get("Operational_Steps"),
        }

    def _map_staffing_plan(self, context):
        return {
            "Key_Personnel": context.staffing_plan.get("Key_Personnel"),
            "FTE_Allocations": context.staffing_plan.get("FTE_Allocations"),
            "Staffing_Justification": context.staffing_plan.get("Staffing_Justification"),
        }

    def _map_budget(self, context):
        return {
            "Budget_Total": context.budget_narrative.get("Budget_Total"),
            "Personnel_Costs": context.budget_narrative.get("Personnel_Costs"),
            "Cost_Justification": context.budget_narrative.get("Cost_Justification"),
        }

    def _map_evaluation(self, context):
        return {
            "Outcomes": context.evaluation_plan.get("Outcomes"),
            "Indicators": context.evaluation_plan.get("Indicators"),
            "Data_Collection_Methods": context.evaluation_plan.get("Data_Collection_Methods"),
            "Evaluation_Design": context.evaluation_plan.get("Evaluation_Design"),
        }

    def _map_sustainability(self, context):
        return {
            "Sustainability_Strategy": context.sustainability_plan.get("Sustainability_Strategy"),
            "Funding_Plan": context.sustainability_plan.get("Funding_Plan"),
            "Partnerships": context.sustainability_plan.get("Partnerships"),
        }

