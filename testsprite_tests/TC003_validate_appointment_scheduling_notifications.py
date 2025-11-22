import requests
from requests.auth import HTTPBasicAuth
import time
from datetime import datetime, timezone

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("cursor@moocafisio.com.br", "256256")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def validate_appointment_scheduling_notifications():
    appointment_data = {}

    created_appointment_id = None
    created_patient_id = None
    created_therapist_id = None

    try:
        # 1. Create a patient to use for the appointment
        patient_payload = {
            "name": "Test Patient",
            "cpf": "12345678909",
            "email": "test.patient@example.com",
            "phone": "+5511999999999"
        }
        patient_resp = requests.post(
            f"{BASE_URL}/api/patients",
            json=patient_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert patient_resp.status_code == 201, f"Failed to create patient: {patient_resp.text}"
        created_patient_id = patient_resp.json().get("id")
        assert created_patient_id is not None, "Patient ID not returned"

        # 2. Create a therapist to use for the appointment
        therapist_payload = {
            "name": "Test Therapist",
            "email": "therapist@example.com",
            "phone": "+5511988888888",
            "professionalRegistration": "123456789"
        }
        therapist_resp = requests.post(
            f"{BASE_URL}/api/therapists",
            json=therapist_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert therapist_resp.status_code == 201, f"Failed to create therapist: {therapist_resp.text}"
        created_therapist_id = therapist_resp.json().get("id")
        assert created_therapist_id is not None, "Therapist ID not returned"

        # 3. Prepare appointment data
        # Schedule appointment 1 minute in the future to trigger notifications after booking
        future_timestamp = int(time.time()) + 60
        # Assuming API expects ISO8601 datetime string in UTC, convert timestamp
        dt = datetime.fromtimestamp(future_timestamp, timezone.utc).isoformat()

        appointment_data = {
            "patientId": created_patient_id,
            "therapistId": created_therapist_id,
            "datetime": dt,
            "service": "physiotherapy session",
            "notes": "Test appointment booking to verify notifications"
        }

        # 4. Book an appointment
        appointment_resp = requests.post(
            f"{BASE_URL}/api/appointments",
            json=appointment_data,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert appointment_resp.status_code == 201, f"Failed to create appointment: {appointment_resp.text}"
        created_appointment_id = appointment_resp.json().get("id")
        assert created_appointment_id is not None, "Appointment ID not returned"

        # 5. Verify response confirms automatic confirmation and notifications
        confirmation = appointment_resp.json().get("confirmation")
        notifications = appointment_resp.json().get("notifications")
        assert confirmation is True or confirmation == "scheduled" or confirmation == "confirmed", "Appointment not confirmed automatically"
        assert notifications is not None, "Notifications info missing in response"
        # Expect notifications field to have channels: whatsapp, sms, email and their statuses
        expected_channels = {"whatsapp", "sms", "email"}
        channels = set(notifications.keys())
        assert expected_channels.issubset(channels), f"Not all notification channels present: {channels}"

        for channel in expected_channels:
            status = notifications.get(channel)
            assert status in ("sent", "queued", "scheduled"), f"Notification via {channel} not sent or scheduled, status: {status}"

        # Optional: If API supports querying notification status or receiving webhook events,
        # this test could poll/status-check or mock that. Here we check immediate response only.

    finally:
        # Cleanup created resources to keep test idempotent
        if created_appointment_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/appointments/{created_appointment_id}",
                    auth=AUTH,
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

        if created_patient_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/patients/{created_patient_id}",
                    auth=AUTH,
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

        if created_therapist_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/therapists/{created_therapist_id}",
                    auth=AUTH,
                    headers=HEADERS,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

validate_appointment_scheduling_notifications()
