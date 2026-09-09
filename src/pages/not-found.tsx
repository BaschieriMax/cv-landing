import { useNavigate } from "react-router";
import Button from "../components/Button";
import "./route-status.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="route-status">
      <div className="route-status-inner">
        <div className="route-status-code">404</div>
        <h1>Pagina non trovata</h1>
        <p>L'indirizzo che hai raggiunto non esiste o è stato spostato.</p>
        <div className="route-status-actions">
          <Button onClick={() => navigate("/")}>Torna alla home</Button>
        </div>
      </div>
    </div>
  );
}
