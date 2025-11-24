import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")

def test_validate_responsive_accessibility_compliance():
    """
    Test the user interface API endpoints to ensure the system is responsive
    and meets WCAG 2.1 AA accessibility standards.
    """
    healthcheck_endpoint = f"{BASE_URL}/api/monitoring/healthcheck"
    accessibility_endpoint = f"{BASE_URL}/api/ui/accessibility"
    headers = {
        "Accept": "application/json"
    }

    # Check system responsiveness via healthcheck endpoint
    try:
        health_response = requests.get(healthcheck_endpoint, auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert health_response.status_code == 200, f"Healthcheck status {health_response.status_code}, expected 200"
        health_json = health_response.json()
        # Expecting a key indicating system is up
        assert health_json.get("status") == "ok", f"Healthcheck response status is not ok: {health_json}"
        # Optionally check if response time is reasonable (< 2 seconds)
        # This might require timestamp or measuring elapsed time; we measure elapsed time here:
        assert health_response.elapsed.total_seconds() < 2, f"Healthcheck response time too high: {health_response.elapsed.total_seconds()}s"

    except requests.RequestException as e:
        assert False, f"Exception during healthcheck request: {e}"

    # Check accessibility compliance endpoint
    try:
        accessibility_response = requests.get(accessibility_endpoint, auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert accessibility_response.status_code == 200, f"Accessibility endpoint status {accessibility_response.status_code}, expected 200"
        accessibility_data = accessibility_response.json()
        
        # Validate that accessibility data indicates WCAG 2.1 AA compliance
        # Assuming response contains fields like 'wcag_compliance' with levels and pass status
        wcag = accessibility_data.get("wcag_2_1_aa_compliance")
        assert wcag is not None, "No WCAG 2.1 AA compliance information found in response"
        assert isinstance(wcag, dict), "WCAG compliance data should be a dictionary"
        assert wcag.get("compliant") is True, "System does not comply with WCAG 2.1 AA accessibility standards"
        
        # Optionally check details of guidelines met
        guidelines = wcag.get("guidelines", {})
        assert isinstance(guidelines, dict), "Guidelines details missing or invalid"
        # Check key guidelines have pass status True
        required_guidelines = [
            "perceivable",
            "operable",
            "understandable",
            "robust"
        ]
        for guideline in required_guidelines:
            assert guidelines.get(guideline) is True, f"Guideline '{guideline}' not compliant"

    except requests.RequestException as e:
        assert False, f"Exception during accessibility compliance request: {e}"

test_validate_responsive_accessibility_compliance()