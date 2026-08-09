class GrantContext:
    """
    Holds all structured data for a single grant workflow.
    Each section corresponds to one template in the manifest.
    """

    def __init__(self):
        # Raw NOFO text + parsed NOFO sections
        self.nofo = {
            "raw_text": None,
            "sections": {}
        }

        # Organizational Profile
        self.organizational_profile = {
            "Organization_Name": None,
            "Mission": None,
            "Capacity": None,
            "Additional_Info": {}
        }

        # Program Design
        self.program_design = {
            "Program_Name": None,
            "Target_Population": None,
            "Objectives": [],
            "Activities": [],
            "Logic_Model": None,
            "Additional_Info": {}
        }

        # Implementation Plan
        self.implementation_plan = {
            "Activities": [],
            "Timeline": [],
            "Milestones": [],
            "Operational_Steps": [],
            "Additional_Info": {}
        }

        # Staffing Plan
        self.staffing_plan = {
            "Key_Personnel": [],
            "FTE_Allocations": {},
            "Staffing_Justification": None,
            "Additional_Info": {}
        }

        # Budget Narrative
        self.budget_narrative = {
            "Budget_Total": None,
            "Personnel_Costs": {},
            "Cost_Justification": None,
            "Additional_Info": {}
        }

        # Evaluation Plan
        self.evaluation_plan = {
            "Outcomes": [],
            "Indicators": [],
            "Data_Collection_Methods": [],
            "Evaluation_Design": None,
            "Additional_Info": {}
        }

        # Sustainability Plan
        self.sustainability_plan = {
            "Sustainability_Strategy": None,
            "Funding_Plan": None,
            "Partnerships": [],
            "Additional_Info": {}
        }

    def to_dict(self):
        """Return the entire context as a dictionary (useful for rendering/export)."""
        return {
            "nofo": self.nofo,
            "organizational_profile": self.organizational_profile,
            "program_design": self.program_design,
            "implementation_plan": self.implementation_plan,
            "staffing_plan": self.staffing_plan,
            "budget_narrative": self.budget_narrative,
            "evaluation_plan": self.evaluation_plan,
            "sustainability_plan": self.sustainability_plan
        }

