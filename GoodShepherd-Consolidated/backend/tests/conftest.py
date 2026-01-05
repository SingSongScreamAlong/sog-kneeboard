import pytest
from backend.core.database import Base, engine, SessionLocal

# Import all models to ensure they are registered with Base.metadata
from backend.models.user import User, Organization
from backend.models.event import Event
from backend.models.feedback import EventFeedback
from backend.models.dossier import Dossier, Watchlist
from backend.models.audit import AuditLog
# Add other models as needed

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Create a clean test database.
    Drops all tables and recreates them before running tests.
    """
    # Drop all tables to ensure clean slate
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    # Create all tables
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Optional: cleanup
    # Base.metadata.drop_all(bind=engine)
