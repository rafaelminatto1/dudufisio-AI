import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
AUTH_USERNAME = "admin@dudufisio.com"
AUTH_PASSWORD = "demo123456"
TIMEOUT = 30

def test_get_all_patients_returns_list_with_correct_structure():
    url = f"{BASE_URL}/api/patients"
    try:
        response = requests.get(url, auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD), timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        patients = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(patients, list), f"Expected response to be a list, got {type(patients)}"

    # Validate structure of each patient object
    for patient in patients:
        assert isinstance(patient, dict), f"Each patient should be a dict, got {type(patient)}"
        # Required patient keys based on schema
        expected_keys = {"id", "name", "email", "phone", "birthDate", "medicalHistory"}
        patient_keys = set(patient.keys())
        missing_keys = expected_keys - patient_keys
        assert not missing_keys, f"Patient object missing keys: {missing_keys}"

        assert isinstance(patient["id"], str), "Patient 'id' should be string"
        assert isinstance(patient["name"], str), "Patient 'name' should be string"
        assert isinstance(patient["email"], str), "Patient 'email' should be string"
        assert isinstance(patient["phone"], str), "Patient 'phone' should be string"
        assert isinstance(patient["birthDate"], str), "Patient 'birthDate' should be string"
        # medicalHistory is an array of strings, can be empty
        assert isinstance(patient["medicalHistory"], list), "Patient 'medicalHistory' should be a list"
        for entry in patient["medicalHistory"]:
            assert isinstance(entry, str), "Each entry in 'medicalHistory' should be a string"

test_get_all_patients_returns_list_with_correct_structure()