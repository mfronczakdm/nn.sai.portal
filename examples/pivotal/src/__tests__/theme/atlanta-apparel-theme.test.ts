import { readFileSync } from 'fs';
import { resolve } from 'path';

const themeCss = readFileSync(
  resolve(__dirname, '../../assets/styles/themes/atlanta-apparel.css'),
  'utf8'
);
const fontsCss = readFileSync(resolve(__dirname, '../../assets/styles/themes/fonts.css'), 'utf8');

describe('atlanta-apparel HeroST button theme', () => {
  it('defines terracotta headline and cream hero surface tokens', () => {
    expect(themeCss).toMatch(/--color-hero-headline:\s*#9a5340/);
    expect(themeCss).toMatch(/--color-hero-surface:\s*#faf9f6/);
  });

  it('forces square 90-degree corners on HeroST and theme buttons', () => {
    expect(themeCss).toMatch(/\[data-theme='atlanta-apparel'\] \.btn/);
    expect(themeCss).toMatch(/\[data-theme='atlanta-apparel'\] \.btn\.btn-primary/);
    expect(themeCss).toMatch(/\[data-theme='atlanta-apparel'\] \.btn\.btn-secondary/);
    expect(themeCss).toMatch(/\[data-theme='atlanta-apparel'\] \.hero-st-version1 \.btn/);
    expect(themeCss).toMatch(/border-radius:\s*0/);
    expect(fontsCss).toMatch(/html\[data-theme='atlanta-apparel'\] \.btn/);
    expect(fontsCss).toMatch(/html\[data-theme='atlanta-apparel'\] \.btn\.btn-secondary/);
  });

  it('styles secondary CTAs as square ghost buttons', () => {
    expect(themeCss).toMatch(/\.btn\.btn-secondary[\s\S]*border:\s*1px solid var\(--color-foreground\)/);
    expect(themeCss).toMatch(/\.btn\.btn-secondary[\s\S]*background-color:\s*transparent/);
  });
});
