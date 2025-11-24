import requests
from requests.auth import HTTPBasicAuth

base_url = "http://localhost:3000"
auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
headers = {"Content-Type": "application/json"}
timeout = 30

def test_verify_patient_registration_validation():
    endpoint = f"{base_url}/api/patients"

    invalid_payloads = [
        # Invalid CPF (too short)
        {
            "name": "Test Patient",
            "cpf": "1234567890",
            "email": "valid.email@example.com",
            "phone": "+5511999999999"
        },
        # Invalid CPF (invalid characters)
        {
            "name": "Test Patient",
            "cpf": "abc.def.ghi-jk",
            "email": "valid.email@example.com",
            "phone": "+5511999999999"
        },
        # Invalid email (missing @)
        {
            "name": "Test Patient",
            "cpf": "12345678909",
            "email": "invalid.email.com",
            "phone": "+5511999999999"
        },
        # Invalid email (invalid domain)
        {
            "name": "Test Patient",
            "cpf": "12345678909",
            "email": "invalid@com",
            "phone": "+5511999999999"
        },
        # Invalid phone number (missing country code)
        {
            "name": "Test Patient",
            "cpf": "12345678909",
            "email": "valid.email@example.com",
            "phone": "11999999999"
        },
        # Invalid phone number (letters included)
        {
            "name": "Test Patient",
            "cpf": "12345678909",
            "email": "valid.email@example.com",
            "phone": "+55abc99999999"
        }
    ]

    valid_payload = {
        "name": "Valid Patient",
        "cpf": "12345678909",  # Assuming format without mask, valid length and digits
        "email": "valid.patient@example.com",
        "phone": "+5511999999999"
    }

    # Test invalid payloads to assert validation errors
    for payload in invalid_payloads:
        try:
            response = requests.post(endpoint, auth=auth, headers=headers, json=payload, timeout=timeout)
            assert response.status_code == 400 or response.status_code == 422, f"Expected validation error status but got {response.status_code} for payload: {payload}"
            # Optionally check error message in response
            json_resp = response.json()
            assert "error" in json_resp or "message" in json_resp, f"Expected error message in response for payload: {payload}"
        except requests.RequestException as e:
            assert False, f"Request failed unexpectedly: {e}"

    # Test valid payload to assert successful creation
    created_patient_id = None
    try:
        response = requests.post(endpoint, auth=auth, headers=headers, json=valid_payload, timeout=timeout)
        assert response.status_code == 201, f"Expected 201 Created but got {response.status_code}"
        json_resp = response.json()
        assert "id" in json_resp, "Response JSON should contain 'id' for the created patient"
        created_patient_id = json_resp["id"]
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"
    finally:
        # Cleanup: delete created patient if creation succeeded
        if created_patient_id:
            try:
                del_response = requests.delete(f"{endpoint}/{created_patient_id}", auth=auth, timeout=timeout)
                assert del_response.status_code == 204 or del_response.status_code == 200, f"Failed to delete created patient. Status: {del_response.status_code}"
            except requests.RequestException as e:
                pass  # Do not fail test if cleanup fails

test_verify_patient_registration_validation()