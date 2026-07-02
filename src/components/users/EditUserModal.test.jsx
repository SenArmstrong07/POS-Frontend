import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EditUserModal from './EditUserModal';

describe('EditUserModal password reset', () => {
  it('asks for an admin password confirmation before applying a password change', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onVerifyAdminPassword = jest.fn().mockResolvedValue(undefined);
    const user = {
      id: 7,
      username: 'cashier',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      role: 'CASHIER',
      is_active: true,
    };

    render(
      <EditUserModal
        show
        user={user}
        currentUser={{ username: 'admin' }}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        onVerifyAdminPassword={onVerifyAdminPassword}
        loading={false}
        error={null}
      />
    );

    fireEvent.click(screen.getByLabelText(/change password for this user/i));
    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
      target: { value: 'NewPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^save changes$/i }));

    await waitFor(() => expect(screen.getByLabelText(/admin password/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/admin password/i), {
      target: { value: 'AdminPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm password change/i }));

    await waitFor(() => {
      expect(onVerifyAdminPassword).toHaveBeenCalledWith('AdminPass123!');
      expect(onSubmit).toHaveBeenCalledWith(7, expect.objectContaining({ password: 'NewPass123!' }));
    });
  });
});
