import { useState, useRef, useEffect } from "react";
import styles from "./AdminButton.module.css";
import { useAdmin } from "../../context/AdminContext";

export default function AdminButton() {
  const { toggleAdmin } = useAdmin();

  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [clicked, setClicked] = useState(false);

  const draggingRef = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    draggingRef.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  const onMouseUp = () => {
    draggingRef.current = false;
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current) return;

      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;

      setPos({
        x: Math.max(0, Math.min(e.clientX - offset.current.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - offset.current.y, maxY)),
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleClick = () => {
    if (draggingRef.current) return;

    setClicked(true);
    toggleAdmin();
    setTimeout(() => setClicked(false), 400);
  };

  return (
    <div
      className={`${styles.button} ${clicked ? styles.clickAnim : ""}`}
      style={{ left: pos.x, top: pos.y, position: 'fixed', cursor: 'grab' }}
      onMouseDown={onMouseDown}
      onClick={handleClick}
    >
      <span className={styles.icon}>😈</span>
    </div>
  );
}