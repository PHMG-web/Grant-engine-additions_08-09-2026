import json
import os
from docx import Document
from typing import Any

class Exporter:
    """
    Handles exporting GrantContext into different formats:
    - JSON (structured data)
    - DOCX (narrative document)
    Guards output paths and handles missing values gracefully.
    """

    def _safe_value(self, val: Any) -> str:
        """
        Formats raw values gracefully. Ensures None is represented as an explicit 
        '[Not Populated]' text rather than raising exceptions or printing raw None.
        """
        if val is None:
            return "[Not Populated]"
        if isinstance(val, list):
            if not val:
                return "[Not Populated]"
            return ", ".join(str(v).strip() for v in val if str(v).strip())
        if isinstance(val, dict):
            if not val:
                return "[Not Populated]"
            return "; ".join(f"{k}: {v}" if v is not None else str(k) for k, v in val.items())
        return str(val).strip() if str(val).strip() else "[Not Populated]"

    def _ensure_dir_exists(self, file_path: str):
        """
        Verifies and creates target folder paths before write operations.
        """
        if not file_path:
            raise ValueError("Output file path cannot be empty.")
        dir_name = os.path.dirname(os.path.abspath(file_path))
        if dir_name:
            try:
                os.makedirs(dir_name, exist_ok=True)
            except Exception as e:
                raise RuntimeError(f"Unable to create target output directory '{dir_name}': {str(e)}") from e

    def export_json(self, context, output_path="grant_output.json") -> str:
        """
        Export the GrantContext as a JSON file safely.
        """
        self._ensure_dir_exists(output_path)
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(context.to_dict(), f, indent=4, ensure_ascii=False)
            return output_path
        except PermissionError as perm_err:
            raise RuntimeError(f"Permission denied writing JSON output to '{output_path}': {str(perm_err)}") from perm_err
        except Exception as e:
            raise RuntimeError(f"Failed to export JSON to '{output_path}': {str(e)}") from e

    def export_docx(self, context, output_path="grant_output.docx") -> str:
        """
        Export the GrantContext as a DOCX file.
        Each section becomes a heading + narrative text.
        Guards writing directories and handles missing values gracefully.
        """
        self._ensure_dir_exists(output_path)
        
        try:
            doc = Document()
            doc.add_heading("Grant Proposal", level=0)

            # Define sections to output
            sections_map = {
                "Organizational Profile": context.organizational_profile,
                "Program Design": context.program_design,
                "Implementation Plan": context.implementation_plan,
                "Staffing Plan": context.staffing_plan,
                "Budget Narrative": context.budget_narrative,
                "Evaluation Plan": context.evaluation_plan,
                "Sustainability Plan": context.sustainability_plan
            }

            for section_title, section_data in sections_map.items():
                doc.add_heading(section_title, level=1)
                if not section_data or all(v is None for v in section_data.values()):
                    doc.add_paragraph("[This section contains no populated data.]")
                    continue

                for k, v in section_data.items():
                    if k == "Additional_Info":
                        if isinstance(v, dict) and v:
                            doc.add_heading("Additional Specifications", level=2)
                            for sub_k, sub_v in v.items():
                                doc.add_paragraph(f"{sub_k}: {self._safe_value(sub_v)}")
                        continue
                    doc.add_paragraph(f"{k}: {self._safe_value(v)}")

            doc.save(output_path)
            return output_path
            
        except PermissionError as perm_err:
            raise RuntimeError(f"Permission denied saving DOCX output to '{output_path}': {str(perm_err)}") from perm_err
        except Exception as e:
            raise RuntimeError(f"Failed to generate and export DOCX to '{output_path}': {str(e)}") from e

