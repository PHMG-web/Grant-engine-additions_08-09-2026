import re
import pdfplumber
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel
from fastapi import UploadFile
from openai import OpenAI
import os

# ---------------------------
# DATA MODEL
# ---------------------------
class NOFOData(BaseModel):
    opportunity_number: Optional[str] = None
    assistance_listing: Optional[str] = None
    agency: Optional[str] = None
    eligibility: Optional[str] = None
    award_ceiling: Optional[str] = None
    award_floor: Optional[str] = None
    total_program_funding: Optional[str] = None
    cost_sharing: Optional[str] = None
    deadline: Optional[str] = None
    program_purpose: Optional[str] = None
    application_requirements: Optional[str] = None
    review_criteria: Optional[str] = None
    questions_deadline: Optional[str] = None
    period_of_performance: Optional[str] = None
    set_aside_category: Optional[str] = None
    naics_code: Optional[str] = None
    contract_type: Optional[str] = None
    place_of_performance: Optional[str] = None
    key_personnel_requirements: Optional[str] = None
    points_of_contact: Optional[str] = None
    uei_sam_required: Optional[str] = None
    raw_text: Optional[str] = None

# ---------------------------
# AZURE OPENAI CLIENT
# ---------------------------
_client = None

def get_openai_client():
    global _client
    if _client is None:
        api_key = os.getenv("AZURE_OPENAI_KEY") or "mock-key-for-import-safety"
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT") or "https://mock.azure.openai.com"
        model = os.getenv("AZURE_OPENAI_MODEL") or "mock-model"
        _client = OpenAI(
            api_key=api_key,
            base_url=f"{endpoint}/openai/deployments/{model}",
            default_headers={"api-key": api_key}
        )
    return _client

SYSTEM_PROMPT = """
You are PHMEG’s NOFO parsing engine. Your job is to read long federal grant
announcements and contracting solicitations and extract structured, machine‑readable data.

Return ONLY valid JSON. No commentary, no explanation.

Extract the following fields:

- opportunity_number
- assistance_listing
- agency
- eligibility
- award_ceiling
- award_floor
- total_program_funding
- cost_sharing
- deadline
- program_purpose
- application_requirements
- review_criteria
- questions_deadline (The deadline to submit questions/clarifications to the grants/contracting officer)
- period_of_performance (The performance duration, e.g., 5 years or Base year + Option years)
- set_aside_category (For contracting RFPs: Total Small Business, 8(a), HubZone, SDVOSB, or Unrestricted)
- naics_code (North American Industry Classification System code, e.g., 541511)
- contract_type (Contract vehicle, e.g., Fixed Price, CPFF, Time & Materials, Cooperative Agreement)
- place_of_performance (Physical/remote geographic work location requirements)
- key_personnel_requirements (Required personnel roles and credentials specified in solicitation)
- points_of_contact (Grants management or Contracting officers contact details: name, email, phone)
- uei_sam_required (Is active SAM.gov/Unique Entity Identifier registration mandatory for submission: Yes/No/Null)

If a field is missing, return null.
If a number is not explicitly stated, return null.
"""

# ---------------------------
# PARSER CLASS
# ---------------------------
class NOFOParser:

    def __init__(self):
        pass

    # ---------------------------
    # PDF → TEXT
    # ---------------------------
    def extract_text(self, file: Any) -> str:
        """
        Extracts raw text from a PDF file.
        Supports string file path, UploadFile, or file-like object.
        Includes error handling, guards for empty results, and explicit failure reporting.
        """
        try:
            if file is None:
                raise ValueError("No file provided.")

            pages = []
            if isinstance(file, str):
                # Standard file path
                with pdfplumber.open(file) as pdf:
                    if not pdf.pages:
                        raise ValueError("The PDF file contains no pages.")
                    for i, page in enumerate(pdf.pages):
                        page_text = page.extract_text()
                        if page_text:
                            pages.append(page_text)
            elif hasattr(file, "file"):
                # FastAPI UploadFile
                if hasattr(file.file, "seek"):
                    file.file.seek(0)
                with pdfplumber.open(file.file) as pdf:
                    if not pdf.pages:
                        raise ValueError("The PDF file contains no pages.")
                    for i, page in enumerate(pdf.pages):
                        page_text = page.extract_text()
                        if page_text:
                            pages.append(page_text)
            else:
                # File-like binary stream
                if hasattr(file, "seek"):
                    file.seek(0)
                with pdfplumber.open(file) as pdf:
                    if not pdf.pages:
                        raise ValueError("The PDF file contains no pages.")
                    for i, page in enumerate(pdf.pages):
                        page_text = page.extract_text()
                        if page_text:
                            pages.append(page_text)

            if not pages:
                raise ValueError("No readable text could be extracted from any page in the PDF.")

            text = "\n".join(pages)
            cleaned = self.clean_text(text)
            if not cleaned:
                raise ValueError("Text extraction returned only whitespace.")
            return cleaned

        except Exception as e:
            # Explicit failure reporting
            raise RuntimeError(f"PDF extraction failed: {str(e)}") from e

    # ---------------------------
    # CLEANING
    # ---------------------------
    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r"\s+", " ", text)
        text = text.replace("–", "-")
        return text.strip()

    # ---------------------------
    # PARSING
    # ---------------------------
    def parse(self, text: str) -> NOFOData:
        """
        Parses raw text (extracted from PDF) into a structured NOFOData model.
        Uses Azure OpenAI with safe error handling and explicit failure reporting.
        """
        if not text or not text.strip():
            raise ValueError("Cannot parse empty or null text.")

        cleaned_text = self.clean_text(text)

        try:
            # Verify required env vars are present before calling the API
            api_key = os.getenv("AZURE_OPENAI_KEY")
            endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            model = os.getenv("AZURE_OPENAI_MODEL")

            if not api_key or not endpoint or not model:
                # Use a fallback / raise explicit exception
                raise ValueError("Missing Azure OpenAI configuration variables (AZURE_OPENAI_KEY, AZURE_OPENAI_ENDPOINT, or AZURE_OPENAI_MODEL).")

            response = get_openai_client().chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": cleaned_text[:12000]}  # Limit to token safe length
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )

            response_content = response.choices[0].message.content
            if not response_content:
                raise ValueError("Empty response received from Azure OpenAI.")

            data = json.loads(response_content)
            data["raw_text"] = cleaned_text

            return NOFOData(**data)

        except Exception as e:
            # Explicit failure reporting
            raise RuntimeError(f"NOFO parsing failed: {str(e)}") from e

    def parse_file(self, file: Any) -> NOFOData:
        """
        Helper method to extract text and parse a NOFO PDF file.
        """
        text = self.extract_text(file)
        return self.parse(text)
