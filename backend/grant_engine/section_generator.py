import re

class SectionGenerator:
    """
    Generates narrative sections by replacing placeholders in templates
    with mapped variables from GrantContext.
    """

    def generate_section(self, template_text, variables):
        """
        Replace placeholders in template_text with values from variables.
        Placeholders follow the format {{ VariableName }}.
        """
        if not template_text:
            return {}

        generated_text = template_text

        for key, value in variables.items():
            placeholder = "{{ " + key + " }}"
            if value is None:
                replacement = f"[MISSING: {key}]"
            elif isinstance(value, list):
                replacement = ", ".join(str(v) for v in value)
            elif isinstance(value, dict):
                replacement = "; ".join(f"{k}: {v}" for k, v in value.items())
            else:
                replacement = str(value)

            generated_text = generated_text.replace(placeholder, replacement)

        return {"generated_text": generated_text}

