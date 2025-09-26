import requests
from requests.auth import HTTPBasicAuth

def test_get_exercises_filtered():
    base_url = "http://localhost:5174"
    endpoint = "/api/exercises"
    url = base_url + endpoint

    auth = HTTPBasicAuth("admin@dudufisio.com", "demo123456")
    headers = {
        "Accept": "application/json"
    }

    # Example filters for category and specialty - these can be adjusted as needed
    params = {
        "category": "strength",
        "specialty": "orthopedic"
    }

    try:
        response = requests.get(url, headers=headers, params=params, auth=auth, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        exercises = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(exercises, list), "Response JSON is not a list"

    # If the list is not empty, verify each exercise contains expected keys
    # According to PRD, each exercise should comply with Exercise schema, assumed to have properties category and specialty
    for exercise in exercises:
        assert isinstance(exercise, dict), "Exercise item is not a JSON object"
        # Verify category filter is respected if category is present in exercise
        if "category" in exercise:
            assert exercise["category"] == params["category"], f"Exercise category {exercise.get('category')} does not match filter {params['category']}"
        # Verify specialty filter is respected if specialty is present
        if "specialty" in exercise:
            assert exercise["specialty"] == params["specialty"], f"Exercise specialty {exercise.get('specialty')} does not match filter {params['specialty']}"

test_get_exercises_filtered()