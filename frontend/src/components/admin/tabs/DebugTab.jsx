import { useAdmin } from "../../../context/AdminContext";
import { useAuth } from "../../../context/AuthContext";


export default function DebugTab() {
  const { user } = useAuth();
  const admin = useAdmin();

  return (
    <div>
      <h3>Debug</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <pre>{JSON.stringify(admin, null, 2)}</pre>
    </div>
  );
}