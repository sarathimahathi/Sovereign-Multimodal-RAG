import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "uploads"))
os.makedirs(STORAGE_DIR, exist_ok=True)

def generate_approval_note_docx(title: str, reference_no: str, summary: str, findings: list[str], recommendation: str) -> str:
    """Generates a formal industrial/PSU approval note document."""
    doc = Document()

    # Header title
    heading = doc.add_heading(title, level=1)
    heading.alignment = 1

    # Metadata
    doc.add_paragraph(f"Reference No: {reference_no}")
    doc.add_paragraph(f"Classification: INTERNAL / STRICTLY CONFIDENTIAL\n")

    # Section 1: Executive Summary
    doc.add_heading("1. Executive Summary", level=2)
    doc.add_paragraph(summary)

    # Section 2: Key Observations / Findings
    doc.add_heading("2. Key Inspection Findings", level=2)
    for finding in findings:
        doc.add_paragraph(finding, style="List Bullet")

    # Section 3: Recommendation & Approval Request
    doc.add_heading("3. Recommendations & Sign-off", level=2)
    doc.add_paragraph(recommendation)

    file_name = f"Approval_Note_{reference_no.replace('/', '_')}.docx"
    file_path = os.path.join(STORAGE_DIR, file_name)
    doc.save(file_path)
    return file_path

def generate_calculation_sheet_xlsx(sheet_title: str, headers: list[str], rows: list[list[any]]) -> str:
    """Generates an Excel spreadsheet for engineering/financial calculations."""
    wb = Workbook()
    ws = wb.active
    ws.title = "Calculations"

    # Header styling
    ws.append(headers)
    for col in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
        cell.alignment = Alignment(horizontal="center")

    # Insert data rows
    for row_data in rows:
        ws.append(row_data)

    file_name = f"{sheet_title.replace(' ', '_')}.xlsx"
    file_path = os.path.join(STORAGE_DIR, file_name)
    wb.save(file_path)
    return file_path