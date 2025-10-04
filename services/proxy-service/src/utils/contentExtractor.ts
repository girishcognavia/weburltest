/**
 * Content Extractor - Extracts text content from HTML for RAG embedding
 */

import * as cheerio from 'cheerio';
import logger from './logger';

export interface ExtractedContent {
  url: string;
  title: string;
  description: string;
  mainContent: string;
  headings: string[];
  links: { text: string; url: string }[];
  metadata: Record<string, string>;
}

/**
 * Extract meaningful content from HTML for RAG knowledge base
 */
export const extractContent = (html: string, url: string): ExtractedContent => {
  try {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, noscript, iframe, nav, footer, header, aside, .advertisement, .ad, .cookie-banner').remove();

    // Extract title
    const title = $('title').text().trim() ||
                  $('h1').first().text().trim() ||
                  'Untitled Page';

    // Extract description
    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') ||
                       $('p').first().text().trim().substring(0, 200) ||
                       '';

    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, element) => {
      const text = $(element).text().trim();
      if (text) headings.push(text);
    });

    // Extract main content
    let mainContent = '';

    // Try to find main content area
    const mainSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      '.post-content',
      '.entry-content'
    ];

    for (const selector of mainSelectors) {
      const content = $(selector).text().trim();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }

    // Fallback: extract all paragraph text
    if (!mainContent) {
      const paragraphs: string[] = [];
      $('p').each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 20) {
          paragraphs.push(text);
        }
      });
      mainContent = paragraphs.join('\n\n');
    }

    // Clean up content (remove extra whitespace)
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // Extract important links
    const links: { text: string; url: string }[] = [];
    $('a[href]').each((_, element) => {
      const text = $(element).text().trim();
      const href = $(element).attr('href');

      if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          const absoluteUrl = new URL(href, url).href;
          links.push({ text, url: absoluteUrl });
        } catch {
          // Invalid URL, skip
        }
      }
    });

    // Extract metadata
    const metadata: Record<string, string> = {};

    $('meta').each((_, element) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');

      if (name && content) {
        metadata[name] = content;
      }
    });

    logger.info(`Content extracted from ${url}: ${mainContent.length} chars`);

    return {
      url,
      title,
      description,
      mainContent,
      headings,
      links: links.slice(0, 50), // Limit to 50 links
      metadata
    };
  } catch (error) {
    logger.error('Error extracting content:', error);
    return {
      url,
      title: '',
      description: '',
      mainContent: '',
      headings: [],
      links: [],
      metadata: {}
    };
  }
};

/**
 * Chunk content into smaller pieces for embedding
 */
export const chunkContent = (content: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  const words = content.split(/\s+/);

  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;

    if (currentLength >= chunkSize) {
      chunks.push(currentChunk.join(' '));

      // Keep overlap words for next chunk
      const overlapWords = Math.floor(overlap / (currentLength / currentChunk.length));
      currentChunk = currentChunk.slice(-overlapWords);
      currentLength = currentChunk.join(' ').length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
};

export default {
  extractContent,
  chunkContent
};
