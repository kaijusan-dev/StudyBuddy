import styles from './StatBar.module.css';

const SEGMENTS = 10;

export default function StatBar({ value, type }) {
  const clamped = Math.max(0, Math.min(100, value));

  const exact = (clamped / 100) * SEGMENTS;

  const full = Math.floor(exact);
  const partial = exact - full;
  
  return (
    <div className={styles.statBar}>
      <div className={styles.empty} />

      <div className={styles.fill}>
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          let fill = 0;

          if (i < full) fill = 1;
          else if (i === full) fill = partial;

          const offset = Math.round(-100 + fill * 100);

          return (
            <div key={i} className={styles.slot}>
              <div className={styles.clip}>
                <div
                  className={`${styles.inner} ${styles[type]}`}
                  style={{
                    transform: `translateX(${offset}%)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}