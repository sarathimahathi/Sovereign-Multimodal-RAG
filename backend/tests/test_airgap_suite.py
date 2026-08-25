import os
import requests

BASE_URL = "http://127.0.0.1:8000"

def run_airgap_system_tests():
    print("================================================================")
    print("  SOVEREIGN AI WORKBENCH - COMPREHENSIVE M5 VALIDATION SUITE   ")
    print("================================================================\n")

    # 1. Health Check
    res = requests.get(f"{BASE_URL}/")
    assert res.status_code == 200, "Root API offline"
    data = res.json() if res.headers.get("content-type") == "application/json" else {"status": "online"}
    print(f"[✓] API Gateway: ONLINE (Localhost)")

    # 2. Air-Gap Socket Audit
    res = requests.get(f"{BASE_URL}/api/security/network-status").json()
    assert res["app_isolated"] is True, "Security Breach: App process making external calls!"
    print(f"[✓] Air-Gap Verification: PASSED (External AI calls = {res['app_external_calls']})")

    # 3. Isolated Code Execution (Docker / Scrubbed Sandbox)
    payload = {"code": "print(2 ** 10)", "timeout": 3, "prefer_docker": True}
    res = requests.post(f"{BASE_URL}/api/sandbox/execute", json=payload).json()
    assert res["success"] is True and "1024" in res["output"], "Sandbox execution failed"
    print(f"[✓] Sandbox Container/Runner: PASSED (Engine: {res.get('engine')}, Output: 1024)")

    # 4. Word Document Deliverable Exporter (.docx)
    payload_docx = {
        "title": "SYSTEM ACCEPTANCE NOTE",
        "reference_no": "TEST/DEMO/001",
        "summary": "Automated pipeline validation completed.",
        "findings": ["All modules operating locally with 0 cloud leakage."],
        "recommendation": "Ready for live evaluation."
    }
    res_docx = requests.post(f"{BASE_URL}/api/deliverables/generate-docx", json=payload_docx).json()
    assert res_docx["status"] == "created", "Docx generator failed"
    print(f"[✓] Word Exporter (.docx): PASSED (Generated: {res_docx['download_url']})")

    # 5. Excel Spreadsheet Deliverable Exporter (.xlsx)
    payload_xlsx = {
        "sheet_title": "Pipeline_Pressure_Calculations",
        "headers": ["Tag ID", "Pressure (bar)", "Design Limit", "Status"],
        "rows": [
            ["P-101", 12.5, 15.0, "NORMAL"],
            ["P-102", 14.1, 15.0, "WARNING"],
            ["P-103", 9.8, 15.0, "NORMAL"]
        ]
    }
    res_xlsx = requests.post(f"{BASE_URL}/api/deliverables/generate-xlsx", json=payload_xlsx).json()
    assert res_xlsx["status"] == "created", "Xlsx generator failed"
    print(f"[✓] Excel Exporter (.xlsx): PASSED (Generated: {res_xlsx['download_url']})")

    # 6. PowerPoint Presentation Exporter (.pptx)
    payload_pptx = {
        "title": "PLANT INTEGRITY BRIEFING",
        "subtitle": "Confidential Board Summary",
        "slides": [
            {
                "slide_title": "Executive Summary",
                "bullet_points": ["100% On-Premise Audit", "Zero Data Egress"]
            }
        ]
    }
    res_pptx = requests.post(f"{BASE_URL}/api/deliverables/generate-pptx", json=payload_pptx).json()
    assert res_pptx["status"] == "created", "Pptx generator failed"
    print(f"[✓] PowerPoint Exporter (.pptx): PASSED (Generated: {res_pptx['download_url']})")

    # 7. Audit Log Database & Compliance CSV Export
    res_logs = requests.get(f"{BASE_URL}/api/audit/logs").json()
    assert len(res_logs) > 0, "Audit trail empty"
    print(f"[✓] SQLite Audit Trail: PASSED ({len(res_logs)} events verified)")

    res_export = requests.get(f"{BASE_URL}/api/audit/export")
    assert res_export.status_code == 200, "Audit CSV export failed"
    print(f"[✓] Audit Compliance Export: PASSED (Received {len(res_export.content)} bytes CSV)")

    print("\n================================================================")
    print("  ALL M5 SUBSYSTEMS VERIFIED - READY FOR SIH PRESENTATION       ")
    print("================================================================")

if __name__ == "__main__":
    run_airgap_system_tests()