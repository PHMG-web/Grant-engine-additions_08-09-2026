"""
Grant Automation Engine Package
Provides:
- Template loading
- Grant context management
- Workflow engine
- Variable mapping
- Section generation
- Validation
"""

from .engine import GrantAutomationEngine
from .template_loader import TemplateLoader
from .grant_context import GrantContext
from .validator import Validator

# Optional exports (only if implemented)
# from .variable_mapper import VariableMapper
# from .section_generator import SectionGenerator
from .docx_extractor import DocxExtractor
# from .data_loader import DataLoader
from .nofo_parser import NOFOParser, NOFOData
# from .exporter import Exporter

__all__ = [
    "GrantAutomationEngine",
    "TemplateLoader",
    "GrantContext",
    "Validator",
    "DocxExtractor",
    "NOFOParser",
    "NOFOData",
]

