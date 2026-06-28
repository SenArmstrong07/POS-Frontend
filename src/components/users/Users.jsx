import { useCallback, useEffect, useState } from "react";
import { apiCalls, extractFieldErrors } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import UsersToolbar from "./UsersToolbar";
import AddUserModal, { EMPTY_ADD_USER_FORM } from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import UserActivityLogModal from "./UserActivityLogModal";
import UserTable from "./UserTable";

export default function Users({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_ADD_USER_FORM);
  const [addError, setAddError] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editError, setEditError] = useState(null);

  const [activityLogs, setActivityLogs] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  const [loadingAction, setLoadingAction] = useState(false);

  const normalizeList = (data) => (Array.isArray(data) ? data : data?.results || []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await apiCalls.getUsers();
      setUsers(normalizeList(response.data));
    } catch (err) {
      console.error("Unable to load users:", getApiErrorMessage(err));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadActivityLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const response = await apiCalls.getActivityLog({ ordering: "-created_at" });
      setActivityLogs(normalizeList(response.data));
    } catch (err) {
      console.error("Unable to load activity log:", getApiErrorMessage(err));
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadActivityLog();
  }, [loadUsers, loadActivityLog]);

  const filtered = (users || []).filter(
    (u) =>
      u &&
      ((u.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.last_name || "").toLowerCase().includes(search.toLowerCase()))
  );

  const addUser = async (e) => {
    e.preventDefault();
    setAddError(null);
    setLoadingAction(true);
    try {
      await apiCalls.createUser({
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      });
      await loadUsers();
      await loadActivityLog();
      setForm(EMPTY_ADD_USER_FORM);
      setShowAdd(false);
    } catch (err) {
      const fieldMessage = extractFieldErrors(err);
      console.error("Unable to create user:", fieldMessage || getApiErrorMessage(err));
      setAddError(fieldMessage || getApiErrorMessage(err, "Couldn't create the user."));
    } finally {
      setLoadingAction(false);
    }
  };

  const saveUserEdit = async (userId, updates) => {
    setEditError(null);
    setLoadingAction(true);
    try {
      await apiCalls.updateUser(userId, updates);
      await loadUsers();
      await loadActivityLog();
      setEditingUser(null);
    } catch (err) {
      const fieldMessage = extractFieldErrors(err);
      console.error("Unable to update user:", fieldMessage || getApiErrorMessage(err));
      setEditError(fieldMessage || getApiErrorMessage(err, "Couldn't update the user."));
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleActive = async (user) => {
    if (user.id === currentUser?.id) return; // safety net alongside the disabled button
    setLoadingAction(true);
    try {
      await apiCalls.updateUser(user.id, { is_active: !user.is_active });
      await loadUsers();
      await loadActivityLog();
    } catch (err) {
      console.error("Unable to update user status:", getApiErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  const deleteUser = async (user) => {
    if (user.id === currentUser?.id) return;
    if (!window.confirm(`Delete ${user.username}? This can't be undone.`)) return;
    setLoadingAction(true);
    try {
      await apiCalls.deleteUser(user.id);
      await loadUsers();
      await loadActivityLog();
    } catch (err) {
      console.error("Unable to delete user:", getApiErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div>
      <UsersToolbar
        search={search}
        setSearch={setSearch}
        onAddClick={() => {
          setAddError(null);
          setShowAdd(true);
        }}
        onLogClick={() => setShowLog(true)}
        logCount={activityLogs.length}
      />

      <AddUserModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        form={form}
        setForm={setForm}
        onSubmit={addUser}
        loading={loadingAction}
        error={addError}
      />

      <EditUserModal
        show={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={saveUserEdit}
        loading={loadingAction}
        error={editError}
      />

      <UserActivityLogModal
        show={showLog}
        onClose={() => setShowLog(false)}
        logs={activityLogs}
        loading={logLoading}
      />

      {usersLoading ? (
        <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Loading users…
        </p>
      ) : (
        <UserTable
          users={filtered}
          currentUserId={currentUser?.id}
          onEdit={setEditingUser}
          onToggleActive={toggleActive}
          onDelete={deleteUser}
        />
      )}
    </div>
  );
}