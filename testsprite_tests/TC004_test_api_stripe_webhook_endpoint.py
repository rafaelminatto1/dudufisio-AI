import requests
from requests.auth import HTTPBasicAuth

def test_api_stripe_webhook_endpoint():
    base_url = "http://localhost:3000"
    endpoint = f"{base_url}/api/stripe/webhook"
    auth = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
    headers = {
        "Content-Type": "application/json",
        "Stripe-Signature": "t=123456,v1=fake_signature"  # Example signature header, may be required for webhook validation
    }
    # Example payload mimicking a Stripe event webhook payload
    payload = {
        "id": "evt_test_webhook",
        "object": "event",
        "api_version": "2022-11-15",
        "created": 1700000000,
        "data": {
            "object": {
                "id": "pi_1ExAmple123456789",
                "object": "payment_intent",
                "amount": 2000,
                "currency": "usd",
                "status": "succeeded"
            }
        },
        "livemode": False,
        "pending_webhooks": 1,
        "request": {
            "id": "req_example",
            "idempotency_key": None
        },
        "type": "payment_intent.succeeded"
    }

    try:
        response = requests.post(endpoint, auth=auth, headers=headers, json=payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to Stripe webhook endpoint failed: {e}"

    # Validate HTTP status code
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"

    # Optionally check response content to verify proper processing
    try:
        resp_json = response.json()
    except Exception:
        resp_json = None

    # The webhook endpoint usually returns empty body or acknowledgment
    # Check if response is valid JSON or empty
    assert resp_json is None or isinstance(resp_json, dict), "Response is not valid JSON or empty"

test_api_stripe_webhook_endpoint()