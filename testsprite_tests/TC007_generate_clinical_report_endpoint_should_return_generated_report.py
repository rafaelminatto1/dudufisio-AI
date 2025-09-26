import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
AUTH_USERNAME = "admin@dudufisio.com"
AUTH_PASSWORD = "demo123456"
TIMEOUT = 30


def test_generate_clinical_report_should_return_generated_report():
    # Step 1: Create a patient to use a valid patientId
    patient_payload = {
        "name": "Test Patient AI Report",
        "email": "test_ai_report@dudufisio.com",
        "phone": "+5511999999999",
        "birthDate": "1985-05-20",
        "medicalHistory": ["hypertension", "allergy to penicillin"]
    }

    patient_id = None

    try:
        # Create patient
        create_patient_resp = requests.post(
            f"{BASE_URL}/api/patients",
            json=patient_payload,
            auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
            timeout=TIMEOUT
        )
        assert create_patient_resp.status_code == 201, f"Failed to create patient: {create_patient_resp.text}"
        # The patient id should be returned in Location header or response body; assuming response body returns it
        if create_patient_resp.headers.get("Content-Type", "").startswith("application/json"):
            patient_data = create_patient_resp.json()
            patient_id = patient_data.get("id")
        if not patient_id:
            # fallback: try to get patients and find our patient by email
            list_patients_resp = requests.get(
                f"{BASE_URL}/api/patients",
                auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
                timeout=TIMEOUT
            )
            assert list_patients_resp.status_code == 200, "Could not list patients to get ID"
            patients = list_patients_resp.json()
            for p in patients:
                if p.get("email") == patient_payload["email"]:
                    patient_id = p.get("id")
                    break
        assert patient_id is not None, "Patient ID not found after creation"

        # Step 2: Generate clinical report with given patientId
        report_payload = {
            "patientId": patient_id,
            "reportType": "clinical_summary",
            "data": {
                "notes": "Patient shows significant improvement in range of motion.",
                "observations": ["Normal gait", "Mild pain on movement"]
            }
        }

        generate_report_resp = requests.post(
            f"{BASE_URL}/api/ai/generate-report",
            json=report_payload,
            auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
            timeout=TIMEOUT
        )
        assert generate_report_resp.status_code == 200, f"Unexpected status code: {generate_report_resp.status_code}"
        response_json = generate_report_resp.json()
        assert isinstance(response_json, dict), "Response is not a JSON object"
        assert "report" in response_json, "'report' key not in response"
        assert isinstance(response_json["report"], str), "'report' is not a string"
        assert len(response_json["report"].strip()) > 0, "Report content is empty"

    finally:
        # Cleanup: Delete the patient created for this test if patient_id exists
        if patient_id:
            # Assuming DELETE /api/patients/{id} is supported (not in PRD, but typical)
            # If not, skip cleanup to avoid side effects
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/api/patients/{patient_id}",
                    auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
                    timeout=TIMEOUT
                )
                # No assertion here, just best effort cleanup
            except Exception:
                pass


test_generate_clinical_report_should_return_generated_report()