import requests

BASE_URL = "http://localhost:3000"
USERNAME = "cursor@moocafisio.com.br"
PASSWORD = "256256"
TIMEOUT = 30


def test_backup_and_recovery_processes():
    headers = {"Accept": "application/json"}

    # Obtain JWT token by login
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": USERNAME,
        "password": PASSWORD
    }

    try:
        login_response = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status code {login_response.status_code}"
        token = login_response.json().get("token")
        assert token, "Login response missing token"

        auth_headers = {
            **headers,
            "Authorization": f"Bearer {token}"
        }

        backup_url = f"{BASE_URL}/api/cron/backup-database"

        # Check backup status with GET
        status_response = requests.get(backup_url, headers=auth_headers, timeout=TIMEOUT)
        assert status_response.status_code == 200, f"Expected 200 on backup status check, got {status_response.status_code}"
        status_json = status_response.json()
        assert "lastBackupTime" in status_json or "backupStatus" in status_json, "Backup status response missing expected keys"

        if "backupStatus" in status_json:
            assert status_json["backupStatus"].lower() in ("success", "completed"), f"Backup status not successful: {status_json['backupStatus']}"
        if "lastBackupTime" in status_json:
            assert status_json["lastBackupTime"], "Last backup time should not be empty"

    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"


test_backup_and_recovery_processes()