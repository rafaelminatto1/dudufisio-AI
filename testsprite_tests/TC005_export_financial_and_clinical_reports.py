import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
TIMEOUT = 30

def test_export_financial_and_clinical_reports():
    endpoints = [
        ("/api/reports/financial/pdf", "application/pdf"),
        ("/api/reports/financial/excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        ("/api/reports/clinical/pdf", "application/pdf"),
        ("/api/reports/clinical/excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ]

    for path, expected_content_type in endpoints:
        url = BASE_URL + path
        try:
            response = requests.get(url, auth=AUTH, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request to {url} failed: {e}"

        # Validate HTTP status code
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code} for {url}"

        # Validate Content-Type header
        content_type = response.headers.get("Content-Type", "")
        assert expected_content_type in content_type, f"Expected Content-Type to include '{expected_content_type}' but got '{content_type}' for {url}"

        # Basic content validation: response should not be empty
        assert response.content and len(response.content) > 100, f"Response content too small or empty for {url}"

test_export_financial_and_clinical_reports()
