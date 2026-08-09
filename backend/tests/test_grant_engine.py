import os
import tempfile
import json
import pytest
from docx import Document
from grant_engine.nofo_parser import NOFOParser, NOFOData
from grant_engine.docx_extractor import DocxExtractor

# ==========================================
# NOFO PARSER TESTS
# ==========================================

def test_nofo_parser_clean_text():
    parser = NOFOParser()
    text = "   Hello    World \t  - This – is a test.   "
    cleaned = parser.clean_text(text)
    # The return should be a string, not a method/function pointer
    assert isinstance(cleaned, str)
    assert cleaned == "Hello World - This - is a test."

def test_nofo_parser_extract_text_invalid_input():
    parser = NOFOParser()
    with pytest.raises(RuntimeError) as exc_info:
        parser.extract_text(None)
    assert "PDF extraction failed" in str(exc_info.value)

    with pytest.raises(RuntimeError) as exc_info:
        parser.extract_text("non_existent_file.pdf")
    assert "PDF extraction failed" in str(exc_info.value)

def test_nofo_parser_parse_empty_input():
    parser = NOFOParser()
    with pytest.raises(ValueError) as exc_info:
        parser.parse("")
    assert "Cannot parse empty or null text" in str(exc_info.value)


# ==========================================
# DOCX EXTRACTOR TESTS
# ==========================================

def test_docx_extractor_load_error():
    with pytest.raises(RuntimeError) as exc_info:
        DocxExtractor("non_existent_file.docx")
    assert "Failed to load DOCX file" in str(exc_info.value)

def test_docx_extractor_workflow():
    # Create a temporary DOCX file
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Create a DOCX document using python-docx
        doc = Document()
        doc.add_paragraph("This is a simple paragraph with {Organization_Name} and {{Mission}} placeholders.")
        doc.add_paragraph("Here is a malformed unmatched open brace: {unmatched_open and some other text.")
        doc.add_paragraph("And here is an unmatched closing brace: unmatched_close} with empty braces {} inside.")
        doc.add_paragraph("Empty braces with whitespace {   } and double empty {{}}.")

        # Let's add a table
        table = doc.add_table(rows=2, cols=2)
        table.cell(0, 0).text = "Cell 1 with valid {Capacity} placeholder."
        table.cell(0, 1).text = "Cell 2 with malformed {unmatched_table_cell brace."
        table.cell(1, 0).text = "Cell 3 with empty table cell {} braces."
        table.cell(1, 1).text = "Cell 4 plain text."

        doc.save(tmp_path)

        # Initialize the extractor
        extractor = DocxExtractor(tmp_path)

        # 1. Test full text extraction
        full_text = extractor.extract_full_text()
        assert "Organization_Name" in full_text
        assert "Capacity" in full_text

        # 2. Test valid placeholders extraction
        placeholders = extractor.extract_placeholders()
        # Should extract: "Organization_Name", "Mission", "Capacity"
        assert "Organization_Name" in placeholders
        assert "Mission" in placeholders
        assert "Capacity" in placeholders
        # Make sure no malformed placeholders are returned as valid
        assert "unmatched_open" not in placeholders
        assert "unmatched_close" not in placeholders

        # 3. Test malformed tokens detection
        issues = extractor.detect_malformed_tokens()
        # Let's print issues for debug
        print("Detected issues:")
        for issue in issues:
            print(f" - {issue}")

        # Check for paragraph issues
        assert any("unmatched opening brace" in s for m in issues for s in [m.lower()])
        assert any("unmatched closing brace" in s for m in issues for s in [m.lower()])
        assert any("empty placeholder" in s for m in issues for s in [m.lower()])

        # 4. Test extract_all
        all_data = extractor.extract_all()
        assert "text" in all_data
        assert "placeholders" in all_data
        assert "issues" in all_data
        assert len(all_data["placeholders"]) == 3
        assert len(all_data["issues"]) > 0

    finally:
        # Clean up the temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_docx_extractor_load_sources():
    # 1. Test bytes / stream loading
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        doc = Document()
        doc.add_paragraph("Testing {Placeholder}")
        doc.save(tmp_path)

        with open(tmp_path, "rb") as f:
            content = f.read()

        import io
        stream = io.BytesIO(content)
        # Load from file-like object (BytesIO)
        extractor = DocxExtractor(stream)
        assert "Placeholder" in extractor.extract_placeholders()

        # 2. Test FastAPI UploadFile-like object loading
        class MockUploadFile:
            def __init__(self, file_obj):
                self.file = file_obj

        stream.seek(0)
        mock_file = MockUploadFile(stream)
        extractor_upload = DocxExtractor(mock_file)
        assert "Placeholder" in extractor_upload.extract_placeholders()

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_docx_extractor_auto_correct():
    # Test text corrections
    extractor = DocxExtractor.__new__(DocxExtractor) # Create uninitialized instance for unit testing method directly
    
    # 1. Test correct_text_braces logic
    text = "This has {unmatched_open and other matched {correct_field} with {}. Also unmatched close}"
    corrected, fixes = extractor.correct_text_braces(text)
    # {unmatched_open -> {unmatched_open} (1 fix)
    # {} -> removed (1 fix)
    # close} -> {close} (1 fix)
    assert fixes == 3
    assert "{unmatched_open}" in corrected
    assert "{close}" in corrected
    assert "{}" not in corrected

    # 2. Test full document auto-correction
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        doc = Document()
        doc.add_paragraph("Para with {Organization_Name open brace.")
        doc.add_paragraph("Para with Capacity} close brace.")
        doc.add_paragraph("Para with empty {} braces.")
        doc.save(tmp_path)

        ext = DocxExtractor(tmp_path)
        # Verify it has malformed issues before correction
        assert len(ext.detect_malformed_tokens()) > 0

        # Run correction
        fixes_made = ext.auto_correct_braces(tmp_path)
        assert fixes_made == 3

        # Re-load and verify it is clean with NO malformed issues and 100% valid placeholders!
        clean_ext = DocxExtractor(tmp_path)
        assert len(clean_ext.detect_malformed_tokens()) == 0
        placeholders = clean_ext.extract_placeholders()
        assert "Organization_Name" in placeholders
        assert "Capacity" in placeholders

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ==========================================
# GRANT CONTEXT & STATE TESTS
# ==========================================

def test_grant_context_type_guards():
    from grant_engine.grant_context import GrantContext
    context = GrantContext()
    
    # Safely update list conversion
    context.update_section("program_design", {
        "Program_Name": "Test Program",
        "Objectives": "Objective 1, Objective 2, Objective 3" # String gets converted to list
    })
    
    assert context.program_design["Program_Name"] == "Test Program"
    assert context.program_design["Objectives"] == ["Objective 1", "Objective 2", "Objective 3"]

    # Trigger TypeError on incorrect structure types
    with pytest.raises(TypeError):
        context.update_section("program_design", "not-a-dict")


# ==========================================
# SECTION GENERATOR TESTS
# ==========================================

def test_section_generator_formatting():
    from grant_engine.section_generator import SectionGenerator
    gen = SectionGenerator()
    
    # 1. Test single and double braces with spacing
    template = "This is a {Single_Brace} and {{Double_Brace}} and {{  Spaced_Brace  }}."
    variables = {
        "Single_Brace": "A",
        "Double_Brace": "B",
        "Spaced_Brace": "C"
    }
    
    res = gen.generate_section(template, variables)
    assert res["generated_text"] == "This is a A and B and C."

    # 2. Test natural list narrative formatting
    list_template = "Objectives: {Objectives}"
    assert gen.generate_section(list_template, {"Objectives": ["Objective 1"]})["generated_text"] == "Objectives: Objective 1"
    assert gen.generate_section(list_template, {"Objectives": ["Obj 1", "Obj 2"]})["generated_text"] == "Objectives: Obj 1 and Obj 2"
    assert gen.generate_section(list_template, {"Objectives": ["Obj 1", "Obj 2", "Obj 3"]})["generated_text"] == "Objectives: Obj 1, Obj 2, and Obj 3"


# ==========================================
# TEMPLATE LOADER VALIDATION TESTS
# ==========================================

def test_template_loader_guards():
    from grant_engine.template_loader import TemplateLoader
    
    # Directory missing raise
    with pytest.raises(FileNotFoundError):
        TemplateLoader("non_existent_templates_dir")


# ==========================================
# DATA LOADER & MALFORMED JSON TESTS
# ==========================================

def test_data_loader_guards():
    from grant_engine.data_loader import DataLoader
    
    loader = DataLoader("non_existent_data_dir")
    with pytest.raises(FileNotFoundError):
        loader.load_all()


# ==========================================
# EXPORTER DOCX & JSON GUARDS
# ==========================================

def test_exporter_safe_nones():
    from grant_engine.exporter import Exporter
    from grant_engine.grant_context import GrantContext
    
    exp = Exporter()
    context = GrantContext()
    
    # Unpopulated values print safely
    assert exp._safe_value(None) == "[Not Populated]"
    assert exp._safe_value([]) == "[Not Populated]"
    
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
        tmp_path = tmp.name
        
    try:
        # Export DOCX safely with missing values without exceptions
        saved_path = exp.export_docx(context, tmp_path)
        assert os.path.exists(saved_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ==========================================
# WORKFLOW ENGINE INTEGRATION TESTS
# ==========================================

def test_engine_workflow():
    from grant_engine.engine import GrantAutomationEngine
    
    # Create fake templates directory with manifest and template files
    with tempfile.TemporaryDirectory() as temp_dir:
        manifest_data = {
            "templates": [
                {
                    "id": "organizational_profile",
                    "filename": "org_profile.txt",
                    "order": 1,
                    "required_fields": ["Organization_Name"]
                },
                {
                    "id": "budget_narrative",
                    "filename": "budget.txt",
                    "order": 2,
                    "required_fields": ["Budget_Total"]
                }
            ]
        }
        
        # Write manifest.json
        with open(os.path.join(temp_dir, "manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest_data, f)
            
        # Write templates
        with open(os.path.join(temp_dir, "org_profile.txt"), "w", encoding="utf-8") as f:
            f.write("Profile: {Organization_Name} with mission {Mission}.")
            
        with open(os.path.join(temp_dir, "budget.txt"), "w", encoding="utf-8") as f:
            f.write("Budget Narrative is {{Budget_Total}}.")

        # Initialize engine
        engine = GrantAutomationEngine(temp_dir)
        
        # Run workflow and assert validation checks run automatically
        context = engine.run()
        
        assert engine.validation_results is not None
        # Since fields are empty initially, errors will exist
        assert "organizational_profile" in engine.validation_results["errors"]
        assert "budget_narrative" in engine.validation_results["errors"]

