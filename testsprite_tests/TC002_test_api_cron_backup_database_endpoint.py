import requests
from requests.auth import HTTPBasicAuth

def test_api_cron_backup_database_endpoint():
    base_url = "http://localhost:3000"
    endpoint = "/api/cron/backup-database"
    url = base_url + endpoint

    auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.post(url, headers=headers, auth=auth, timeout=30)
        # Assert status code 200 or 201 for success backup trigger
        assert response.status_code in (200, 201), f"Unexpected status code: {response.status_code}"

        json_response = response.json()

        # Validate response content indicates backup was triggered
        # Expected structure is not given, so we validate presence of common backup info keys
        assert isinstance(json_response, dict), "Response is not a JSON object"
        assert "backupId" in json_response or "message" in json_response, "Response missing backup confirmation keys"
        if "message" in json_response:
            assert "backup" in json_response["message"].lower(), "Backup confirmation message not found"
        if "backupId" in json_response:
            assert isinstance(json_response["backupId"], str) and len(json_response["backupId"]) > 0, "Invalid backupId"

    except requests.Timeout:
        assert False, "Request timed out"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"


test_api_cron_backup_database_endpoint()