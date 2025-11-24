import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
USERNAME = "cursor@moocafisio.com.br"
PASSWORD = "256256"
TIMEOUT = 30

def test_secure_authentication_and_access_control():
    login_url = f"{BASE_URL}/api/auth/login"
    # Step 1: Login with Basic Auth to get JWT token
    try:
        response = requests.post(login_url, auth=HTTPBasicAuth(USERNAME, PASSWORD), timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Login request failed: {str(e)}"

    assert response.status_code == 200, f"Expected 200 OK for login, got {response.status_code}"
    try:
        token_data = response.json()
    except ValueError:
        assert False, "Login response is not valid JSON"

    assert "access_token" in token_data, "Login response missing 'access_token'"
    jwt_token = token_data["access_token"]

    # Step 2: Access a protected resource to verify RLS and access control using JWT token
    protected_url = f"{BASE_URL}/api/protected/resource"
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Accept": "application/json"
    }
    try:
        protected_response = requests.get(protected_url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Protected resource request failed: {str(e)}"

    # Validate response status and presence of expected data (assuming 200 means access granted)
    assert protected_response.status_code == 200, f"Access control failed; expected 200 OK, got {protected_response.status_code}"

    try:
        protected_data = protected_response.json()
    except ValueError:
        assert False, "Protected resource response is not valid JSON"

    # Example validation: that the user-specific data is present (adjust keys as relevant)
    assert "user_id" in protected_data or "data" in protected_data, "Protected resource response missing expected fields"

    # Step 3: Test access with invalid token (should be denied)
    invalid_headers = {
        "Authorization": "Bearer invalidtoken123",
        "Accept": "application/json"
    }
    try:
        invalid_response = requests.get(protected_url, headers=invalid_headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Invalid token access request failed: {str(e)}"

    assert invalid_response.status_code in [401, 403], f"Expected 401 or 403 for invalid token, got {invalid_response.status_code}"

test_secure_authentication_and_access_control()