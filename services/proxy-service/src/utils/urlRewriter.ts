import * as cheerio from 'cheerio';
import logger from './logger';

export const rewriteUrls = (html: string, baseUrl: string): string => {
  try {
    const $ = cheerio.load(html);
    const base = new URL(baseUrl);

    // Helper function to convert relative URL to absolute
    const toAbsolute = (url: string | undefined): string | undefined => {
      if (!url || url.trim() === '') return url;

      // Skip data URIs, javascript:, mailto:, tel:, etc.
      if (
        url.startsWith('data:') ||
        url.startsWith('javascript:') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('#')
      ) {
        return url;
      }

      try {
        // Handle protocol-relative URLs
        if (url.startsWith('//')) {
          return `${base.protocol}${url}`;
        }

        // Convert relative to absolute
        const absoluteUrl = new URL(url, baseUrl);
        return absoluteUrl.href;
      } catch (error) {
        logger.warn(`Failed to rewrite URL: ${url}`, error);
        return url;
      }
    };

    // Rewrite anchor hrefs
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      const absoluteHref = toAbsolute(href);
      if (absoluteHref) {
        $(element).attr('href', absoluteHref);
      }
    });

    // Rewrite image sources
    $('img[src]').each((_, element) => {
      const src = $(element).attr('src');
      const absoluteSrc = toAbsolute(src);
      if (absoluteSrc) {
        $(element).attr('src', absoluteSrc);
      }
    });

    // Rewrite image srcsets
    $('img[srcset]').each((_, element) => {
      const srcset = $(element).attr('srcset');
      if (srcset) {
        const newSrcset = srcset
          .split(',')
          .map((src) => {
            const parts = src.trim().split(/\s+/);
            const url = parts[0];
            const descriptor = parts[1] || '';
            const absoluteUrl = toAbsolute(url);
            return `${absoluteUrl} ${descriptor}`.trim();
          })
          .join(', ');
        $(element).attr('srcset', newSrcset);
      }
    });

    // Rewrite link stylesheets
    $('link[href]').each((_, element) => {
      const href = $(element).attr('href');
      const absoluteHref = toAbsolute(href);
      if (absoluteHref) {
        $(element).attr('href', absoluteHref);
      }
    });

    // Rewrite script sources
    $('script[src]').each((_, element) => {
      const src = $(element).attr('src');
      const absoluteSrc = toAbsolute(src);
      if (absoluteSrc) {
        $(element).attr('src', absoluteSrc);
      }
    });

    // Rewrite inline styles with url()
    $('[style]').each((_, element) => {
      const style = $(element).attr('style');
      if (style && style.includes('url(')) {
        const newStyle = style.replace(
          /url\(['"]?([^'")]+)['"]?\)/g,
          (_match, url) => {
            const absoluteUrl = toAbsolute(url);
            return `url('${absoluteUrl}')`;
          }
        );
        $(element).attr('style', newStyle);
      }
    });

    // Rewrite CSS background images in <style> tags
    $('style').each((_, element) => {
      let cssContent = $(element).html() || '';
      if (cssContent.includes('url(')) {
        cssContent = cssContent.replace(
          /url\(['"]?([^'")]+)['"]?\)/g,
          (_match, url) => {
            const absoluteUrl = toAbsolute(url);
            return `url('${absoluteUrl}')`;
          }
        );
        $(element).html(cssContent);
      }
    });

    // Rewrite source tags (video, audio, picture)
    $('source[src]').each((_, element) => {
      const src = $(element).attr('src');
      const absoluteSrc = toAbsolute(src);
      if (absoluteSrc) {
        $(element).attr('src', absoluteSrc);
      }
    });

    $('source[srcset]').each((_, element) => {
      const srcset = $(element).attr('srcset');
      const absoluteSrcset = toAbsolute(srcset);
      if (absoluteSrcset) {
        $(element).attr('srcset', absoluteSrcset);
      }
    });

    // Add base tag if not present (fallback for any missed URLs)
    if ($('base').length === 0) {
      $('head').prepend(`<base href="${baseUrl}">`);
    }

    logger.debug(`URL rewriting completed for: ${baseUrl}`);
    return $.html();
  } catch (error) {
    logger.error('Error rewriting URLs:', error);
    return html;
  }
};

export default { rewriteUrls };
