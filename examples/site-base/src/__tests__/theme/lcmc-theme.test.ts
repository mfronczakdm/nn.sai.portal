import { readFileSync } from 'fs';
import { resolve } from 'path';

const themeCss = readFileSync(resolve(__dirname, '../../assets/styles/themes/lcmc.css'), 'utf8');
const fontsCss = readFileSync(resolve(__dirname, '../../assets/styles/themes/fonts.css'), 'utf8');

describe('lcmc button theme', () => {
  it('styles secondary CTAs with teal text on a white fill', () => {
    expect(themeCss).toMatch(
      /\[data-theme='lcmc'\] \.btn\.btn-secondary[\s\S]*color:\s*var\(--color-primary\)/
    );
    expect(themeCss).toMatch(
      /\[data-theme='lcmc'\] \.btn\.btn-secondary[\s\S]*background-color:\s*#ffffff/
    );
    expect(fontsCss).toMatch(
      /html\[data-theme='lcmc'\] \.btn\.btn-secondary[\s\S]*color:\s*var\(--color-primary\)/
    );
  });
});
