"""
Scraping Collector for dynamic websites.
Uses WebScraper service to fetch content.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime

from backend.core.logging import get_logger
from backend.models.source import Source, SourceType, CollectionMethod
from backend.models.raw_observation import RawObservation
from backend.collectors.collector_base import CollectorBase
from backend.services.web_scraper import scraper_service

logger = get_logger(__name__)


class ScrapingCollector(CollectorBase):
    """Collector for scraping dynamic websites."""
    
    def __init__(self):
        super().__init__(collection_method=CollectionMethod.HEADLESS)
    
    def collect(self, source: Source) -> List[RawObservation]:
        """
        Collect data from a dynamic web source.
        
        Args:
            source: Source to scrape
            
        Returns:
            List of new observations
        """
        if not self.validate_source(source):
            logger.warning(f"Invalid source for scraping: {source.name}")
            return []
            
        logger.info(f"Scraping source: {source.name}", url=source.url)
        
        # Perform scrape (Synchronous call)
        data = scraper_service.scrape_page(source.url)
        
        if not data:
            logger.warning(f"No data scraped from {source.url}")
            return []
            
        # Create observation from page content
        # Check uniqueness hash logic (basic content hash)
        content_hash = self._generate_hash(data['text'])
        
        # In a real implementations, we might parse lists of articles from the page.
        # For this base implementation, we treat the page as one observation.
        
        observation = RawObservation(
            source_id=source.id,
            content_hash=content_hash,
            title=data['title'],
            raw_text=data['text'],
            url=source.url,
            collected_at=datetime.utcnow(),
            metadata={
                "scraped": True,
                "html_length": len(data['html'])
            }
        )
        
        return [observation]

    def validate_source(self, source: Source) -> bool:
        """Validate source is suitable for scraping."""
        return (
            source.url is not None and 
            source.allowed_collection_method == CollectionMethod.HEADLESS
        )
