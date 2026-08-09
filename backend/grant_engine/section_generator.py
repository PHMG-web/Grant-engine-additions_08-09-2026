import re
from typing import Any, Dict

class SectionGenerator:
    """
    Generates narrative sections by replacing placeholders in templates
    with mapped variables from GrantContext.
    Supports single braces {Variable} and double braces {{Variable}} with arbitrary spacing.
    """

    def generate_section(self, template_text: str, variables: Dict[str, Any]) -> Dict[str, str]:
        """
        Replace placeholders in template_text with values from variables.
        Placeholders can follow {VariableName}, {{VariableName}}, or with spacing {{ VariableName }}.
        """
        if not template_text:
            return {}

        generated_text = template_text

        # First, substitute all provided variables using robust regex matching
        for key, value in variables.items():
            # Regex to match single or double curly braces with optional whitespace around the key:
            # e.g., {key}, {{key}}, {  key  }, {{   key   }}
            escaped_key = re.escape(key)
            pattern = r"\{+\s*" + escaped_key + r"\s*\}+"
            
            replacement = self.format_value(key, value)
            generated_text = re.sub(pattern, replacement, generated_text)

        # Secondly, automatically catch and mark any remaining placeholders not matched in variables
        leftover_pattern = r"\{+\s*([a-zA-Z0-9_.-]+)\s*\}+"
        matches = list(re.finditer(leftover_pattern, generated_text))
        
        # Replace from back to front to preserve string offsets
        for m in reversed(matches):
            key_name = m.group(1)
            start, end = m.start(), m.end()
            generated_text = generated_text[:start] + f"[MISSING: {key_name}]" + generated_text[end:]

        return {"generated_text": generated_text}

    def format_value(self, key: str, value: Any) -> str:
        """
        Formats complex values (lists, dicts, None) into clean, narrative sentences.
        """
        if value is None:
            return f"[MISSING: {key}]"
            
        if isinstance(value, list):
            if not value:
                return "None"
            cleaned_list = [str(item).strip() for item in value if str(item).strip()]
            if not cleaned_list:
                return "None"
            
            # Format nicely as a natural list: "A, B, and C"
            if len(cleaned_list) == 1:
                return cleaned_list[0]
            if len(cleaned_list) == 2:
                return f"{cleaned_list[0]} and {cleaned_list[1]}"
            return ", ".join(cleaned_list[:-1]) + f", and {cleaned_list[-1]}"
            
        if isinstance(value, dict):
            if not value:
                return "None"
            parts = []
            for k, v in value.items():
                if v is not None and str(v).strip():
                    parts.append(f"{k}: {v}")
                else:
                    parts.append(str(k))
            return "; ".join(parts)
            
        return str(value)

