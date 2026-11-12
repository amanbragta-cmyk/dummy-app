import { describe, expect, it } from 'vitest';
import html from '../index.html?raw';
import icon from '../public/favicon.svg?raw';

describe('index.html', () => {
  // Without an icon link the browser asks for /favicon.ico, which 404s into the console.
  it('links a site icon that exists', () => {
    expect(html).toMatch(/<link rel="icon" type="image\/svg\+xml" href="\.\/favicon\.svg"/);
    expect(icon).toContain('<svg');
  });
});
