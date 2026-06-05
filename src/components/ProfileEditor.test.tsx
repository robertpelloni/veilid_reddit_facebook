import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileEditor } from './ProfileEditor';

describe('ProfileEditor', () => {
  it('calls onSave with input values', () => {
    const onSave = vi.fn();
    render(<ProfileEditor onSave={onSave} isSaving={false} />);

    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'Satoshi' } });

    const publishButton = screen.getByRole('button', { name: /publish profile/i });
    fireEvent.click(publishButton);

    expect(onSave).toHaveBeenCalledWith('Satoshi', expect.any(String), expect.any(String));
  });
});
