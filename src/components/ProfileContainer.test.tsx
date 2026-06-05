import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ProfileContainer } from './ProfileContainer';

describe('ProfileContainer', () => {
  it('renders an iframe', () => {
    const { container } = render(
      <ProfileContainer cssStyles="body { color: red; }" htmlContent="<h1>Test</h1>" />
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeDefined();
    expect(iframe?.getAttribute('sandbox')).toContain('allow-same-origin');
  });
});
