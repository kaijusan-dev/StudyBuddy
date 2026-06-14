import { useEffect, useRef, useState } from "react";
import styles from './Modal.module.css';

export default function Modal({ children, onClose }) {
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 350, y: 100 });
  const [size, setSize] = useState({ width: 700, height: 800 });

  const draggingRef = useRef(false);
  const resizingRef = useRef(null);
  const interactedRef = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // Блокировка скролла
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, []);

  // ESC закрытие
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Drag + Resize
  useEffect(() => {
    const onMouseMove = (e) => {
      if (resizingRef.current) {
        let { width, height } = size;
        let { x, y } = pos;
        const dir = resizingRef.current;

        if (dir.includes("right")) width = Math.max(400, e.clientX - x);
        if (dir.includes("bottom")) height = Math.max(300, e.clientY - y);
        if (dir.includes("left")) {
          const diff = x - e.clientX;
          width = Math.max(400, size.width + diff);
          x = e.clientX;
        }
        if (dir.includes("top")) {
          const diff = y - e.clientY;
          height = Math.max(300, size.height + diff);
          y = e.clientY;
        }

        setSize({ width, height });
        setPos({ x, y });
        return;
      }

      if (draggingRef.current) {
        setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
      }
    };

    const onMouseUp = () => {
      draggingRef.current = false;
      resizingRef.current = null;

      // Сбрасываем interactedRef с задержкой, чтобы клик после drag/resize не сработал
      setTimeout(() => (interactedRef.current = false), 50);
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pos, size]);

  const startDrag = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    interactedRef.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    document.body.style.userSelect = "none";
  };

  const startResize = (dir) => {
    resizingRef.current = dir;
    interactedRef.current = true;
    document.body.style.userSelect = "none";
  };

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        if (interactedRef.current) return; // игнорируем click после drag/resize
        onClose();
      }}
    >
      <div
        className={styles.content}
        style={{
          left: pos.x,
          top: pos.y,
          width: size.width,
          height: size.height,
          position: "absolute"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header draggable */}
        <div className={styles.header} onMouseDown={startDrag}>
          <button className={styles.close} onClick={onClose}>✖</button>
        </div>

        {/* Контент */}
        <div className={styles.body}>{children}</div>

        {/* Resize sides */}
        <div className={styles.resizeRight} onMouseDown={() => startResize("right")} />
        <div className={styles.resizeLeft} onMouseDown={() => startResize("left")} />
        <div className={styles.resizeTop} onMouseDown={() => startResize("top")} />
        <div className={styles.resizeBottom} onMouseDown={() => startResize("bottom")} />

        {/* Resize углы */}
        <div className={styles.resizeTopLeft} onMouseDown={() => startResize("top-left")} />
        <div className={styles.resizeTopRight} onMouseDown={() => startResize("top-right")} />
        <div className={styles.resizeBottomLeft} onMouseDown={() => startResize("bottom-left")} />
        <div className={styles.resizeBottomRight} onMouseDown={() => startResize("bottom-right")} />
      </div>
    </div>
  );
}