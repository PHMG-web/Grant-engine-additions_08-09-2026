import json
import os

class TemplateLoader:
    def __init__(self, templates_dir):
        """
        Initializes the TemplateLoader. Ensures directories exist and safely loads manifest.json.
        """
        if not templates_dir:
            raise ValueError("Templates directory path cannot be empty or None.")
            
        self.templates_dir = templates_dir
        self.manifest_path = os.path.join(templates_dir, "manifest.json")
        self.manifest = self._load_manifest()

    def _load_manifest(self):
        """
        Safely reads manifest.json and performs strict schema validation.
        """
        try:
            if not os.path.exists(self.manifest_path):
                raise FileNotFoundError(f"manifest.json not found in templates directory '{self.templates_dir}'")

            with open(self.manifest_path, "r", encoding="utf-8") as f:
                manifest_data = json.load(f)
        except FileNotFoundError as file_not_found:
            raise file_not_found
        except json.JSONDecodeError as decode_err:
            raise RuntimeError(f"manifest.json contains invalid JSON: {str(decode_err)}") from decode_err
        except Exception as e:
            raise RuntimeError(f"Failed to load manifest.json: {str(e)}") from e

        # Strict schema validation
        if not isinstance(manifest_data, dict) or "templates" not in manifest_data:
            raise ValueError("Invalid manifest.json structure: Missing required top-level 'templates' list key.")

        templates_list = manifest_data["templates"]
        if not isinstance(templates_list, list):
            raise ValueError("Invalid manifest.json structure: 'templates' must be a JSON array.")

        for idx, entry in enumerate(templates_list):
            if not isinstance(entry, dict):
                raise ValueError(f"Invalid template configuration at entry index {idx}: Expected a JSON object.")
            
            # Check for required manifest schema elements
            required = ["id", "filename", "order"]
            missing = [k for k in required if k not in entry]
            if missing:
                raise ValueError(f"Malformed manifest entry at index {idx} (ID: '{entry.get('id', 'unknown')}'): Missing keys {missing}")

        return manifest_data

    def get_template(self, template_id):
        """Return template text + metadata. Includes robust error handling."""
        for entry in self.manifest["templates"]:
            if entry["id"] == template_id:
                file_path = os.path.join(self.templates_dir, entry["filename"])
                
                # Safe template loading guards
                try:
                    if not os.path.exists(file_path):
                        raise FileNotFoundError(f"Template file '{entry['filename']}' not found at '{file_path}'")
                        
                    with open(file_path, "r", encoding="utf-8") as f:
                        template_text = f.read()
                except PermissionError as perm_err:
                    raise RuntimeError(f"Permission denied reading template '{entry['filename']}' at '{file_path}': {str(perm_err)}") from perm_err
                except UnicodeDecodeError as decode_err:
                    raise RuntimeError(f"Encoding mismatch reading template '{entry['filename']}' at '{file_path}' (expected UTF-8): {str(decode_err)}") from decode_err
                except Exception as e:
                    raise RuntimeError(f"Failed to load template file '{entry['filename']}': {str(e)}") from e

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
