"""
Web Scraper service using Playwright (Synchronous).
Handles headless browser automation for dynamic content collection.
"""
from typing import Optional, Dict, Any, List
from playwright.sync_api import sync_playwright, Browser, Page, Playwright

from backend.core.config import settings
from backend.core.logging import get_logger

logger = get_logger(__name__)


class WebScraper:
    """Headless browser scraper service (Synchronous)."""

    def __init__(self):
        """Initialize scraper."""
        self.enabled = settings.enable_browser_scraping
        self.browser: Optional[Browser] = None
        self.playwright: Optional[Playwright] = None

    def start(self):
        """Start the browser instance."""
        if not self.enabled:
            return

        try:
            self.playwright = sync_playwright().start()
            self.browser = self.playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            logger.info("Headless browser started")
        except Exception as e:
            logger.error("Failed to start headless browser", error=str(e))
            self.enabled = False

    def stop(self):
        """Stop the browser instance."""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        logger.info("Headless browser stopped")

    def scrape_page(
        self,
        url: str,
        wait_selector: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Scrape a webpage.
        
        Args:
            url: URL to scrape
            wait_selector: Optional CSS selector to wait for (to ensure dynamic load)
            
        Returns:
            Dictionary with title, text, and html content
        """
        if not self.enabled or not self.browser:
            self.start()
            if not self.enabled:
                return None

        page: Optional[Page] = None
        try:
            # Create context with standard user agent
            context = self.browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            # Navigate with timeout
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            if wait_selector:
                page.wait_for_selector(wait_selector, timeout=10000)
            else:
                # Wait a bit for JS execution
                page.wait_for_timeout(2000)

            # Extract content
            title = page.title()
            content = page.content()
            
            # Get visible text
            text = page.evaluate("() => document.body.innerText")
            
            logger.info("Page scraped successfully", url=url, title_length=len(title))
            
            return {
                "title": title,
                "text": text,
                "html": content,
                "url": url
            }

        except Exception as e:
            logger.error("Scraping failed", url=url, error=str(e))
            return None
            
        finally:
            if page:
                page.close()

    def get_screenshot(self, url: str) -> Optional[bytes]:
        """Capture screenshot of a page."""
        if not self.enabled or not self.browser:
            self.start()
            if not self.enabled:
                return None
                
        page: Optional[Page] = None
        try:
            page = self.browser.new_page()
            page.goto(url, wait_until="networkidle")
            screenshot = page.screenshot(type="jpeg", quality=80)
            return screenshot
        except Exception:
            return None
        finally:
            if page:
                page.close()


# Global scraper instance
scraper_service = WebScraper()
