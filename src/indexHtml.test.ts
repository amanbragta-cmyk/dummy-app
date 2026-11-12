import { describe, expect, it } from 'vitest';
import html from '../index.html?raw';

describe('index.html', () => {
  // Without an icon link the browser asks for /favicon.ico, which 404s into the console.
  it('declares its own site icon', () => {
    expect(html).toMatch(/<link rel="icon" href="data:image\/svg\+xml,[^"]+"/);
  });
});
