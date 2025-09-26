import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
TIMEOUT = 30
AUTH_USERNAME = "admin@dudufisio.com"
AUTH_PASSWORD = "demo123456"

def test_get_medical_records_returns_list():
    url = f"{BASE_URL}/api/medical-records"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD), timeout=TIMEOUT)
        # Verify status code 200
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        # Verify response content type JSON
        content_type = response.headers.get("Content-Type", "")
        assert "application/json" in content_type, f"Expected 'application/json' in Content-Type but got '{content_type}'"
        # Verify response is a JSON array (list)
        data = response.json()
        assert isinstance(data, list), f"Expected response JSON to be a list but got {type(data).__name__}"
        # Optionally, verify each item contains expected ClinicalDocument fields if available
        # Minimal validation: ClinicalDocument is likely an object, confirm items are dicts
        for item in data:
            assert isinstance(item, dict), "Expected each clinical document to be a JSON object"
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_get_medical_records_returns_list()
