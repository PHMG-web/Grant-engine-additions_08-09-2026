import re
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class ClientProfile(BaseModel):
    organization_name: str
    organization_type: str  # e.g. "Nonprofit (501c3)", "For-Profit Small Business", "Tribal Government", "Higher Education"
    has_active_sam_registration: bool = True
    uei_number: str = ""
    geographic_location: str = "Remote / USA"
    cost_share_available: bool = True
    requested_budget: float = 0.0
    has_required_key_personnel: bool = True

class GrantScorer:
    """
    Automates matching client profile criteria directly against parsed solicitation parameters
    to calculate a compliance, alignment, and eligibility score (0 to 100).
    """

    def __init__(self):
        pass

    def score_eligibility(self, client: ClientProfile, nofo: Any) -> Dict[str, Any]:
        """
        Calculates alignment scoring and extracts blockers/disqualification indicators.
        Splits execution into distinct validation checkers to reduce function complexity.
        """
        score = 100
        breakdown = []
        disqualifications = []

        # 1. Run SAM & UEI check
        score, disqualifications, breakdown = self._check_sam_and_uei(client, nofo, score, disqualifications, breakdown)

        # 2. Run Organization Type check
        score, disqualifications, breakdown = self._check_org_type(client, nofo, score, disqualifications, breakdown)

        # 3. Run Budget envelope check
        score, disqualifications, breakdown = self._check_budget_envelope(client, nofo, score, disqualifications, breakdown)

        # 4. Run Cost-Sharing check
        score, disqualifications, breakdown = self._check_cost_sharing(client, nofo, score, disqualifications, breakdown)

        # 5. Run Key Personnel staffing check
        score, disqualifications, breakdown = self._check_key_personnel(client, nofo, score, disqualifications, breakdown)

        # Bound score minimum to 0
        final_score = max(0, score)

        return {
            "is_eligible": len(disqualifications) == 0,
            "score": final_score,
            "breakdown": breakdown,
            "disqualifications": disqualifications
        }

    def _check_sam_and_uei(self, client: ClientProfile, nofo: Any, score: int, disqualifications: List[str], breakdown: List[str]):
        """Helper to score and check SAM.gov & UEI status."""
        sam_required = nofo.uei_sam_required if hasattr(nofo, 'uei_sam_required') else None
        
        if sam_required and str(sam_required).lower() in ["yes", "true", "required"]:
            if not client.has_active_sam_registration:
                score -= 20
                disqualifications.append("Active SAM.gov registration is mandatory for submission, but the client profile lists inactive status.")
                breakdown.append("SAM.gov Registration: 0/20 pts (Disqualifying - Active registration required)")
            elif not client.uei_number or len(client.uei_number.strip()) < 9:
                score -= 10
                disqualifications.append("Active SAM.gov registration requires a valid Unique Entity Identifier (UEI) on file.")
                breakdown.append("Unique Entity Identifier: 10/20 pts (Missing or invalid UEI)")
            else:
                breakdown.append("SAM.gov & UEI Status: 20/20 pts (Fully Compliant)")
        else:
            if not client.has_active_sam_registration:
                score -= 10
                breakdown.append("SAM.gov Registration: 10/20 pts (Inactive SAM registration is a major risk for contracting)")
            else:
                breakdown.append("SAM.gov & UEI Status: 20/20 pts (Fully Compliant)")
                
        return score, disqualifications, breakdown

    def _check_org_type(self, client: ClientProfile, nofo: Any, score: int, disqualifications: List[str], breakdown: List[str]):
        """Helper to score and check organization type compliance."""
        eligibility_text = nofo.eligibility if hasattr(nofo, 'eligibility') else ""
        if eligibility_text:
            elig_text_lower = eligibility_text.lower()
            client_org_lower = client.organization_type.lower()
            
            is_nonprofit_grant = "nonprofit" in elig_text_lower or "501" in elig_text_lower
            is_small_biz_setaside = "small business" in elig_text_lower or "8(a)" in elig_text_lower or "set-aside" in elig_text_lower

            mismatch = False
            if is_nonprofit_grant and "for-profit" in client_org_lower:
                mismatch = True
                disqualifications.append(f"Ineligible entity type: Solicitation is restricted to Nonprofits, but client organization type is '{client.organization_type}'.")
            elif is_small_biz_setaside and "large" in client_org_lower:
                mismatch = True
                disqualifications.append(f"Ineligible entity scale: Solicitation is a Small Business Set-Aside, but client scale is '{client.organization_type}'.")

            if mismatch:
                score -= 30
                breakdown.append(f"Organization Type Eligibility: 0/30 pts (Ineligible entity type: '{client.organization_type}')")
            else:
                breakdown.append("Organization Type Eligibility: 30/30 pts (Matched successfully)")
        else:
            breakdown.append("Organization Type Eligibility: 30/30 pts (Matched successfully - open eligibility)")
            
        return score, disqualifications, breakdown

    def _check_budget_envelope(self, client: ClientProfile, nofo: Any, score: int, disqualifications: List[str], breakdown: List[str]):
        """Helper to verify requested budget fits ceiling and floor envelopes."""
        ceiling_str = nofo.award_ceiling if hasattr(nofo, 'award_ceiling') else None
        floor_str = nofo.award_floor if hasattr(nofo, 'award_floor') else None

        def clean_numeric(val_str: str) -> float:
            if not val_str:
                return 0.0
            cleaned = re.sub(r"[^\d.]", "", val_str)
            try:
                return float(cleaned)
            except ValueError:
                return 0.0

        ceiling_val = clean_numeric(ceiling_str) if ceiling_str else 0.0
        floor_val = clean_numeric(floor_str) if floor_str else 0.0

        if client.requested_budget > 0.0:
            budget_errors = []
            if ceiling_val > 0.0 and client.requested_budget > ceiling_val:
                budget_errors.append(f"Requested budget (${client.requested_budget:,.2f}) exceeds the award ceiling (${ceiling_val:,.2f}).")
            if floor_val > 0.0 and client.requested_budget < floor_val:
                budget_errors.append(f"Requested budget (${client.requested_budget:,.2f}) falls below the award floor (${floor_val:,.2f}).")

            if budget_errors:
                score -= 15
                disqualifications.extend(budget_errors)
                breakdown.append("Budget Envelope Verification: 5/20 pts (Out of boundary limits)")
            else:
                breakdown.append("Budget Envelope Verification: 20/20 pts (Fully Compliant)")
        else:
            breakdown.append("Budget Envelope Verification: 20/20 pts (Passed - no budget requested yet)")
            
        return score, disqualifications, breakdown

    def _check_cost_sharing(self, client: ClientProfile, nofo: Any, score: int, disqualifications: List[str], breakdown: List[str]):
        """Helper to verify cost sharing matching funds availability."""
        sharing_text = nofo.cost_sharing if hasattr(nofo, 'cost_sharing') else ""
        sharing_required = False
        if sharing_text:
            sharing_lower = sharing_text.lower()
            if "required" in sharing_lower or "match" in sharing_lower or "sharing" in sharing_lower:
                if "not required" not in sharing_lower and "no cost share" not in sharing_lower:
                    sharing_required = True

        if sharing_required:
            if not client.cost_share_available:
                score -= 15
                disqualifications.append("Solicitation mandates cost-sharing or matching funds, but client profile indicates no matching funds are available.")
                breakdown.append("Cost Sharing Alignment: 0/15 pts (Disqualifying - Matching funds required)")
            else:
                breakdown.append("Cost Sharing Alignment: 15/15 pts (Cost-share matched)")
        else:
            breakdown.append("Cost Sharing Alignment: 15/15 pts (Compliant - Cost-share not required)")
            
        return score, disqualifications, breakdown

    def _check_key_personnel(self, client: ClientProfile, nofo: Any, score: int, disqualifications: List[str], breakdown: List[str]):
        """Helper to check staffing compliance."""
        if not client.has_required_key_personnel:
            score -= 10
            disqualifications.append("Proposal lacks the key personnel credentials mandated in the solicitation.")
            breakdown.append("Key Personnel Alignment: 5/15 pts (Staffing criteria unsatisfied)")
        else:
            breakdown.append("Key Personnel Alignment: 15/15 pts (Fully Staffed & Compliant)")
            
        return score, disqualifications, breakdown
