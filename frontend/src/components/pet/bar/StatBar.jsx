import styles from './StatBar.module.css';

const SCALE = 0.35;

const FRAME_COUNT = 11;
const FRAME_HEIGHT = 70;
const GAP = 10;

const scaledFrameHeight = FRAME_HEIGHT * SCALE;
const scaledGap = GAP * SCALE;

export default function StatBar({ value, type }) {
  const clamped = Math.max(0, Math.min(100, value));

  const frameIndex = Math.floor(
    (clamped / 100) * (FRAME_COUNT - 1)
  );

  const offset = frameIndex * (scaledFrameHeight + scaledGap);

  return (
    <div
      className={`${styles['stat-bar']} ${styles[type]}`}
      style={{
        backgroundPosition: `0 -${offset}px`,
      }}
    />
  );
}