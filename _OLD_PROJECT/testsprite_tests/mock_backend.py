import base64
import json
import threading
import uuid
from copy import deepcopy
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Dict, Optional
from urllib.parse import parse_qs, urlparse

HOST = "127.0.0.1"
PORT = 5175

VALID_EMAIL = "admin@dudufisio.com"
VALID_PASSWORD = "demo123456"


def _generate_id() -> str:
    return str(uuid.uuid4())


class InMemoryDatabase:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.patients: Dict[str, Dict[str, Any]] = {}
        self.appointments: Dict[str, Dict[str, Any]] = {}
        self.medical_records = [
            {
                "id": _generate_id(),
                "patientId": None,
                "title": "Avaliação Inicial",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "summary": "Paciente com boa evolução clínica."
            },
            {
                "id": _generate_id(),
                "patientId": None,
                "title": "Sessão de Reavaliação",
                "createdAt": datetime.utcnow().isoformat() + "Z",
                "summary": "Melhora significativa de amplitude de movimento."
            },
        ]
        self.exercises = [
            {
                "id": _generate_id(),
                "name": "Agachamento Assistido",
                "category": "strength",
                "specialty": "orthopedic",
                "description": "Exercício de fortalecimento guiado.",
            },
            {
                "id": _generate_id(),
                "name": "Alongamento de Flexores",
                "category": "flexibility",
                "specialty": "rehab",
                "description": "Alongamento estático de flexores do quadril.",
            },
        ]
        self.pain_points = []

        # Seed paciente e agendamento padrão para garantir estrutura básica
        initial_patient_id = _generate_id()
        self.patients[initial_patient_id] = {
            "id": initial_patient_id,
            "name": "Paciente Exemplo",
            "email": "paciente.exemplo@dudufisio.com",
            "phone": "+5511988887777",
            "birthDate": "1988-03-12",
            "medicalHistory": ["Dor lombar crônica"],
        }

        appointment_id = _generate_id()
        now = datetime.utcnow()
        self.appointments[appointment_id] = {
            "id": appointment_id,
            "patientId": initial_patient_id,
            "startTime": now.isoformat() + "Z",
            "endTime": (now.replace(minute=(now.minute + 30) % 60)).isoformat() + "Z",
            "notes": "Sessão inicial de avaliação.",
            "description": "Sessão marcada automaticamente.",
        }


DB = InMemoryDatabase()


class MockRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: Any) -> None:
        # Suprime logs no console para manter saída limpa
        return

    def _require_auth(self) -> bool:
        if self.path.startswith("/api/auth/login"):
            return True

        header = self.headers.get("Authorization")
        if not header or not header.startswith("Basic "):
            self._send_json({"error": "Unauthorized"}, status=401, extra_headers={"WWW-Authenticate": 'Basic realm="Testsprite"'})
            return False

        try:
            decoded = base64.b64decode(header.split(" ", 1)[1]).decode("utf-8")
            email, password = decoded.split(":", 1)
        except Exception:
            self._send_json({"error": "Invalid authorization header"}, status=401)
            return False

        if email != VALID_EMAIL or password != VALID_PASSWORD:
            self._send_json({"error": "Invalid credentials"}, status=401)
            return False

        return True

    def _read_json_body(self) -> Dict[str, Any]:
        length = int(self.headers.get("Content-Length") or 0)
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON body"}, status=400)
            raise

    def _send_json(self, payload: Any, status: int = 200, extra_headers: Optional[Dict[str, str]] = None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def _send_no_content(self, status: int = 204) -> None:
        self.send_response(status)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        if not self._require_auth():
            return

        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/patients":
            patients = [deepcopy(p) for p in DB.patients.values()]
            self._send_json(patients)
            return

        if path.startswith("/api/patients/"):
            patient_id = path.split("/")[-1]
            patient = DB.patients.get(patient_id)
            if not patient:
                self._send_json({"error": "Patient not found"}, status=404)
                return
            self._send_json(deepcopy(patient))
            return

        if path == "/api/appointments":
            params = parse_qs(parsed.query)
            appointments = list(DB.appointments.values())
            # Filtro simples por startDate/endDate se fornecidos
            start_date = params.get("startDate", [None])[0]
            end_date = params.get("endDate", [None])[0]
            if start_date or end_date:
                filtered = []
                for appt in appointments:
                    appt_time = appt.get("startTime") or appt.get("startDate")
                    if not appt_time:
                        continue
                    appt_date = appt_time[:10]
                    if start_date and appt_date < start_date:
                        continue
                    if end_date and appt_date > end_date:
                        continue
                    filtered.append(appt)
                appointments = filtered
            self._send_json([deepcopy(a) for a in appointments])
            return

        if path == "/api/medical-records":
            self._send_json(deepcopy(DB.medical_records))
            return

        if path == "/api/exercises":
            params = parse_qs(parsed.query)
            exercises = DB.exercises
            category = params.get("category", [None])[0]
            specialty = params.get("specialty", [None])[0]
            if category:
                exercises = [ex for ex in exercises if ex.get("category") == category]
            if specialty:
                exercises = [ex for ex in exercises if ex.get("specialty") == specialty]
            self._send_json(deepcopy(exercises))
            return

        self._send_json({"error": "Not Found"}, status=404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/auth/login":
            data = self._read_json_body()
            email = data.get("email")
            password = data.get("password")
            if email == VALID_EMAIL and password == VALID_PASSWORD:
                response = {
                    "token": "mock-jwt-token",
                    "user": {
                        "id": "admin-user-id",
                        "email": email,
                        "name": "Administrador DuduFisio"
                    }
                }
                self._send_json(response, status=200)
            else:
                self._send_json({"error": "Invalid credentials"}, status=401)
            return

        if not self._require_auth():
            return

        if path == "/api/patients":
            data = self._read_json_body()
            patient_id = _generate_id()
            patient = {
                "id": patient_id,
                "name": data.get("name", ""),
                "email": data.get("email", ""),
                "phone": data.get("phone", ""),
                "birthDate": data.get("birthDate", ""),
                "medicalHistory": data.get("medicalHistory", []) or [],
            }
            DB.patients[patient_id] = patient
            headers = {"Location": f"/api/patients/{patient_id}"}
            self._send_json(patient, status=201, extra_headers=headers)
            return

        if path == "/api/appointments":
            data = self._read_json_body()
            patient_id = data.get("patientId")
            if not patient_id or patient_id not in DB.patients:
                self._send_json({"error": "Invalid or missing patientId"}, status=400)
                return
            appointment_id = _generate_id()
            appointment = {
                "id": appointment_id,
                "patientId": patient_id,
                "startTime": data.get("startTime"),
                "endTime": data.get("endTime"),
                "notes": data.get("notes", ""),
            }
            DB.appointments[appointment_id] = appointment
            headers = {"Location": f"/api/appointments/{appointment_id}"}
            self._send_json(appointment, status=201, extra_headers=headers)
            return

        if path == "/api/ai/generate-report":
            data = self._read_json_body()
            patient_id = data.get("patientId")
            notes = data.get("data", {}).get("notes", "")
            report = f"Relatório clínico para paciente {patient_id or 'desconhecido'}: {notes}"
            self._send_json({"report": report}, status=200)
            return

        if path == "/api/body-map/pain-points":
            data = self._read_json_body()
            patient_id = data.get("patientId")
            if not patient_id or patient_id not in DB.patients:
                self._send_json({"error": "Invalid patientId"}, status=400)
                return
            pain_point = {
                "id": _generate_id(),
                "patientId": patient_id,
                "x": data.get("x"),
                "y": data.get("y"),
                "intensity": data.get("intensity"),
                "description": data.get("description", ""),
            }
            DB.pain_points.append(pain_point)
            self._send_json(pain_point, status=201)
            return

        self._send_json({"error": "Not Found"}, status=404)

    def do_DELETE(self) -> None:
        if not self._require_auth():
            return

        path = urlparse(self.path).path

        if path.startswith("/api/patients/"):
            patient_id = path.split("/")[-1]
            if DB.patients.pop(patient_id, None) is not None:
                # remove related appointments and pain points
                DB.appointments = {k: v for k, v in DB.appointments.items() if v.get("patientId") != patient_id}
                DB.pain_points = [pp for pp in DB.pain_points if pp.get("patientId") != patient_id]
                self._send_no_content()
            else:
                self._send_json({"error": "Patient not found"}, status=404)
            return

        if path.startswith("/api/appointments/"):
            appointment_id = path.split("/")[-1]
            if DB.appointments.pop(appointment_id, None) is not None:
                self._send_no_content()
            else:
                self._send_json({"error": "Appointment not found"}, status=404)
            return

        self._send_json({"error": "Not Found"}, status=404)


def start_mock_server() -> HTTPServer:
    server = HTTPServer((HOST, PORT), MockRequestHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def stop_mock_server(server: HTTPServer) -> None:
    if server:
        server.shutdown()
        server.server_close()



