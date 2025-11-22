import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")


def test_automated_reminder_sending_via_multiple_channels():
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Example payload to trigger reminder/confirmation sending
    # Assuming the API accepts appointment_id, patient contact data and channels to send reminder
    # The actual API endpoints and payload structure are not explicitly given in the PRD,
    # so we assume a plausible API: POST /api/communications/reminders
    # with body specifying channels ['whatsapp', 'sms', 'email'], appointment details, and webhook callback URL.

    reminder_payload = {
        "appointment": {
            "id": None,  # We'll create an appointment first
            "datetime": "2025-12-01T15:00:00-03:00",
            "patient": {
                "name": "Test Patient",
                "phone": "+5511999999999",
                "email": "test.patient@example.com",
                "whatsapp": "+5511999999999"
            }
        },
        "channels": ["whatsapp", "sms", "email"],
        "message": "This is a test reminder confirmation.",
        "webhook_url": f"{BASE_URL}/api/webhooks/confirmation",  # Assuming webhook endpoint
    }

    appointment_id = None

    # Step 1: Create an appointment to use for the reminder
    try:
        # Create appointment endpoint (assumed)
        create_appointment_url = f"{BASE_URL}/api/appointments"
        appointment_data = {
            "patient_name": "Test Patient",
            "patient_phone": "+5511999999999",
            "patient_email": "test.patient@example.com",
            "datetime": "2025-12-01T15:00:00-03:00",
            "notes": "Automated reminder test appointment"
        }
        resp_create = requests.post(
            create_appointment_url,
            json=appointment_data,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert resp_create.status_code == 201, f"Failed to create appointment: {resp_create.text}"
        appointment = resp_create.json()
        assert "id" in appointment, "Created appointment missing id"
        appointment_id = appointment["id"]

        # Update payload with created appointment id
        reminder_payload["appointment"]["id"] = appointment_id

        # Step 2: Trigger sending reminders via multiple channels
        send_reminder_url = f"{BASE_URL}/api/communications/reminders"
        resp_reminder = requests.post(
            send_reminder_url,
            json=reminder_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert resp_reminder.status_code == 200, f"Reminder sending failed: {resp_reminder.text}"
        confirmation_resp = resp_reminder.json()

        # Check expected keys in response (assuming)
        expected_keys = {"status", "channels_sent", "webhook_accepted"}
        assert expected_keys.issubset(confirmation_resp.keys()), "Response missing expected keys"
        assert confirmation_resp["status"] == "success", "Reminder sending status not success"
        channels_sent = confirmation_resp.get("channels_sent", [])
        for channel in ["whatsapp", "sms", "email"]:
            assert channel in channels_sent, f"Channel {channel} not confirmed as sent"

        # Step 3: Simulate webhook callback handling
        # Assuming test environment has an endpoint to receive webhook, we simulate a webhook POST
        webhook_url = reminder_payload["webhook_url"]
        webhook_payload = {
            "appointment_id": appointment_id,
            "status": "delivered",
            "channel": "whatsapp",
            "timestamp": "2025-12-01T14:00:00-03:00"
        }
        resp_webhook = requests.post(
            webhook_url,
            json=webhook_payload,
            headers=headers,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        assert resp_webhook.status_code in (200, 204), f"Webhook handling failed: {resp_webhook.text}"

    finally:
        # Cleanup: Delete the created appointment
        if appointment_id:
            delete_url = f"{BASE_URL}/api/appointments/{appointment_id}"
            try:
                resp_del = requests.delete(delete_url, auth=AUTH, timeout=TIMEOUT)
                assert resp_del.status_code in (200, 204), f"Failed to delete appointment: {resp_del.text}"
            except Exception:
                pass


test_automated_reminder_sending_via_multiple_channels()