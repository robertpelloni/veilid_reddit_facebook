import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProfileContainer } from './ProfileContainer';

describe('ProfileContainer', () => {
  it('renders a sandboxed iframe with srcdoc', () => {
    const { container } = render(
      <ProfileContainer cssStyles="body { color: red; }" htmlContent="<h1>Test</h1>" />
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeDefined();
    // Verify it's a strict null-origin sandbox
    expect(iframe?.getAttribute('sandbox')).toBe("");
    expect(iframe?.getAttribute('srcdoc')).toContain('<h1>Test</h1>');
  });
});
