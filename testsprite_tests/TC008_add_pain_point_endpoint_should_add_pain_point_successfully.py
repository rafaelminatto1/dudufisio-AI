import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
TIMEOUT = 30
AUTH = HTTPBasicAuth("admin@dudufisio.com", "demo123456")

def test_add_pain_point_should_add_pain_point_successfully():
    # First, create a new patient to use for the pain point
    patient_data = {
        "name": "Test Patient for Pain Point",
        "email": "testpainpoint@example.com",
        "phone": "9999999999",
        "birthDate": "1990-01-01",
        "medicalHistory": []
    }
    patient_id = None

    try:
        # Create patient
        patient_resp = requests.post(
            f"{BASE_URL}/api/patients",
            json=patient_data,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert patient_resp.status_code == 201, f"Failed to create patient, status: {patient_resp.status_code}, response: {patient_resp.text}"
        # Assuming response body contains patient with 'id' field
        patient = patient_resp.json()
        patient_id = patient.get("id")
        assert patient_id is not None, "Patient ID not returned in response"

        # Add pain point for the patient
        pain_point_data = {
            "patientId": patient_id,
            "x": 0.5,
            "y": 0.5,
            "intensity": 7,
            "description": "Severe pain in lower back"
        }

        pain_point_resp = requests.post(
            f"{BASE_URL}/api/body-map/pain-points",
            json=pain_point_data,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert pain_point_resp.status_code == 201, f"Failed to add pain point, status: {pain_point_resp.status_code}, response: {pain_point_resp.text}"

    finally:
        # Clean up - delete the patient if created
        if patient_id:
            requests.delete(
                f"{BASE_URL}/api/patients/{patient_id}",
                auth=AUTH,
                timeout=TIMEOUT
            )

test_add_pain_point_should_add_pain_point_successfully()