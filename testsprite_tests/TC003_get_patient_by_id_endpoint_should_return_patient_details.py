import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
AUTH = HTTPBasicAuth("admin@dudufisio.com", "demo123456")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_get_patient_by_id_returns_patient_details():
    # First, create a patient to get a valid patient ID
    patient_data = {
        "name": "Test Patient",
        "email": "test.patient@example.com",
        "phone": "123456789",
        "birthDate": "1990-01-01",
        "medicalHistory": ["None"]
    }

    patient_id = None

    try:
        create_response = requests.post(
            f"{BASE_URL}/api/patients",
            json=patient_data,
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert create_response.status_code == 201, f"Expected status code 201 on patient creation, got {create_response.status_code}"

        # Get the list of patients to retrieve the created patient's ID (safer than relying on location header)
        list_response = requests.get(
            f"{BASE_URL}/api/patients",
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert list_response.status_code == 200, f"Expected status code 200 getting patients list, got {list_response.status_code}"
        patients = list_response.json()
        # find patient by unique email
        matching_patients = [p for p in patients if p.get("email") == patient_data["email"]]
        assert len(matching_patients) == 1, f"Expected exactly one patient with email {patient_data['email']}, found {len(matching_patients)}"
        patient_id = matching_patients[0].get("id")
        assert patient_id, "Patient ID not found in patient list response"

        # Use patient_id to get the patient details
        get_response = requests.get(
            f"{BASE_URL}/api/patients/{patient_id}",
            headers=HEADERS,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert get_response.status_code == 200, f"Expected status code 200 on get patient by id, got {get_response.status_code}"
        patient = get_response.json()

        # Validate returned patient details match initial data
        assert patient.get("id") == patient_id, "Returned patient id does not match requested id"
        assert patient.get("name") == patient_data["name"], "Patient name mismatch"
        assert patient.get("email") == patient_data["email"], "Patient email mismatch"
        assert patient.get("phone") == patient_data["phone"], "Patient phone mismatch"
        assert patient.get("birthDate") == patient_data["birthDate"], "Patient birthDate mismatch"
        assert isinstance(patient.get("medicalHistory"), list), "medicalHistory should be a list"
        assert patient.get("medicalHistory") == patient_data["medicalHistory"], "Patient medicalHistory mismatch"

    finally:
        # Cleanup - delete the created patient
        if patient_id:
            requests.delete(
                f"{BASE_URL}/api/patients/{patient_id}",
                headers=HEADERS,
                auth=AUTH,
                timeout=TIMEOUT
            )


test_get_patient_by_id_returns_patient_details()