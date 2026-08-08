import { describe, expect, it } from 'vitest';
import { classifyUrl, unsupportedReasonText } from '@/domain/url-support';

describe('classifyUrl', () => {
  it('supports http and https', () => {
    expect(classifyUrl('http://127.0.0.1:4321/demo-a.html')).toEqual({ supported: true });
    expect(classifyUrl('https://example.com/article')).toEqual({ supported: true });
  });

  it('rejects Chrome internal pages', () => {
    expect(classifyUrl('chrome://extensions')).toEqual({ supported: false, reason: 'internal' });
    expect(classifyUrl('about:blank')).toEqual({ supported: false, reason: 'internal' });
    expect(classifyUrl('devtools://devtools/bundled/inspector.html')).toEqual({
      supported: false,
      reason: 'internal',
    });
    expect(classifyUrl('view-source:https://example.com')).toEqual({
      supported: false,
      reason: 'internal',
    });
  });

  it('rejects extension pages', () => {
    expect(classifyUrl('chrome-extension://abcdef/popup.html')).toEqual({
      supported: false,
      reason: 'extension',
    });
  });

  it('rejects file URLs', () => {
    expect(classifyUrl('file:///Users/someone/article.html')).toEqual({
      supported: false,
      reason: 'file',
    });
  });

  it('rejects anything else, including missing and malformed URLs', () => {
    expect(classifyUrl(undefined)).toEqual({ supported: false, reason: 'other' });
    expect(classifyUrl('not a url')).toEqual({ supported: false, reason: 'other' });
    expect(classifyUrl('ftp://example.com/file')).toEqual({ supported: false, reason: 'other' });
    expect(classifyUrl('data:text/html,<h1>hi</h1>')).toEqual({
      supported: false,
      reason: 'other',
    });
  });
});

describe('unsupportedReasonText', () => {
  it('explains each reason and says nothing for a supported page', () => {
    expect(unsupportedReasonText({ supported: true })).toBe('');
    expect(unsupportedReasonText({ supported: false, reason: 'internal' })).toMatch(/Chrome/);
    expect(unsupportedReasonText({ supported: false, reason: 'file' })).toMatch(/file/);
    expect(unsupportedReasonText({ supported: false, reason: 'extension' })).toMatch(/extension/);
    expect(unsupportedReasonText({ supported: false, reason: 'other' })).toMatch(/http/);
  });
});
