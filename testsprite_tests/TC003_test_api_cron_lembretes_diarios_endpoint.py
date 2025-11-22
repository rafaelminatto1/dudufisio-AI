import requests

def test_api_cron_lembretes_diarios_endpoint():
    base_url = "http://localhost:3000"
    endpoint = "/api/cron/lembretes-diarios"
    url = base_url + endpoint

    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=30)
        # The endpoint triggers daily reminders; expect 200 OK and proper JSON response confirming execution
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        content_type = response.headers.get("Content-Type", "")
        assert "application/json" in content_type, f"Expected JSON response but got {content_type}"
        json_data = response.json()
        # Validate json_data to confirm reminders were sent
        # Since PRD doesn't specify exact response schema, check keys relevant to reminders
        assert isinstance(json_data, dict), "Response JSON should be a dictionary"
        # Example keys that might be included: "remindersSent", "errors", "message", "timestamp"
        assert "remindersSent" in json_data or "message" in json_data, "Response missing expected confirmation fields"
        if "errors" in json_data:
            assert not json_data["errors"], f"Errors reported in response: {json_data['errors']}"

    except requests.exceptions.RequestException as e:
        assert False, f"Request to reminders endpoint failed with exception: {e}"

    except ValueError:
        assert False, "Response is not a valid JSON"


test_api_cron_lembretes_diarios_endpoint()
