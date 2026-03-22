import pytest

@pytest.fixture(scope="session")
def base_url():
    return "http://localhost:5173"

@pytest.fixture(scope="session")
def server_url():
    return "http://localhost:3002"
