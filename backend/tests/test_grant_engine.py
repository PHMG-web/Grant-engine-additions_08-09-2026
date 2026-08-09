import os
import tempfile
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
