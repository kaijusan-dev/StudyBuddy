import styles from "./Avatar.module.css";

export default function Avatar({ type = "large", avatar, onClick }) {

  const avatarUrl = avatar
    ? `/api/uploads/avatars/${avatar}`
    : "/default-avatar.png";

  return (
    <div 
      className={`${styles.avatar} ${styles[type]}`} 
      onClick={onClick}
    > 
      <img
        src={avatarUrl} 
        alt="avatar"
        className={styles.avatarImg}
        onError={(e) => {
          e.target.src = "/default-avatar.png";
        }}
      />
    </div>
  );
}