import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
AUTH_USERNAME = "admin@dudufisio.com"
AUTH_PASSWORD = "demo123456"
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_create_new_patient_should_create_successfully():
    patient_data = {
        "name": "Test Patient",
        "email": "test.patient@example.com",
        "phone": "+5511999999999",
        "birthDate": "1990-01-01",
        "medicalHistory": [
            "No known allergies",
            "Previous knee surgery in 2018"
        ]
    }

    created_patient_id = None
    try:
        # Create new patient
        response = requests.post(
            f"{BASE_URL}/api/patients",
            json=patient_data,
            headers=HEADERS,
            auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
            timeout=TIMEOUT
        )

        # Assert status code 201 Created
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

        # Location header or ID in response might be used to get created patient id
        # If no response body or location, fallback to GET all and find patient by unique email
        if response.headers.get("Location"):
            created_patient_id = response.headers.get("Location").rstrip("/").split("/")[-1]
        else:
            # Try to get list of patients and find created one by email
            list_response = requests.get(
                f"{BASE_URL}/api/patients",
                headers=HEADERS,
                auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
                timeout=TIMEOUT
            )
            assert list_response.status_code == 200, f"Expected status code 200 listing patients, got {list_response.status_code}"
            patients = list_response.json()
            found_patients = [p for p in patients if p.get("email") == patient_data["email"]]
            assert len(found_patients) == 1, f"Created patient not found or multiple patients with same email"
            created_patient_id = found_patients[0]["id"]

        # Verify the created patient details by GET
        get_response = requests.get(
            f"{BASE_URL}/api/patients/{created_patient_id}",
            headers=HEADERS,
            auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
            timeout=TIMEOUT
        )
        assert get_response.status_code == 200, f"Expected status code 200 on GET patient, got {get_response.status_code}"
        patient = get_response.json()
        assert patient["name"] == patient_data["name"], "Patient name mismatch"
        assert patient["email"] == patient_data["email"], "Patient email mismatch"
        assert patient["phone"] == patient_data["phone"], "Patient phone mismatch"
        assert patient["birthDate"] == patient_data["birthDate"], "Patient birthDate mismatch"
        assert patient["medicalHistory"] == patient_data["medicalHistory"], "Patient medicalHistory mismatch"

    finally:
        # Cleanup: delete the created patient if ID is known
        if created_patient_id:
            try:
                delete_response = requests.delete(
                    f"{BASE_URL}/api/patients/{created_patient_id}",
                    headers=HEADERS,
                    auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD),
                    timeout=TIMEOUT
                )
                # Not asserting delete status, just attempt cleanup
            except Exception:
                pass

test_create_new_patient_should_create_successfully()