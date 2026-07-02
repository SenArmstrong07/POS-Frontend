import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EditUserModal from './EditUserModal';

describe('EditUserModal self password change', () => {
  it('uses a current-password confirmation when the admin edits their own account', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onVerifyAdminPassword = jest.fn().mockResolvedValue(undefined);

    render(
      <EditUserModal
        show
        user={{ id: 1, username: 'admin', first_name: 'Admin', last_name: 'User', email: 'admin@example.com', role: 'ADMIN', is_active: true }}
        currentUser={{ id: 1, username: 'admin' }}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        onVerifyAdminPassword={onVerifyAdminPassword}
        loading={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByLabelText(/change my password/i));
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'NewAdmin123!' } });
    fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'NewAdmin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /^save changes$/i }));

    waitFor(() => expect(screen.getByLabelText(/current password/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/current password/i), { target: { value: 'current-pass' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm password change/i }));

    await waitFor(() => {
      expect(onVerifyAdminPassword).toHaveBeenCalledWith('current-pass');
      expect(onSubmit).toHaveBeenCalledWith(1, expect.objectContaining({ password: 'NewAdmin123!' }));
    });
  });
});
