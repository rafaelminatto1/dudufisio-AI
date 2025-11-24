import requests
from requests.auth import HTTPBasicAuth

def test_api_testfase7_endpoint():
    base_url = "http://localhost:3000"
    endpoint = "/api/test-fase7"
    url = base_url + endpoint
    
    auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
    headers = {
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, auth=auth, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request to {url} failed: {e}"
    
    # Validate response status code
    assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
    
    # Validate response content type
    content_type = response.headers.get("Content-Type", "")
    assert "application/json" in content_type, f"Expected JSON response but got {content_type}"
    
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    
    # Basic sanity checks on returned JSON data
    assert isinstance(data, dict), "Response JSON should be an object"
    # Since the PRD does not specify response schema, check for presence of keys if any expected or just that data exists
    assert len(data) > 0, "Response JSON is empty"

test_api_testfase7_endpoint()
