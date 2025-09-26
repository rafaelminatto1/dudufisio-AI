import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
TIMEOUT = 30
AUTH = HTTPBasicAuth("admin@dudufisio.com", "demo123456")
HEADERS = {
    "Accept": "application/json"
}

def test_get_appointments_filtered_by_date():
    params = {
        "startDate": "2025-01-01",
        "endDate": "2025-12-31"
    }
    try:
        response = requests.get(f"{BASE_URL}/api/appointments", auth=AUTH, headers=HEADERS, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        appointments = response.json()
        assert isinstance(appointments, list), "Response is not a list"
        # Optional: Validate each appointment has expected keys (basic schema validation)
        if appointments:
            appointment = appointments[0]
            assert isinstance(appointment, dict), "Each appointment should be an object"
            # Common fields to expect by schema reference (not fully detailed in PRD)
            # We check at least presence of date or datetime for filtering sanity
            possible_date_fields = ["date", "startDate", "appointmentDate"]
            date_field_found = any(field in appointment for field in possible_date_fields)
            assert date_field_found, "No date field found in appointment to validate filtering"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_appointments_filtered_by_date()