from fastapi.testclient import TestClient
from app.main import app  # Assuming your FastAPI app is in app.main

client = TestClient(app)

def test_valid_rto_code():
    response = client.get("/rto/?rto_code=MH19")
    assert response.status_code == 200
    assert "data" in response.json()

def test_invalid_rto_code_format():
    response = client.get("/rto/?rto_code=123AB")
    assert response.status_code == 422  # Validation error
    assert response.json() == {"detail": [{"msg": "RTO code must follow the format: two letters followed by two digits (e.g., 'MH19').", "type": "value_error"}]}

def test_no_rto_code():
    response = client.get("/rto/")
    assert response.status_code == 404
    assert response.json() == {"detail": "Please provide valid rto code"}

def test_no_matching_data():
    response = client.get("/rto/?rto_code=XX99")
    assert response.status_code == 404
    assert response.json() == {"detail": "No matching RTO data found"}

def test_database_error():
    # Simulate a database error (this depends on your database setup and may require mocking)
    response = client.get("/rto/?rto_code=MH19")
    assert response.status_code == 500
    assert "Internal Server Error" in response.json()["detail"]

def test_empty_database():
    # If your database is empty, ensure the code raises the "No matching RTO data found" error
    response = client.get("/rto/?rto_code=MH19")
    assert response.status_code == 404
    assert response.json() == {"detail": "No matching RTO data found"}
