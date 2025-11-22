import requests
from requests.auth import HTTPBasicAuth

def test_monitor_system_performance_and_uptime():
    base_url = "http://localhost:3000"
    auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
    headers = {
        "Accept": "application/json"
    }
    timeout = 30

    # Endpoint to check system health and performance metrics
    health_endpoint = f"{base_url}/api/monitoring/health"

    try:
        # Check overall health and related metrics
        resp_health = requests.get(health_endpoint, auth=auth, headers=headers, timeout=timeout)
        assert resp_health.status_code == 200, f"Health endpoint returned status {resp_health.status_code}"
        health_data = resp_health.json()

        # Validate uptime
        uptime_value = health_data.get("uptime")
        assert uptime_value is not None, "Uptime value missing from health response"
        assert isinstance(uptime_value, (float, int)), "Uptime value is not numeric"
        assert uptime_value >= 99.9, f"Uptime is below expected threshold: {uptime_value}%"

        # Validate performance
        page_load_time = health_data.get("pageLoadTime")
        assert page_load_time is not None, "Page load time missing from health response"
        assert isinstance(page_load_time, (float, int)), "Page load time is not numeric"
        assert page_load_time < 2.0, f"Page load time exceeds threshold: {page_load_time}s"

        # Validate overall health status
        health_status = health_data.get("status") or health_data.get("health")
        assert health_status is not None, "Health status missing from response"
        assert str(health_status).lower() in ["healthy", "ok", "up"], f"Unexpected health status: {health_status}"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_monitor_system_performance_and_uptime()
