import { useState } from "react";
import type { ChangeEvent, ReactNode, SubmitEvent } from "react";
import "../Questionario.css";
import { useAuthStore } from "../store/auth";
import Button from "../components/Button";
import { useMutation } from "@tanstack/react-query";
import { LogOut, PlusIcon } from "lucide-react";

const STEP_TITLES = [
  "Dati personali",
  "Obiettivo professionale",
  "Esperienze lavorative",
  "Formazione",
  "Competenze",
  "Extra e conferma finale",
] as const;

const CONTRATTO_OPTIONS = [
  "Tempo indeterminato",
  "Tempo determinato",
  "Stage",
  "Freelance",
] as const;

const SMART_WORKING_OPTIONS = ["Sì", "No", "Ibrido", "Indifferente"] as const;

const TRASFERIMENTO_OPTIONS = ["Sì", "No", "Solo alcune città"] as const;

const TRASFERTE_OPTIONS = ["Sì", "No"] as const;

interface PersonaliData {
  nome: string;
  email: string;
  telefono: string;
  citta: string;
}

interface ObiettivoData {
  ruolo: string;
  settore: string;
  aziendeTarget: string;
  contratto: string;
  smartWorking: string;
  trasferimento: string;
  rangeSalariale: string;
}

interface EsperienzaData {
  azienda: string;
  ruolo: string;
  periodoInizio: string;
  periodoFine: string;
  inCorso: boolean;
  settore: string;
  mansioni: string;
  risultati: string;
  tecnologie: string;
  responsabilita: string;
}

interface FormazioneData {
  scuolaSuperiore: string;
  indirizzo: string;
  annoDiploma: string;
  votoDiploma: string;
  universita: string;
  corsoLaurea: string;
  annoLaurea: string;
  votoLaurea: string;
  titoloTesi: string;
  masterCorsi: string;
}

interface CompetenzeData {
  tecniche: string;
  lingue: string;
  software: string;
  certificazioni: string;
  softSkills: string;
}

interface ExtraData {
  hobby: string;
  patente: string;
  disponibilitaTrasferte: string;
  portfolio: string;
  linkedin: string;
  annuncioLavoro: string;
  periodiInattivita: string;
  cosaNonInserire: string;
}

interface QuestionarioData {
  personali: PersonaliData;
  obiettivo: ObiettivoData;
  esperienze: EsperienzaData[];
  formazione: FormazioneData;
  competenze: CompetenzeData;
  extra: ExtraData;
}

type PersonaliErrors = Partial<Record<keyof PersonaliData, string>>;
type ObiettivoErrors = Partial<Record<keyof ObiettivoData, string>>;
type EsperienzaErrors = Partial<Record<keyof EsperienzaData, string>>;
type FormazioneErrors = Partial<Record<keyof FormazioneData, string>>;
type CompetenzeErrors = Partial<Record<keyof CompetenzeData, string>>;
type ExtraErrors = Partial<Record<keyof ExtraData, string>>;

interface QuestionarioErrors {
  personali?: PersonaliErrors;
  obiettivo?: ObiettivoErrors;
  esperienze?: EsperienzaErrors[];
  formazione?: FormazioneErrors;
  competenze?: CompetenzeErrors;
  extra?: ExtraErrors;
}

interface SectionDataMap {
  personali: PersonaliData;
  obiettivo: ObiettivoData;
  formazione: FormazioneData;
  competenze: CompetenzeData;
  extra: ExtraData;
}

type SectionKey = keyof SectionDataMap;

type OnSectionChange = <K extends SectionKey>(
  section: K,
  field: keyof SectionDataMap[K],
  value: string,
) => void;

type EsperienzaFieldValue = string | boolean;

type OnExperienceField = (
  index: number,
  field: keyof EsperienzaData,
  value: EsperienzaFieldValue,
) => void;

function emptyEsperienza(): EsperienzaData {
  return {
    azienda: "",
    ruolo: "",
    periodoInizio: "",
    periodoFine: "",
    inCorso: false,
    settore: "",
    mansioni: "",
    risultati: "",
    tecnologie: "",
    responsabilita: "",
  };
}

function validateStep(
  step: number,
  data: QuestionarioData,
): QuestionarioErrors {
  if (step === 0) {
    const p = data.personali;
    const e: PersonaliErrors = {};
    if (!p.nome.trim()) e.nome = "Inserisci nome e cognome";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()))
      e.email = "Inserisci un'email valida";
    if (!p.telefono.trim()) e.telefono = "Inserisci un numero di telefono";
    if (!p.citta.trim()) e.citta = "Indica città e provincia";
    return { personali: e };
  }

  if (step === 1) {
    const o = data.obiettivo;
    const e: ObiettivoErrors = {};
    if (!o.ruolo.trim()) e.ruolo = "Indica il ruolo che stai cercando";
    if (!o.settore.trim()) e.settore = "Indica il settore";
    if (!o.contratto) e.contratto = "Seleziona un'opzione";
    if (!o.smartWorking) e.smartWorking = "Seleziona un'opzione";
    if (!o.trasferimento) e.trasferimento = "Seleziona un'opzione";
    return { obiettivo: e };
  }

  if (step === 2) {
    const primo = data.esperienze[0];
    const e0: EsperienzaErrors = {};
    if (!primo.azienda.trim()) e0.azienda = "Indica l'azienda";
    if (!primo.ruolo.trim()) e0.ruolo = "Indica il ruolo";
    return { esperienze: [e0] };
  }

  if (step === 3) {
    const f = data.formazione;
    const e: FormazioneErrors = {};
    if (!f.scuolaSuperiore.trim())
      e.scuolaSuperiore = "Indica la scuola superiore frequentata";
    return { formazione: e };
  }

  if (step === 4) {
    const c = data.competenze;
    const e: CompetenzeErrors = {};
    if (!c.tecniche.trim()) e.tecniche = "Descrivi le tue competenze tecniche";
    if (!c.lingue.trim()) e.lingue = "Indica le lingue parlate e il livello";
    if (!c.software.trim()) e.software = "Indica gli strumenti che usi";
    return { competenze: e };
  }

  const x = data.extra;
  const e: ExtraErrors = {};
  if (!x.disponibilitaTrasferte)
    e.disponibilitaTrasferte = "Seleziona un'opzione";
  return { extra: e };
}

function hasErrors(errors: QuestionarioErrors): boolean {
  return Object.values(errors).some((section) =>
    Array.isArray(section)
      ? section.some((item) => Object.keys(item).length > 0)
      : Object.keys(section ?? {}).length > 0,
  );
}

function riga(etichetta: string, valore: string, fallback = "—"): string {
  const testo = valore.trim() ? valore.trim() : fallback;
  return `${etichetta}: ${testo}`;
}

function buildMessage(data: QuestionarioData): string {
  const p = data.personali;
  const o = data.obiettivo;
  const f = data.formazione;
  const c = data.competenze;
  const x = data.extra;

  const esperienzeTesto = data.esperienze
    .map((exp, i) => {
      const periodo = `${exp.periodoInizio || "—"} → ${
        exp.inCorso ? "in corso" : exp.periodoFine || "—"
      }`;
      return [
        `--- Esperienza ${i + 1} ---`,
        riga("Azienda", exp.azienda),
        riga("Ruolo", exp.ruolo),
        `Periodo: ${periodo}`,
        riga("Settore azienda", exp.settore),
        riga("Mansioni principali", exp.mansioni),
        riga("Risultati ottenuti", exp.risultati),
        riga("Tecnologie/strumenti", exp.tecnologie),
        riga("Responsabilità (team, budget, progetti)", exp.responsabilita),
      ].join("\n");
    })
    .join("\n\n");

  const haUniversita = [
    f.universita,
    f.corsoLaurea,
    f.annoLaurea,
    f.votoLaurea,
  ].some((v) => v.trim());

  const blocoUniversita = haUniversita
    ? [
        riga("Università", f.universita),
        riga("Corso di laurea", f.corsoLaurea),
        riga("Anno di laurea", f.annoLaurea),
        riga("Voto di laurea", f.votoLaurea),
      ].join("\n")
    : "Università: non frequentata";

  return `
DATI PERSONALI
${riga("Nome e cognome", p.nome)}
${riga("Email", p.email)}
${riga("Telefono", p.telefono)}
${riga("Città e provincia", p.citta)}

OBIETTIVO PROFESSIONALE
${riga("Ruolo desiderato", o.ruolo)}
${riga("Settore", o.settore)}
${riga("Aziende target", o.aziendeTarget)}
${riga("Tipo di contratto", o.contratto)}
${riga("Smart working", o.smartWorking)}
${riga("Disponibilità a trasferirsi", o.trasferimento)}
${riga("Range salariale atteso", o.rangeSalariale)}

ESPERIENZE LAVORATIVE
${esperienzeTesto}

FORMAZIONE
${riga("Scuola superiore", f.scuolaSuperiore)}
${riga("Indirizzo", f.indirizzo)}
${riga("Anno diploma", f.annoDiploma)}
${riga("Voto diploma", f.votoDiploma)}
${blocoUniversita}
${riga("Titolo tesi", f.titoloTesi)}
${riga("Master / corsi post-laurea", f.masterCorsi)}

COMPETENZE
${riga("Competenze tecniche", c.tecniche)}
${riga("Lingue parlate", c.lingue)}
${riga("Software/strumenti", c.software)}
${riga("Certificazioni", c.certificazioni)}
${riga("Soft skills percepite", c.softSkills)}

EXTRA
${riga("Hobby e interessi", x.hobby)}
${riga("Patente di guida", x.patente)}
${riga("Disponibilità a trasferte", x.disponibilitaTrasferte)}
${riga("Portfolio/GitHub/Behance", x.portfolio)}
${riga("LinkedIn", x.linkedin)}
${riga("Annuncio di lavoro di riferimento", x.annuncioLavoro)}
${riga("Periodi di inattività da segnalare", x.periodiInattivita)}
${riga("Cosa non inserire nel CV", x.cosaNonInserire)}
`.trim();
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className={`q-field${error ? " invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="q-hint">{hint}</span>}
      {error && <span className="q-error-text">{error}</span>}
    </div>
  );
}

interface StepProps {
  data: QuestionarioData;
  errors: QuestionarioErrors;
  onChange: OnSectionChange;
}

function StepPersonali({ data, errors, onChange }: StepProps) {
  const p = data.personali;
  const e = errors.personali ?? {};

  return (
    <div className="q-step-grid">
      <Field id="nome" label="Nome e cognome" error={e.nome}>
        <input
          id="nome"
          type="text"
          value={p.nome}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("personali", "nome", ev.target.value)
          }
        />
      </Field>
      <Field id="email" label="Email" error={e.email}>
        <input
          id="email"
          type="email"
          value={p.email}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("personali", "email", ev.target.value)
          }
        />
      </Field>
      <Field id="telefono" label="Telefono" error={e.telefono}>
        <input
          id="telefono"
          type="tel"
          value={p.telefono}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("personali", "telefono", ev.target.value)
          }
        />
      </Field>
      <Field id="citta" label="Città e provincia" error={e.citta}>
        <input
          id="citta"
          type="text"
          placeholder="Es. Sassuolo (MO)"
          value={p.citta}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("personali", "citta", ev.target.value)
          }
        />
      </Field>
    </div>
  );
}

function StepObiettivo({ data, errors, onChange }: StepProps) {
  const o = data.obiettivo;
  const e = errors.obiettivo ?? {};

  return (
    <div className="q-step-grid">
      <Field id="ruolo" label="Ruolo o lavoro desiderato" error={e.ruolo}>
        <input
          id="ruolo"
          type="text"
          value={o.ruolo}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("obiettivo", "ruolo", ev.target.value)
          }
        />
      </Field>
      <Field id="settore" label="Settore" error={e.settore}>
        <input
          id="settore"
          type="text"
          value={o.settore}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("obiettivo", "settore", ev.target.value)
          }
        />
      </Field>
      <div className="q-field full">
        <label htmlFor="aziendeTarget">Aziende target (facoltativo)</label>
        <textarea
          id="aziendeTarget"
          value={o.aziendeTarget}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("obiettivo", "aziendeTarget", ev.target.value)
          }
        />
      </div>
      <Field
        id="contratto"
        label="Tipo di contratto desiderato"
        error={e.contratto}
      >
        <select
          id="contratto"
          value={o.contratto}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
            onChange("obiettivo", "contratto", ev.target.value)
          }
        >
          <option value="">Seleziona un'opzione</option>
          {CONTRATTO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <Field id="smartWorking" label="Smart working" error={e.smartWorking}>
        <select
          id="smartWorking"
          value={o.smartWorking}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
            onChange("obiettivo", "smartWorking", ev.target.value)
          }
        >
          <option value="">Seleziona un'opzione</option>
          {SMART_WORKING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id="trasferimento"
        label="Disponibilità a trasferirsi"
        error={e.trasferimento}
      >
        <select
          id="trasferimento"
          value={o.trasferimento}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
            onChange("obiettivo", "trasferimento", ev.target.value)
          }
        >
          <option value="">Seleziona un'opzione</option>
          {TRASFERIMENTO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <div className="q-field">
        <label htmlFor="rangeSalariale">
          Range salariale atteso (facoltativo)
        </label>
        <input
          id="rangeSalariale"
          type="text"
          placeholder="Es. 28.000-32.000 € lordi/anno"
          value={o.rangeSalariale}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("obiettivo", "rangeSalariale", ev.target.value)
          }
        />
      </div>
    </div>
  );
}

interface EsperienzaBlockProps {
  esperienza: EsperienzaData;
  index: number;
  error?: EsperienzaErrors;
  onField: (field: keyof EsperienzaData, value: EsperienzaFieldValue) => void;
  onRemove: () => void;
}

function EsperienzaBlock({
  esperienza,
  index,
  error,
  onField,
  onRemove,
}: EsperienzaBlockProps) {
  const e = error ?? {};

  return (
    <div className="q-block">
      <div className="q-block-head">
        <span className="q-block-title">Esperienza {index + 1}</span>
        {index > 0 && (
          <Button type="button" variant="link" onClick={onRemove}>
            Rimuovi
          </Button>
        )}
      </div>

      <div className="q-step-grid">
        <Field id={`azienda-${index}`} label="Azienda" error={e.azienda}>
          <input
            id={`azienda-${index}`}
            type="text"
            value={esperienza.azienda}
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              onField("azienda", ev.target.value)
            }
          />
        </Field>
        <Field id={`ruolo-${index}`} label="Ruolo" error={e.ruolo}>
          <input
            id={`ruolo-${index}`}
            type="text"
            value={esperienza.ruolo}
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              onField("ruolo", ev.target.value)
            }
          />
        </Field>

        <div className="q-field">
          <label htmlFor={`periodoInizio-${index}`}>Periodo — inizio</label>
          <input
            id={`periodoInizio-${index}`}
            type="month"
            value={esperienza.periodoInizio}
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              onField("periodoInizio", ev.target.value)
            }
          />
        </div>
        <div className="q-field">
          <label htmlFor={`periodoFine-${index}`}>Periodo — fine</label>
          <input
            id={`periodoFine-${index}`}
            type="month"
            disabled={esperienza.inCorso}
            value={esperienza.periodoFine}
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              onField("periodoFine", ev.target.value)
            }
          />
          <label className="q-checkbox">
            <input
              type="checkbox"
              checked={esperienza.inCorso}
              onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                onField("inCorso", ev.target.checked)
              }
            />
            Attualmente in corso
          </label>
        </div>

        <div className="q-field full">
          <label htmlFor={`settoreEsp-${index}`}>Settore dell'azienda</label>
          <input
            id={`settoreEsp-${index}`}
            type="text"
            value={esperienza.settore}
            onChange={(ev: ChangeEvent<HTMLInputElement>) =>
              onField("settore", ev.target.value)
            }
          />
        </div>
        <div className="q-field full">
          <label htmlFor={`mansioni-${index}`}>Mansioni principali</label>
          <textarea
            id={`mansioni-${index}`}
            value={esperienza.mansioni}
            onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
              onField("mansioni", ev.target.value)
            }
          />
        </div>
        <div className="q-field full">
          <label htmlFor={`risultati-${index}`}>
            Risultati ottenuti, con numeri se possibile
          </label>
          <textarea
            id={`risultati-${index}`}
            value={esperienza.risultati}
            onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
              onField("risultati", ev.target.value)
            }
          />
        </div>
        <div className="q-field full">
          <label htmlFor={`tecnologie-${index}`}>
            Tecnologie/strumenti/software usati
          </label>
          <textarea
            id={`tecnologie-${index}`}
            value={esperienza.tecnologie}
            onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
              onField("tecnologie", ev.target.value)
            }
          />
        </div>
        <div className="q-field full">
          <label htmlFor={`responsabilita-${index}`}>
            Responsabilità (team gestiti, budget, progetti coordinati)
          </label>
          <textarea
            id={`responsabilita-${index}`}
            value={esperienza.responsabilita}
            onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
              onField("responsabilita", ev.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}

interface StepEsperienzeProps {
  data: QuestionarioData;
  errors: QuestionarioErrors;
  onExperienceField: OnExperienceField;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

function StepEsperienze({
  data,
  errors,
  onExperienceField,
  onAdd,
  onRemove,
}: StepEsperienzeProps) {
  const experienceErrors = errors.esperienze ?? [];

  return (
    <div>
      {data.esperienze.map((exp, i) => (
        <EsperienzaBlock
          key={i}
          esperienza={exp}
          index={i}
          error={experienceErrors[i]}
          onField={(field, value) => onExperienceField(i, field, value)}
          onRemove={() => onRemove(i)}
        />
      ))}
      <Button
        type="button"
        onClick={onAdd}
        variant="secondary"
        icon={<PlusIcon size={16} />}
      >
        Aggiungi un'altra esperienza
      </Button>
    </div>
  );
}

function StepFormazione({ data, errors, onChange }: StepProps) {
  const f = data.formazione;
  const e = errors.formazione ?? {};

  return (
    <div className="q-step-grid">
      <Field
        id="scuolaSuperiore"
        label="Scuola superiore"
        error={e.scuolaSuperiore}
      >
        <input
          id="scuolaSuperiore"
          type="text"
          value={f.scuolaSuperiore}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "scuolaSuperiore", ev.target.value)
          }
        />
      </Field>
      <div className="q-field">
        <label htmlFor="indirizzo">Indirizzo (facoltativo)</label>
        <input
          id="indirizzo"
          type="text"
          value={f.indirizzo}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "indirizzo", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="annoDiploma">Anno diploma (facoltativo)</label>
        <input
          id="annoDiploma"
          type="text"
          value={f.annoDiploma}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "annoDiploma", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="votoDiploma">Voto (facoltativo)</label>
        <input
          id="votoDiploma"
          type="text"
          value={f.votoDiploma}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "votoDiploma", ev.target.value)
          }
        />
      </div>

      <div className="q-divider full">
        Università (facoltativo — salta questo blocco se non l'hai frequentata)
      </div>

      <div className="q-field">
        <label htmlFor="universita">Università</label>
        <input
          id="universita"
          type="text"
          value={f.universita}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "universita", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="corsoLaurea">Corso di laurea</label>
        <input
          id="corsoLaurea"
          type="text"
          value={f.corsoLaurea}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "corsoLaurea", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="annoLaurea">Anno laurea</label>
        <input
          id="annoLaurea"
          type="text"
          value={f.annoLaurea}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "annoLaurea", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="votoLaurea">Voto di laurea</label>
        <input
          id="votoLaurea"
          type="text"
          value={f.votoLaurea}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "votoLaurea", ev.target.value)
          }
        />
      </div>
      <div className="q-field full">
        <label htmlFor="titoloTesi">Titolo tesi (facoltativo)</label>
        <input
          id="titoloTesi"
          type="text"
          value={f.titoloTesi}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("formazione", "titoloTesi", ev.target.value)
          }
        />
      </div>
      <div className="q-field full">
        <label htmlFor="masterCorsi">
          Master/corsi post-laurea rilevanti (facoltativo)
        </label>
        <textarea
          id="masterCorsi"
          value={f.masterCorsi}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("formazione", "masterCorsi", ev.target.value)
          }
        />
      </div>
    </div>
  );
}

function StepCompetenze({ data, errors, onChange }: StepProps) {
  const c = data.competenze;
  const e = errors.competenze ?? {};

  return (
    <div className="q-step-grid">
      <div className="q-field full">
        <label htmlFor="tecniche">Competenze tecniche</label>
        <textarea
          id="tecniche"
          value={c.tecniche}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("competenze", "tecniche", ev.target.value)
          }
        />
        {e.tecniche && <span className="q-error-text">{e.tecniche}</span>}
      </div>
      <div className="q-field full">
        <label htmlFor="lingue">Lingue parlate e livello</label>
        <input
          id="lingue"
          type="text"
          placeholder="Es. Inglese B2, Francese A2"
          value={c.lingue}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("competenze", "lingue", ev.target.value)
          }
        />
        {e.lingue && <span className="q-error-text">{e.lingue}</span>}
      </div>
      <div className="q-field full">
        <label htmlFor="software">Software/strumenti padroneggiati</label>
        <textarea
          id="software"
          value={c.software}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("competenze", "software", ev.target.value)
          }
        />
        {e.software && <span className="q-error-text">{e.software}</span>}
      </div>
      <div className="q-field full">
        <label htmlFor="certificazioni">
          Certificazioni ottenute, con ente e anno (facoltativo)
        </label>
        <textarea
          id="certificazioni"
          value={c.certificazioni}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("competenze", "certificazioni", ev.target.value)
          }
        />
        {e.certificazioni && (
          <span className="q-error-text">{e.certificazioni}</span>
        )}
      </div>
      <div className="q-field full">
        <label htmlFor="softSkills">Soft skills percepite (facoltativo)</label>
        <textarea
          id="softSkills"
          value={c.softSkills}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("competenze", "softSkills", ev.target.value)
          }
        />
        {e.softSkills && <span className="q-error-text">{e.softSkills}</span>}
      </div>
    </div>
  );
}

function StepExtra({ data, errors, onChange }: StepProps) {
  const x = data.extra;
  const e = errors.extra ?? {};

  return (
    <div className="q-step-grid">
      <div className="q-field full">
        <label htmlFor="hobby">Hobby e interessi (facoltativo)</label>
        <input
          id="hobby"
          type="text"
          value={x.hobby}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("extra", "hobby", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="patente">Patente di guida (facoltativo)</label>
        <input
          id="patente"
          type="text"
          value={x.patente}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("extra", "patente", ev.target.value)
          }
        />
      </div>
      <Field
        id="disponibilitaTrasferte"
        label="Disponibilità a trasferte"
        error={e.disponibilitaTrasferte}
      >
        <select
          id="disponibilitaTrasferte"
          value={x.disponibilitaTrasferte}
          onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
            onChange("extra", "disponibilitaTrasferte", ev.target.value)
          }
        >
          <option value="">Seleziona un'opzione</option>
          {TRASFERTE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <div className="q-field">
        <label htmlFor="portfolio">
          Portfolio online / GitHub / Behance (facoltativo)
        </label>
        <input
          id="portfolio"
          type="text"
          value={x.portfolio}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("extra", "portfolio", ev.target.value)
          }
        />
      </div>
      <div className="q-field">
        <label htmlFor="linkedin">LinkedIn (facoltativo)</label>
        <input
          id="linkedin"
          type="text"
          value={x.linkedin}
          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
            onChange("extra", "linkedin", ev.target.value)
          }
        />
      </div>

      <div className="q-note full">
        Hai già un CV esistente? Inviamelo via email o WhatsApp separatamente:
        questo modulo non gestisce allegati.
      </div>

      <div className="q-field full">
        <label htmlFor="annuncioLavoro">
          Annuncio di lavoro specifico a cui rispondere (facoltativo)
        </label>
        <textarea
          id="annuncioLavoro"
          value={x.annuncioLavoro}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("extra", "annuncioLavoro", ev.target.value)
          }
        />
      </div>
      <div className="q-field full">
        <label htmlFor="periodiInattivita">
          Periodi di inattività da segnalare (facoltativo)
        </label>
        <textarea
          id="periodiInattivita"
          value={x.periodiInattivita}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("extra", "periodiInattivita", ev.target.value)
          }
        />
        <span className="q-hint">
          Serve solo per costruire una narrazione coerente nel CV, non verrà
          riportata così com'è.
        </span>
      </div>
      <div className="q-field full">
        <label htmlFor="cosaNonInserire">
          Cosa NON vuoi assolutamente inserire nel CV (facoltativo)
        </label>
        <textarea
          id="cosaNonInserire"
          value={x.cosaNonInserire}
          onChange={(ev: ChangeEvent<HTMLTextAreaElement>) =>
            onChange("extra", "cosaNonInserire", ev.target.value)
          }
        />
      </div>
    </div>
  );
}

interface Web3FormsResponse {
  success: boolean;
}

export default function Questionario() {
  const { user, logout } = useAuthStore();

  const EMPTY_QUESTIONARIO: QuestionarioData = {
    personali: {
      nome: user?.name ?? "",
      email: user?.email ?? "",
      telefono: "",
      citta: "",
    },
    obiettivo: {
      ruolo: "",
      settore: "",
      aziendeTarget: "",
      contratto: "",
      smartWorking: "",
      trasferimento: "",
      rangeSalariale: "",
    },
    esperienze: [emptyEsperienza()],
    formazione: {
      scuolaSuperiore: "",
      indirizzo: "",
      annoDiploma: "",
      votoDiploma: "",
      universita: "",
      corsoLaurea: "",
      annoLaurea: "",
      votoLaurea: "",
      titoloTesi: "",
      masterCorsi: "",
    },
    competenze: {
      tecniche: "",
      lingue: "",
      software: "",
      certificazioni: "",
      softSkills: "",
    },
    extra: {
      hobby: "",
      patente: "",
      disponibilitaTrasferte: "",
      portfolio: "",
      linkedin: "",
      annuncioLavoro: "",
      periodiInattivita: "",
      cosaNonInserire: "",
    },
  };

  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuestionarioData>(EMPTY_QUESTIONARIO);
  const [errors, setErrors] = useState<QuestionarioErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const accessKey: string | undefined = import.meta.env
    .VITE_WEB3FORMS_ACCESS_KEY;
  const isLastStep = step === STEP_TITLES.length - 1;

  const onChange: OnSectionChange = (section, field, value) => {
    setData((d) => ({
      ...d,
      [section]: { ...d[section], [field]: value },
    }));
    setErrors((err) => {
      const sectionErrors = err[section] as
        | Partial<Record<keyof SectionDataMap[typeof section], string>>
        | undefined;
      if (!sectionErrors || !sectionErrors[field]) return err;
      const next = { ...sectionErrors };
      delete next[field];
      return { ...err, [section]: next };
    });
  };

  const onExperienceField: OnExperienceField = (index, field, value) => {
    setData((d) => {
      const list = [...d.esperienze];
      list[index] = { ...list[index], [field]: value };
      return { ...d, esperienze: list };
    });
    setErrors((err) => {
      const experienceErrors = err.esperienze;
      if (!experienceErrors?.[index]?.[field]) return err;
      const list = [...experienceErrors];
      const next = { ...list[index] };
      delete next[field];
      list[index] = next;
      return { ...err, esperienze: list };
    });
  };

  function addEsperienza() {
    setData((d) => ({
      ...d,
      esperienze: [...d.esperienze, emptyEsperienza()],
    }));
  }

  function removeEsperienza(index: number) {
    setData((d) => ({
      ...d,
      esperienze: d.esperienze.filter((_, i) => i !== index),
    }));
    setErrors((err) => {
      if (!err.esperienze) return err;
      return {
        ...err,
        esperienze: err.esperienze.filter((_, i) => i !== index),
      };
    });
  }

  async function submitQuestionario() {
    if (!accessKey || accessKey === "inserisci_qui_la_tua_access_key") {
      setSubmitError(
        "Access key Web3Forms mancante: configurala nel file .env (vedi README).",
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Questionario CV — ${data.personali.nome}`,
          from_name: data.personali.nome,
          email: data.personali.email,
          message: buildMessage(data),
        }),
      });

      const result = (await res.json()) as Web3FormsResponse;

      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(
          "Qualcosa non ha funzionato. Riprova o scrivimi direttamente via email.",
        );
      }
    } catch {
      setSubmitError("Errore di connessione. Riprova tra poco.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const stepErrors = validateStep(step, data);

    if (hasErrors(stepErrors)) {
      setErrors((err) => ({ ...err, ...stepErrors }));
      return;
    }

    if (!isLastStep) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    submitQuestionario();
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <StepPersonali data={data} errors={errors} onChange={onChange} />
        );
      case 1:
        return (
          <StepObiettivo data={data} errors={errors} onChange={onChange} />
        );
      case 2:
        return (
          <StepEsperienze
            data={data}
            errors={errors}
            onExperienceField={onExperienceField}
            onAdd={addEsperienza}
            onRemove={removeEsperienza}
          />
        );
      case 3:
        return (
          <StepFormazione data={data} errors={errors} onChange={onChange} />
        );
      case 4:
        return (
          <StepCompetenze data={data} errors={errors} onChange={onChange} />
        );
      default:
        return <StepExtra data={data} errors={errors} onChange={onChange} />;
    }
  }

  const mutation = useMutation({
    mutationFn: logout,
  });

  const handleLogout = async () => await mutation.mutateAsync();

  return (
    <div className="questionario-page">
      <header className="q-header">
        <div className="wrap brand">
          <div>
            <div className="brand-name">Benvenuto {user?.name}</div>
            <div className="brand-tag">
              ora puoi compilare il questionario per l'avvio della lavorazione
              del CV
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            icon={<LogOut size={16} />}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Uscita in corso..." : "Esci"}
          </Button>
        </div>
      </header>

      <div className="wrap q-body">
        {submitted ? (
          <div className="q-confirmation">
            <div className="q-confirmation-icon" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1>Questionario ricevuto</h1>
            <p>
              Ho tutte le informazioni per iniziare. Ti aggiorno appena la prima
              bozza del tuo CV è pronta.
            </p>
          </div>
        ) : (
          <>
            <div className="q-progress">
              <div className="q-progress-label">
                Passo {step + 1} di {STEP_TITLES.length} — {STEP_TITLES[step]}
              </div>
              <div className="q-progress-bar">
                {STEP_TITLES.map((title, i) => (
                  <div
                    key={title}
                    className={`q-progress-seg${i <= step ? " done" : ""}`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleFormSubmit} noValidate>
              {renderStep()}

              <div className="q-nav">
                {step > 0 && (
                  <Button type="button" variant="secondary" onClick={goBack}>
                    Indietro
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {isLastStep
                    ? submitting
                      ? "Invio in corso..."
                      : "Invia questionario"
                    : "Avanti"}
                </Button>
                {submitError && (
                  <span className="q-status-msg err">{submitError}</span>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
