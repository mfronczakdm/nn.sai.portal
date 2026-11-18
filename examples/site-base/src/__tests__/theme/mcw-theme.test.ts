import { readFileSync } from 'fs';
import { resolve } from 'path';

import { APP_THEMES, SITE_SKINS } from '@/lib/theme';

const themeCss = readFileSync(resolve(__dirname, '../../assets/styles/themes/mcw.css'), 'utf8');
const fontsCss = readFileSync(resolve(__dirname, '../../assets/styles/themes/fonts.css'), 'utf8');

describe('mcw theme package', () => {
  it('registers the mcw skin', () => {
    expect(APP_THEMES).toContain('mcw');
    expect(SITE_SKINS.mcw).toBe('mcw');
  });

  it('sets MCW green as primary and navy as header', () => {
    expect(themeCss).toMatch(/--color-primary:\s*#007066/);
    expect(themeCss).toMatch(/--color-header-background:\s*#003b6f/);
    expect(themeCss).toMatch(/--color-accent:\s*#065590/);
  });

  it('uses Nunito Sans headings and Open Sans body', () => {
    expect(fontsCss).toMatch(/html\[data-theme='mcw'\]/);
    expect(fontsCss).toMatch(/--font-nunito-sans/);
    expect(fontsCss).toMatch(/--font-open-sans/);
  });
});
