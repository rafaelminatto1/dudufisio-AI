import requests
from requests.auth import HTTPBasicAuth

base_url = "http://localhost:3000"
auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
timeout = 30
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_audit_log_tracking_and_compliance():
    audit_log_endpoint = f"{base_url}/api/audit/logs"

    # 1. Create a test resource to generate audit logs for (simulate a user action).
    # Since no resource ID provided, create a dummy patient to generate logs
    patient_endpoint = f"{base_url}/api/patients"
    new_patient = {
        "name": "Test Audit User",
        "cpf": "12345678909",
        "email": "audit_test_user@example.com",
        "phone": "+5511999999999"
    }

    patient_id = None
    try:
        # Create patient
        response_create = requests.post(patient_endpoint, json=new_patient, auth=auth, headers=headers, timeout=timeout)
        assert response_create.status_code == 201, f"Expected 201 on patient creation, got {response_create.status_code}"
        patient_data = response_create.json()
        patient_id = patient_data.get("id")
        assert patient_id is not None, "Created patient response missing 'id'"

        # Perform an action that should be logged by audit endpoint (e.g. update patient)
        update_data = {"phone": "+5511988888888"}
        response_update = requests.put(f"{patient_endpoint}/{patient_id}", json=update_data, auth=auth, headers=headers, timeout=timeout)
        assert response_update.status_code == 200, f"Expected 200 on patient update, got {response_update.status_code}"

        # Fetch audit logs related to this patient or user
        # Assuming API supports query param ?resourceId= or ?userEmail= or similar to filter logs
        params = {"resourceId": patient_id}
        response_logs = requests.get(audit_log_endpoint, auth=auth, headers=headers, timeout=timeout, params=params)
        assert response_logs.status_code == 200, f"Expected 200 on fetching audit logs, got {response_logs.status_code}"
        logs = response_logs.json()
        assert isinstance(logs, list), "Audit logs response should be a list"
        assert any(log.get("resourceId") == patient_id for log in logs), "Audit logs do not contain entries for test patient"
        assert any("update" in log.get("action", "").lower() for log in logs), "Audit logs missing update action for test patient"

        # Verify compliance: logs must have user identifiers, timestamps, action types
        for log in logs:
            assert "timestamp" in log, "Audit log missing timestamp"
            assert "user" in log, "Audit log missing user info"
            assert "action" in log, "Audit log missing action description"

    finally:
        if patient_id:
            # Clean up test patient
            del_response = requests.delete(f"{patient_endpoint}/{patient_id}", auth=auth, headers=headers, timeout=timeout)
            assert del_response.status_code in (200, 204), f"Expected 200 or 204 on patient deletion, got {del_response.status_code}"


test_audit_log_tracking_and_compliance()