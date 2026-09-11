"""
SentinelAI Enterprise - Executive Reporting API Routes
Endpoints for generating and downloading boardroom PDF summaries and structured JSON audit packages.
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from enterprise.auth.dependencies import get_current_user, get_current_org_id, TokenData
from enterprise.reporting.assembler import assemble_report_data
from enterprise.reporting.structured_export import generate_structured_json_export
from enterprise.reporting.pdf_generator import generate_executive_pdf_report

router = APIRouter(prefix="/enterprise/reports", tags=["Executive Reports & Exports"])


@router.get("/data")
def get_report_data(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve full structured report dataset for executive rendering."""
    return assemble_report_data(org_id=org_id)


@router.get("/export/json")
def download_json_export(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Export complete risk assessment package as structured JSON for regulatory filing."""
    json_str = generate_structured_json_export(org_id=org_id)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=sentinelai_report_{org_id}.json"}
    )


@router.get("/export/pdf")
def download_pdf_export(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Generate and download formal Executive Risk Assessment Report as a PDF."""
    try:
        pdf_bytes = generate_executive_pdf_report(org_id=org_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=sentinelai_executive_report_{org_id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
