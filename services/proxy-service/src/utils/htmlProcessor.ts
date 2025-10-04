import * as cheerio from 'cheerio';
import logger from './logger';
import { generateChatWidgetScript } from '../widget/chatWidget';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Frame-busting patterns to detect and remove
const FRAME_BUSTING_PATTERNS = [
  /top\.location/g,
  /top\s*!=\s*self/g,
  /top\s*!==\s*self/g,
  /parent\.location/g,
  /window\.top\s*!=\s*window\.self/g,
  /window\.top\s*!==\s*window\.self/g,
  /if\s*\(\s*top\s*!\s*=\s*self\s*\)/g,
  /frameElement/g,
];

export const stripFrameBlocking = (html: string): string => {
  try {
    const $ = cheerio.load(html);

    // Remove X-Frame-Options meta tags
    $('meta[http-equiv="X-Frame-Options"]').remove();
    $('meta[name="X-Frame-Options"]').remove();

    // Remove Content-Security-Policy meta tags
    $('meta[http-equiv="Content-Security-Policy"]').remove();
    $('meta[name="Content-Security-Policy"]').remove();

    logger.debug('Frame-blocking meta tags removed');
    return $.html();
  } catch (error) {
    logger.error('Error stripping frame-blocking tags:', error);
    return html;
  }
};

export const removeFrameBustingScripts = (html: string): string => {
  try {
    const $ = cheerio.load(html);

    // Check all script tags for frame-busting code
    $('script').each((_, element) => {
      const scriptContent = $(element).html() || '';

      // Check if script contains frame-busting patterns
      const hasFrameBusting = FRAME_BUSTING_PATTERNS.some((pattern) =>
        pattern.test(scriptContent)
      );

      if (hasFrameBusting) {
        logger.debug('Frame-busting script detected and removed');
        // Comment out the script instead of removing to preserve page structure
        $(element).replaceWith(`<!-- Frame-busting script removed -->`);
      }
    });

    return $.html();
  } catch (error) {
    logger.error('Error removing frame-busting scripts:', error);
    return html;
  }
};

export const injectFrameBustingPrevention = (html: string): string => {
  try {
    const $ = cheerio.load(html);

    const preventionScript = `
<script>
  // Prevent frame-busting attempts
  (function() {
    try {
      Object.defineProperty(window, 'top', {
        get: function() { return window.self; },
        configurable: false
      });
      Object.defineProperty(window, 'parent', {
        get: function() { return window.self; },
        configurable: false
      });
      Object.defineProperty(window, 'frameElement', {
        get: function() { return null; },
        configurable: false
      });
    } catch (e) {
      console.warn('Frame-busting prevention partially failed:', e);
    }
  })();
</script>
`;

    // Inject at the beginning of <head>
    if ($('head').length > 0) {
      $('head').prepend(preventionScript);
    } else {
      $('html').prepend(preventionScript);
    }

    logger.debug('Frame-busting prevention script injected');
    return $.html();
  } catch (error) {
    logger.error('Error injecting frame-busting prevention:', error);
    return html;
  }
};

export const injectChatbotWidget = (
  html: string,
  clientId: string,
  _previewMode: boolean = true
): string => {
  try {
    const $ = cheerio.load(html);

    // Generate inline chat widget script
    const widgetScript = generateChatWidgetScript(clientId, API_URL);

    // Inject before closing </body> tag
    if ($('body').length > 0) {
      $('body').append(widgetScript);
      logger.debug(`Chatbot widget injected for client: ${clientId}`);
    } else {
      logger.warn('No <body> tag found, appending widget to end of HTML');
      $('html').append(widgetScript);
    }

    return $.html();
  } catch (error) {
    logger.error('Error injecting chatbot widget:', error);
    return html;
  }
};

export const processHtml = (
  html: string,
  clientId: string,
  previewMode: boolean = true
): string => {
  let processedHtml = html;

  // Step 1: Strip frame-blocking meta tags
  processedHtml = stripFrameBlocking(processedHtml);

  // Step 2: Remove frame-busting scripts
  processedHtml = removeFrameBustingScripts(processedHtml);

  // Step 3: Inject frame-busting prevention
  processedHtml = injectFrameBustingPrevention(processedHtml);

  // Step 4: Inject chatbot widget
  processedHtml = injectChatbotWidget(processedHtml, clientId, previewMode);

  logger.info('HTML processing completed');
  return processedHtml;
};

export default {
  stripFrameBlocking,
  removeFrameBustingScripts,
  injectFrameBustingPrevention,
  injectChatbotWidget,
  processHtml,
};
