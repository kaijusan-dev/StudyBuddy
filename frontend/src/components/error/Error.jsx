import styles from './Error.module.css';

export default function Error({message}) {
    if (!message) return null;
    return (
        <div className={styles.Error}>
            <p><span>⚠ </span>{message}<span> ⚠</span></p>
        </div>
    )
}