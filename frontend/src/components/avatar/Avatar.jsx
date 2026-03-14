import styles from "./Avatar.module.css";

export default function Avatar({ src, onClick }) {
  return (
    <div className={styles.avatar} onClick={onClick}>
      <img
        src={`api/${src}` || "/default-avatar.png"} 
        alt="avatar"
        className={styles.avatarImg}
      />
      <div className={styles.overlay}>
        <span className={styles.upload}>🡇</span>
      </div>
    </div>
  );
}