import { chromium, Browser, Page } from 'playwright';
import sharp from 'sharp';
import logger from '../utils/logger';

const WIDGET_CDN_URL = process.env.WIDGET_CDN_URL || 'https://cdn.yourcompany.com/widget.js';
const SCREENSHOT_TIMEOUT = parseInt(process.env.SCREENSHOT_TIMEOUT || '30000');
const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH || '1920');
const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT || '1080');
const SCREENSHOT_QUALITY = parseInt(process.env.SCREENSHOT_QUALITY || '85');

class ScreenshotService {
  private browser: Browser | null = null;

  async initialize() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      logger.info('Playwright browser initialized');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async takeScreenshot(url: string, clientId: string, device: string = 'desktop'): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize();
    }

    const context = await this.browser!.newContext({
      viewport: this.getViewportSize(device),
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    let page: Page | null = null;

    try {
      page = await context.newPage();

      // Navigate to URL
      logger.info(`Navigating to ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: SCREENSHOT_TIMEOUT,
      });

      // Inject chatbot widget
      await this.injectWidget(page, clientId);

      // Wait a bit for widget to render
      await page.waitForTimeout(1000);

      // Take screenshot
      logger.info('Taking screenshot');
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'jpeg',
        quality: SCREENSHOT_QUALITY,
      });

      // Optimize with sharp
      const optimized = await sharp(screenshot)
        .jpeg({ quality: SCREENSHOT_QUALITY, progressive: true })
        .toBuffer();

      logger.info(`Screenshot taken: ${optimized.length} bytes`);
      return optimized;

    } catch (error) {
      logger.error('Screenshot failed:', error);
      throw error;
    } finally {
      if (page) await page.close();
      await context.close();
    }
  }

  private async injectWidget(page: Page, clientId: string) {
    try {
      const widgetScript = `
        (function() {
          const script = document.createElement('script');
          script.src = '${WIDGET_CDN_URL}';
          script.setAttribute('data-client-id', '${clientId}');
          script.setAttribute('data-preview-mode', 'true');
          script.async = true;
          document.body.appendChild(script);
        })();
      `;

      await page.evaluate(widgetScript);
      logger.info('Widget injected into page');
    } catch (error) {
      logger.warn('Failed to inject widget:', error);
      // Don't throw - continue with screenshot even if widget fails
    }
  }

  private getViewportSize(device: string): { width: number; height: number } {
    switch (device) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Browser closed');
    }
  }
}

export const screenshotService = new ScreenshotService();
