import json
import os

class TemplateLoader:
    def __init__(self, templates_dir):
        self.templates_dir = templates_dir
        self.manifest_path = os.path.join(templates_dir, "manifest.json")
        self.manifest = self._load_manifest()

    def _load_manifest(self):
        if not os.path.exists(self.manifest_path):
            raise FileNotFoundError(f"manifest.json not found in {self.templates_dir}")

        with open(self.manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_template(self, template_id):
        """Return template text + metadata."""
        for entry in self.manifest["templates"]:
            if entry["id"] == template_id:
                file_path = os.path.join(self.templates_dir, entry["filename"])
                with open(file_path, "r", encoding="utf-8") as f:
                    template_text = f.read()

                return {
                    "id": entry["id"],
                    "filename": entry["filename"],
                    "order": entry["order"],
                    "required_fields": entry.get("required_fields", []),
                    "text": template_text
                }

        raise ValueError(f"Template ID '{template_id}' not found in manifest.")

    def get_workflow_order(self):
        """Return template IDs sorted by workflow order."""
        sorted_entries = sorted(self.manifest["templates"], key=lambda x: x["order"])
        return [entry["id"] for entry in sorted_entries]

    def get_required_fields(self, template_id):
        """Return required fields for validation."""
        for entry in self.manifest["templates"]:
            if entry["id"] == template_id:
                return entry.get("required_fields", [])
        raise ValueError(f"Template ID '{template_id}' not found.")

    def list_templates(self):
        """Return list of all template IDs."""
        return [entry["id"] for entry in self.manifest["templates"]]
