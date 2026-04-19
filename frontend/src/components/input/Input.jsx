import styles from './Input.module.css';

export default function Input({ name, label, type = "text", state, setState }) {
  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={name}>{label}</label>}

      <input 
        className={styles.input}
        type={type} 
        name={name} 
        id={name}
        value={state[name] || ""}
        onChange={(e) => {
          setState(prev => ({
            ...prev,
            [name]: e.target.value
          }));
        }}
      />
    </div>
  );
}