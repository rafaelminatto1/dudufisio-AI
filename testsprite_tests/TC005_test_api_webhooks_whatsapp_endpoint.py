import requests
from requests.auth import HTTPBasicAuth

def test_api_webhooks_whatsapp_endpoint():
    base_url = "http://localhost:3000"
    endpoint = "/api/webhooks/whatsapp"
    url = base_url + endpoint
    auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Example payload simulating an incoming WhatsApp message webhook
    payload = {
        "object": "whatsapp_business_account",
        "contacts": [
            {
                "profile": {"name": "User Test"},
                "wa_id": "5511999999999"
            }
        ],
        "messages": [
            {
                "from": "5511999999999",
                "id": "wamid.HBgMNTU1MTk5OTk5OTk5FQIAERgSERA=",
                "timestamp": 1711137853,
                "text": {"body": "Olá, esse é um teste."},
                "type": "text"
            }
        ],
        "metadata": {
            "display_phone_number": "+5511999999999",
            "phone_number_id": "1234567890"
        }
    }

    timeout_seconds = 30

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            auth=auth,
            timeout=timeout_seconds
        )
    except requests.exceptions.RequestException as e:
        assert False, f"Request to WhatsApp webhook endpoint failed: {e}"

    # Assert HTTP status code is 200 OK for successful processing
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Response should be JSON, check content type header
    content_type = response.headers.get("Content-Type", "")
    assert "application/json" in content_type, f"Expected 'application/json' content type, got '{content_type}'"

    try:
        json_resp = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    # Validate response structure expecting at least 'success' boolean or similar
    # Since PRD has no exact schema, check for common keys or status
    # We'll accept either a dict with "success": true or a simple acknowledgement
    if isinstance(json_resp, dict):
        # If there is a success key, it should be True
        if "success" in json_resp:
            assert json_resp["success"] is True, "Webhook response success field is not True"
        # Or check for an 'error' key to fail if exists
        assert "error" not in json_resp, f"Error found in response: {json_resp.get('error')}"
    else:
        # Response JSON is not a dict - fail
        assert False, "Webhook response JSON should be a dictionary"

test_api_webhooks_whatsapp_endpoint()
