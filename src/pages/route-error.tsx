import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import Button from "../components/Button";
import "./route-status.css";

export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="route-status">
      <div className="route-status-inner">
        <div className="route-status-code">{is404 ? "404" : "Errore"}</div>
        <h1>
          {is404 ? "Pagina non trovata" : "Qualcosa è andato storto"}
        </h1>
        <p>
          {is404
            ? "L'indirizzo che hai raggiunto non esiste o è stato spostato."
            : "Riprova tra poco. Se il problema continua, torna alla home."}
        </p>
        <div className="route-status-actions">
          {!is404 && (
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Ricarica pagina
            </Button>
          )}
          <Button onClick={() => navigate("/")}>Torna alla home</Button>
        </div>
      </div>
    </div>
  );
}
