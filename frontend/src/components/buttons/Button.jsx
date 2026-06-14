import styles from "./Button.module.css";

export default function Button({ children, variant = "base", ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      <span>{children}</span>
    </button>
  );
}