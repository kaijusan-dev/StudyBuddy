import { useAdmin } from "../../../context/AdminContext";
import { useAuth } from "../../../context/AuthContext";
import { usePet } from "../../../context/PetSocketContext";

export default function DebugTab() {
  const { user } = useAuth();
  const admin = useAdmin();
  const { pet, socketRef } = usePet();

  return (
    <div>
      <h3>Debug</h3>

      <h4>User</h4>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <h4>Admin</h4>
      <pre>{JSON.stringify(admin, null, 2)}</pre>

      <h4>Pet</h4>
      <pre>{JSON.stringify(pet, null, 2)}</pre>

      <h4>Socket</h4>
      <pre>
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
  );
}