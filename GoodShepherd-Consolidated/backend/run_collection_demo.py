"""
Script to demonstrate data collection.
Seeds the database with sample sources and runs the collector.
"""
import sys
import os
import logging
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.database import SessionLocal, init_db, engine
from backend.models.source import Source, SourceType, CollectionMethod
from backend.collectors.orchestrator import collector_orchestrator
from backend.models.raw_observation import RawObservation

# Configure logging to stdout
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def seed_demo_data(db):
    """Seed some demo sources if they don't exist."""
    sources = [
        Source(
            name="BBC World News",
            url="http://feeds.bbci.co.uk/news/world/rss.xml",
            source_type=SourceType.NEWS,
            allowed_collection_method=CollectionMethod.RSS,
            is_active=True
        ),
        Source(
            name="Al Jazeera",
            url="https://www.aljazeera.com/xml/rss/all.xml",
            source_type=SourceType.NEWS,
            allowed_collection_method=CollectionMethod.RSS,
            is_active=True
        ),
        Source(
            name="GDACS Integration", # Mock for scraping
            url="https://www.gdacs.org/",
            source_type=SourceType.OFFICIAL,
            allowed_collection_method=CollectionMethod.HEADLESS,
            is_active=True 
        )
    ]
    
    for source in sources:
        existing = db.query(Source).filter(Source.name == source.name).first()
        if not existing:
            db.add(source)
            logger.info(f"Added demo source: {source.name}")
    
    db.commit()

def main():
    logger.info("Initializing Database...")
    init_db()
    
    db = SessionLocal()
    try:
        logger.info("Seeding Demo Data...")
        seed_demo_data(db)
        
        logger.info("Starting Collection Run...")
        results = collector_orchestrator.collect_all_active()
        
        logger.info("\n=== Collection Results ===")
        for source, count in results.items():
            status = "✅ Success" if count >= 0 else "❌ Failed"
            count_str = f"{count} items" if count >= 0 else "Error"
            print(f"{status} | {source}: {count_str}")
            
        # Show a sample observation
        latest = db.query(RawObservation).order_by(RawObservation.collected_at.desc()).first()
        if latest:
            print("\n=== Latest Observation Sample ===")
            print(f"Title: {latest.title}")
            print(f"Source: {latest.source.name}")
            print(f"Time: {latest.collected_at}")
            print(f"Text Snippet: {latest.raw_text[:200]}...")
            
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
