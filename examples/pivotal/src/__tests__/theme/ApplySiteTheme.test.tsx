import React from 'react';
import { render } from '@testing-library/react';

import { ApplySiteTheme } from '@/components/theme/ApplySiteTheme';

describe('ApplySiteTheme', () => {
  it('sets data-theme on documentElement without rendering a script tag', () => {
    const { container } = render(<ApplySiteTheme theme="quanex" />);

    expect(container.querySelector('script')).toBeNull();
    expect(document.documentElement.getAttribute('data-theme')).toBe('quanex');
    expect(document.cookie).toContain('app-theme=quanex');
  });
});
