import { useState } from "react";
import "./App.css";

const PACCHETTI = [
  { value: "", label: "Non sono ancora sicuro/a" },
  { value: "Base", label: "Base" },
  { value: "Professional", label: "Professional" },
  { value: "Professional + LinkedIn", label: "Professional + LinkedIn" },
  { value: "Career Boost", label: "Career Boost" },
];

const EMPTY_FORM = {
  nome: "",
  email: "",
  telefono: "",
  ruolo: "",
  pacchetto: "",
  messaggio: "",
};

function validate(form) {
  const errors = {};

  if (!form.nome.trim()) errors.nome = "Inserisci nome e cognome";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Inserisci un'email valida";
  }

  if (!form.telefono.trim())
    errors.telefono = "Inserisci un numero di telefono";

  if (!form.ruolo.trim()) errors.ruolo = "Indica il ruolo che stai cercando";

  if (!form.messaggio.trim())
    errors.messaggio = "Aggiungi qualche dettaglio sulla tua situazione";

  return errors;
}

function Field({ id, label, error, children }) {
  return (
    <div className={`field${error ? " invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((f) => ({ ...f, [name]: value }));

    if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus({ type: "", message: "" });

    const validationErrors = validate(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus({ type: "err", message: "Controlla i campi evidenziati." });

      return;
    }

    if (!accessKey || accessKey === "inserisci_qui_la_tua_access_key") {
      setStatus({
        type: "err",
        message:
          "Access key Web3Forms mancante: configurala nel file .env (vedi README).",
      });

      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.target);

    formData.append("access_key", accessKey);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setStatus({
          type: "ok",
          message: "Richiesta inviata. Ti rispondo entro 24 ore.",
        });

        setForm(EMPTY_FORM);
      } else {
        setStatus({
          type: "err",
          message:
            "Qualcosa non ha funzionato. Riprova o scrivimi direttamente via email.",
        });
      }
    } catch {
      setStatus({
        type: "err",
        message: "Errore di connessione. Riprova tra poco.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header>
        <div className="wrap brand">
          <div>
            <div className="brand-name">Massimo Baschieri</div>
            <div className="brand-tag">CV writing e career coaching</div>
          </div>
          <div className="brand-tag">Sassuolo, Modena</div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              Un CV non è un documento. È l'unica occasione che hai con un
              recruiter.
            </h1>
            <p className="hero-sub">
              Riscrivo il tuo curriculum in ottica ATS, lo adatto al settore che
              stai cercando e ti preparo al colloquio — così quando arriva la
              chiamata, sei pronto.
            </p>
          </div>
          <div className="hero-facts">
            <div className="fact">
              <div className="fact-num">48-72h</div>
              <div className="fact-label">tempo medio di consegna</div>
            </div>
            <div className="fact">
              <div className="fact-num">13</div>
              <div className="fact-label">settori professionali coperti</div>
            </div>
            <div className="fact">
              <div className="fact-num">2</div>
              <div className="fact-label">
                revisioni incluse in ogni pacchetto
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="wrap">
          <h2>
            Quattro modi di lavorare insieme, in base a quanto vuoi arrivare
            pronto.
          </h2>
          <div className="service-grid">
            <div className="service-card">
              <h3>Base</h3>
              <p>
                Riscrittura completa del CV in formato ATS-friendly, pronto in
                PDF e Word.
              </p>
            </div>
            <div className="service-card">
              <h3>Professional</h3>
              <p>
                CV adattato al ruolo target, keyword ottimizzate, lettera di
                presentazione inclusa.
              </p>
            </div>
            <div className="service-card">
              <h3>Professional + LinkedIn</h3>
              <p>
                Tutto il Professional più un profilo LinkedIn riscritto per
                farti trovare dai recruiter.
              </p>
            </div>
            <div className="service-card featured span-3">
              <span className="badge">più richiesto</span>
              <h3>Career Boost</h3>
              <p>
                CV, LinkedIn e una simulazione di colloquio 1:1 con le domande
                HR più probabili per il tuo ruolo, più un cheat sheet di
                risposte pronte con il metodo STAR.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact">
        <div className="wrap">
          <div className="contact-head">
            <h2>Raccontami la tua situazione</h2>
            <p className="contact-sub">
              Compila il form: ti rispondo entro 24 ore con una valutazione
              gratuita e la proposta più adatta a te.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <Field id="nome" label="Nome e cognome" error={errors.nome}>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Mario Rossi"
                value={form.nome}
                onChange={handleChange}
              />
            </Field>

            <Field id="email" label="Email" error={errors.email}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="mario.rossi@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </Field>

            <Field id="telefono" label="Telefono" error={errors.telefono}>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="+39 333 1234567"
                value={form.telefono}
                onChange={handleChange}
              />
            </Field>

            <Field
              id="ruolo"
              label="Ruolo o settore che stai cercando"
              error={errors.ruolo}
            >
              <input
                type="text"
                id="ruolo"
                name="ruolo"
                placeholder="Es. Frontend developer, settore IT"
                value={form.ruolo}
                onChange={handleChange}
              />
            </Field>

            <div className="field full">
              <label htmlFor="pacchetto">Pacchetto di interesse</label>
              <select
                id="pacchetto"
                name="pacchetto"
                value={form.pacchetto}
                onChange={handleChange}
              >
                {PACCHETTI.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field full">
              <Field
                id="messaggio"
                label="Qualche riga sulla tua situazione"
                error={errors.messaggio}
              >
                <textarea
                  id="messaggio"
                  name="messaggio"
                  placeholder="Es. Ho un CV ma non ricevo risposte, sto cambiando settore, sono al primo lavoro..."
                  value={form.messaggio}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <div className="submit-row">
              <button type="submit" disabled={submitting}>
                {submitting ? "Invio in corso..." : "Invia richiesta"}
              </button>
              {status.message && (
                <span className={`status-msg ${status.type}`}>
                  {status.message}
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      <footer>
        <div className="wrap">
          Sassuolo (MO) — risposta garantita entro 24 ore
        </div>
      </footer>
    </>
  );
}
