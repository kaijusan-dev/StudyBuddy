import { useEffect, useState } from "react";
import api from "../../../api/api";
import styles from "./UsersTab.module.css";

export default function UsersTab() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const toggleRole = async (id) => {

    const res = await api.post(`/admin/toggle-role/${id}`);

    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, role: res.data.role } : u
      )
    );

  };

  const deleteUser = async (id) => {
    const ok = confirm("Удалить пользователя?");
    if (!ok) return;

    await api.delete(`/admin/users/${id}`);

    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Users</h2>

      <div className={styles.table}>
        <div className={styles.header}>
          <span> ID </span>
          <span> Username </span>
          <span> Group </span>
          <span> Role </span>
          <span> Actions </span>
        </div>

        {users.map(u => (
          <div key={u.id} className={styles.row}>
            <span>{u.id}</span>
            <span>{u.username}</span>
            <span>{u.group_id}</span>

            <span className={
              u.role === "admin"
                ? styles.admin
                : styles.user
            }>
              {u.role}
            </span>

            <div className={styles.actions}>
              <button
                onClick={() => toggleRole(u.id)}
                className={styles.toggle}
              >
                toggle
              </button>

              <button
                onClick={() => deleteUser(u.id)}
                className={styles.delete}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}