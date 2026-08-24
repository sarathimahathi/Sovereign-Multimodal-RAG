import os
import requests

BASE_URL = "http://127.0.0.1:8000"

def run_airgap_system_tests():
    print("==================================================")
    print("  SOVEREIGN AI WORKBENCH - VALIDATION TEST SUITE  ")
    print("==================================================\n")

    # 1. Health Check
    res = requests.get(f"{BASE_URL}/")
    assert res.status_code == 200, "Root API offline"
    print("[✓] API Gateway: ONLINE (Localhost)")

    # 2. Air-Gap Socket Audit
    res = requests.get(f"{BASE_URL}/api/security/network-status").json()
    assert res["app_isolated"] is True, "Security Breach: App process making external calls!"
    print(f"[✓] Air-Gap Verification: PASSED (External AI calls = {res['app_external_calls']})")

    # 3. Isolated Code Execution
    payload = {"code": "print(2 ** 10)", "timeout": 3}
    res = requests.post(f"{BASE_URL}/api/sandbox/execute", json=payload).json()
    assert res["success"] is True and "1024" in res["output"], "Sandbox execution failed"
    print("[✓] Sandbox Container: PASSED (Executed 2^10 = 1024 safely)")

    # 4. Word Document Deliverable Exporter
    payload = {
        "title": "SYSTEM ACCEPTANCE NOTE",
        "reference_no": "TEST/DEMO/001",
        "summary": "Automated pipeline validation completed.",
        "findings": ["All modules operating locally with 0 cloud leakage."],
        "recommendation": "Ready for live evaluation."
    }
    res = requests.post(f"{BASE_URL}/api/deliverables/generate-docx", json=payload).json()
    assert res["status"] == "created", "Docx generator failed"
    print(f"[✓] Docx Exporter: PASSED (Generated: {res['download_url']})")

    # 5. Audit Log Database
    res = requests.get(f"{BASE_URL}/api/audit/logs").json()
    assert len(res) > 0, "Audit trail empty"
    print(f"[✓] Local SQLite Audit Trail: PASSED ({len(res)} events verified)")

    print("\n==================================================")
    print("  ALL SUBSYSTEMS VERIFIED - READY FOR PRESENTATION ")
    print("==================================================")

if __name__ == "__main__":
    run_airgap_system_tests()
