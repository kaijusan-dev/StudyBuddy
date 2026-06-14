import { useAdmin } from "../../context/AdminContext";
import Modal from "../modal/Modal";
import DebugTab from "./tabs/DebugTab";
import ScheduleTab from "./tabs/ScheduleTab";
import UsersTab from "./tabs/UsersTab";
import PetTab from "./tabs/PetTab";
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const { closeAdmin, activeTab, setActiveTab } = useAdmin();

  return (
    <Modal onClose={closeAdmin} title={'Админка'}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`${styles.tab} ${activeTab === "pet" ? styles.active : ""}`} onClick={() => setActiveTab('pet')}>Pet</button>
          <button className={`${styles.tab} ${activeTab === "schedule" ? styles.active : ""}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
          <button className={`${styles.tab} ${activeTab === "debug" ? styles.active : ""}`} onClick={() => setActiveTab('debug')}>Debug</button>
        </div>

        {activeTab === "users" && <UsersTab />}
        {activeTab === "pet" && <PetTab />}
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "debug" && <DebugTab />}   
    </Modal>
  )
}