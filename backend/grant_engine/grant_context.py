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

    def update_section(self, section_name: str, data: dict):
        """
        Safely updates a section in the context with strict type checking and type guards.
        Ensures lists, dictionaries, strings, and custom formats match schema specifications.
        """
        if not hasattr(self, section_name):
            raise ValueError(f"Unknown section: '{section_name}' in GrantContext.")
            
        target = getattr(self, section_name)
        if not isinstance(data, dict):
            raise TypeError(f"Data to update '{section_name}' must be a dictionary, got {type(data).__name__}.")
            
        for k, v in data.items():
            if k == "Additional_Info":
                if not isinstance(v, dict):
                    raise TypeError(f"Additional_Info in '{section_name}' must be a dictionary.")
                target["Additional_Info"].update(v)
                continue

            if k in target:
                expected_val = target[k]
                # Type guards based on schema standards
                if expected_val is not None:
                    expected_type = type(expected_val)
                    if v is not None and not isinstance(v, expected_type):
                        # Try parsing/converting values safely
                        try:
                            if expected_type is list:
                                if isinstance(v, str):
                                    v = [item.strip() for item in v.split(",") if item.strip()]
                                else:
                                    v = list(v)
                            elif expected_type is dict:
                                v = dict(v)
                            elif expected_type is str:
                                v = str(v)
                        except Exception as convert_err:
                            raise TypeError(f"Field '{k}' in section '{section_name}' expected type '{expected_type.__name__}', but received value of type '{type(v).__name__}' which could not be converted: {str(convert_err)}")
                target[k] = v
            else:
                # Store as custom metadata in Additional_Info
                target.setdefault("Additional_Info", {})[k] = v

    def to_dict(self):
        """Return the entire context as a dictionary (useful for rendering/export)."""
        import copy
        return copy.deepcopy({
            "nofo": self.nofo,
            "organizational_profile": self.organizational_profile,
            "program_design": self.program_design,
            "implementation_plan": self.implementation_plan,
            "staffing_plan": self.staffing_plan,
            "budget_narrative": self.budget_narrative,
            "evaluation_plan": self.evaluation_plan,
            "sustainability_plan": self.sustainability_plan
        })

