import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5174"
AUTH = HTTPBasicAuth('admin@dudufisio.com', 'demo123456')
TIMEOUT = 30

def test_create_new_appointment():
    # Sample payload for creating an appointment
    # Appointment schema details are limited; assuming minimal required fields
    # We'll create a patient first to have a valid patientId for the appointment

    # Step 1: Create a patient to link appointment
    patient_payload = {
        "name": "Test Patient for Appointment",
        "email": "test.patient.appointment@example.com",
        "phone": "+5511999999999",
        "birthDate": "1990-01-01",
        "medicalHistory": []
    }
    patient_id = None
    appointment_id = None
    headers = {
        "Content-Type": "application/json"
    }

    try:
        patient_response = requests.post(
            f"{BASE_URL}/api/patients",
            json=patient_payload,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        assert patient_response.status_code == 201, f"Failed to create patient, status code: {patient_response.status_code}"
        # Try to get patient ID from location header or response body
        if 'location' in patient_response.headers:
            location = patient_response.headers['location']
            patient_id = location.split('/')[-1]
        else:
            # If no location header, try to get returned patient JSON with id
            try:
                patient_json = patient_response.json()
                patient_id = patient_json.get('id')
            except Exception:
                patient_id = None

        assert patient_id is not None, "Patient ID not found after creation."

        # Step 2: Create appointment linked to the created patient
        # Assuming the appointment schema minimally includes patientId, date, time, and therapistId (if required)
        # As full schema is not available, we'll use typical fields
        # Use a datetime in the future for the appointment

        import datetime
        from datetime import timedelta

        start_datetime = (datetime.datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        end_datetime = start_datetime + timedelta(minutes=30)

        appointment_payload = {
            "patientId": patient_id,
            "startTime": start_datetime.isoformat(),
            "endTime": end_datetime.isoformat(),
            "notes": "Test appointment creation",
            # adding dummy therapistId if needed - since schema unclear we leave it out or add a placeholder
            # "therapistId": "therapist-1234"
        }

        appointment_response = requests.post(
            f"{BASE_URL}/api/appointments",
            json=appointment_payload,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        assert appointment_response.status_code == 201, f"Appointment creation failed with status {appointment_response.status_code}"

        # Possibly get appointment ID from location header or response body for cleanup
        if 'location' in appointment_response.headers:
            location = appointment_response.headers['location']
            appointment_id = location.split('/')[-1]
        else:
            try:
                appointment_json = appointment_response.json()
                appointment_id = appointment_json.get('id')
            except Exception:
                appointment_id = None

    finally:
        # Cleanup created appointment if possible
        if appointment_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/appointments/{appointment_id}",
                    auth=AUTH,
                    timeout=TIMEOUT
                )
            except Exception:
                pass
        # Cleanup created patient
        if patient_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/patients/{patient_id}",
                    auth=AUTH,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_create_new_appointment()