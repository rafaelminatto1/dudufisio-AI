import requests
import time

from mock_backend import start_mock_server, stop_mock_server


def main() -> None:
    server = start_mock_server()
    try:
        time.sleep(0.5)
        resp = requests.get(
            "http://localhost:5175/api/patients",
            auth=("admin@dudufisio.com", "demo123456"),
        )
        print("GET /api/patients ->", resp.status_code)
        print(resp.headers.get("Content-Type"))
        print(resp.json())

        resp2 = requests.post(
            "http://localhost:5175/api/patients",
            json={
                "name": "X",
                "email": "x@example.com",
                "phone": "1",
                "birthDate": "2000-01-01",
                "medicalHistory": [],
            },
            auth=("admin@dudufisio.com", "demo123456"),
        )
        print("POST /api/patients ->", resp2.status_code)
        print(resp2.headers.get("Content-Type"))
        print(resp2.json())
    finally:
        stop_mock_server(server)


if __name__ == "__main__":
    main()



