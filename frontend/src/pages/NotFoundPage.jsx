import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPage.module.css";
import Button from "../components/buttons/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.window}>
        
        <div className={styles.titlebar}>
          <span>⚠ 404</span>
        </div>

        <div className={styles.content}>
          <h1>Страница не найдена</h1>
          <p>Кажется, ты свернул не туда...</p>

          <div className={styles.actions}>
            <Button variant="action" onClick={() => navigate("/")}>
              На главную
            </Button>

            <Button variant="action" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}