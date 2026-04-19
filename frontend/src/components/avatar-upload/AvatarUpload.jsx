import { useRef } from "react";
import api from "../../api/api";
import Avatar from "../avatar/Avatar";
import styles from "./AvatarUpload.module.css";

export default function AvatarUpload({ user, onUpload }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUpload(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.wrapper} onClick={handleClick}>
      <Avatar avatar={user?.avatar} />

      <div className={styles.overlay}>
        <span className={styles.upload}>🡇</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className={styles.input}
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}