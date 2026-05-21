import { useAdmin } from "../../../context/AdminContext";
import { useAuth } from "../../../context/AuthContext";
import { usePet } from "../../../context/PetSocketContext";
import styles from "./AdminTabs.module.css";

export default function DebugTab() {
  const { user } = useAuth();
  const admin = useAdmin();
  const { pet, socketRef } = usePet();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Debug</h3>

      <div className={styles.card}>
        <h4>User</h4>
        <pre className={styles.pre}>{JSON.stringify(user, null, 2)}</pre>
      </div>
      
      <div className={styles.card}>
        <h4>Admin</h4>
        <pre className={styles.pre}>{JSON.stringify(admin, null, 2)}</pre>
      </div>

      <div className={styles.card}>
        <h4>Pet</h4>
        <pre className={styles.pre}>{JSON.stringify(pet, null, 2)}</pre>
      </div>

      <div className={styles.card}>
        <h4>Socket</h4>
        <pre className={styles.pre}>
          {JSON.stringify({
            readyState: socketRef.current?.readyState,
            status:
              socketRef.current?.readyState === 0 ? "CONNECTING" :
              socketRef.current?.readyState === 1 ? "OPEN" :
              socketRef.current?.readyState === 2 ? "CLOSING" :
              socketRef.current?.readyState === 3 ? "CLOSED" : "UNKNOWN",
            bufferedAmount: socketRef.current?.bufferedAmount,
            url: socketRef.current?.url
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}