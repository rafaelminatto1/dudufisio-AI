import requests

base_url = "http://localhost:5174"
timeout = 30

def test_user_login_endpoint_should_authenticate_user_successfully():
    url = f"{base_url}/api/auth/login"
    headers = {
        "Content-Type": "application/json"
    }
    # Use credentials from instructions (admin@dudufisio.com / demo123456)
    payload = {
        "email": "admin@dudufisio.com",
        "password": "demo123456"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Validate status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Validate response content
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check 'user' and 'token' keys exist in response data
    assert "user" in data, "'user' key missing in response"
    assert isinstance(data["user"], dict), "'user' should be an object"

    assert "token" in data, "'token' key missing in response"
    assert isinstance(data["token"], str), "'token' should be a string"

    # Further validate user details contain at least 'email' matching input
    user = data["user"]
    assert "email" in user, "'email' missing in user details"
    assert user["email"].lower() == payload["email"].lower(), "Returned user email does not match login email"

test_user_login_endpoint_should_authenticate_user_successfully()