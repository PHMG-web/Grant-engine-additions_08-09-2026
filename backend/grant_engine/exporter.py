import json
from docx import Document

class Exporter:
    """
    Handles exporting GrantContext into different formats:
    - JSON (structured data)
    - DOCX (narrative document)
    """

    def export_json(self, context, output_path="grant_output.json"):
        """
        Export the GrantContext as a JSON file.
        """
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(context.to_dict(), f, indent=4, ensure_ascii=False)
        return output_path

    def export_docx(self, context, output_path="grant_output.docx"):
        """
        Export the GrantContext as a DOCX file.
        Each section becomes a heading + narrative text.
        """
        doc = Document()

        doc.add_heading("Grant Proposal", level=0)

        # Organizational Profile
        doc.add_heading("Organizational Profile", level=1)
        for k, v in context.organizational_profile.items():
            doc.add_paragraph(f"{k}: {v}")

        # Program Design
        doc.add_heading("Program Design", level=1)
        for k, v in context.program_design.items():
            doc.add_paragraph(f"{k}: {v}")

        # Implementation Plan
        doc.add_heading("Implementation Plan", level=1)
        for k, v in context.implementation_plan.items():
            doc.add_paragraph(f"{k}: {v}")

        # Staffing Plan
        doc.add_heading("Staffing Plan", level=1)
        for k, v in context.staffing_plan.items():
            doc.add_paragraph(f"{k}: {v}")

        # Budget Narrative
        doc.add_heading("Budget Narrative", level=1)
        for k, v in context.budget_narrative.items():
            doc.add_paragraph(f"{k}: {v}")

        # Evaluation Plan
        doc.add_heading("Evaluation Plan", level=1)
        for k, v in context.evaluation_plan.items():
            doc.add_paragraph(f"{k}: {v}")

        # Sustainability Plan
        doc.add_heading("Sustainability Plan", level=1)
        for k, v in context.sustainability_plan.items():
            doc.add_paragraph(f"{k}: {v}")

        doc.save(output_path)
        return output_path

