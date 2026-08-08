/**
 * Which pages Eclipse will run on.
 *
 * Chrome internal pages, extension pages, `file://` and anything non-HTTP(S)
 * are out — `activeTab` does not grant access to them, and the popup should say
 * so plainly rather than fail obscurely once the user presses Start.
 */

import type { PopupPageSupport } from './messages';

export function classifyUrl(url: string | undefined): PopupPageSupport {
  if (!url) return { supported: false, reason: 'other' };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { supported: false, reason: 'other' };
  }

  switch (parsed.protocol) {
    case 'http:':
    case 'https:':
      return { supported: true };
    case 'file:':
      return { supported: false, reason: 'file' };
    case 'chrome-extension:':
    case 'moz-extension:':
      return { supported: false, reason: 'extension' };
    case 'chrome:':
    case 'edge:':
    case 'about:':
    case 'devtools:':
    case 'view-source:':
      return { supported: false, reason: 'internal' };
    default:
      return { supported: false, reason: 'other' };
  }
}

/** Popup copy for an unsupported page. */
export function unsupportedReasonText(support: PopupPageSupport): string {
  if (support.supported) return '';
  switch (support.reason) {
    case 'internal':
      return 'Eclipse cannot run on Chrome’s own pages.';
    case 'extension':
      return 'Eclipse cannot run on extension pages.';
    case 'file':
      return 'Eclipse cannot run on local file:// pages.';
    default:
      return 'Eclipse only runs on regular http(s) web pages.';
  }
}
