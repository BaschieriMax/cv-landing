const KNOWN_AUTH_ERRORS: Record<string, string> = {
  "invalid login credentials": "Email o password non corretti.",
  "user already registered": "Esiste già un account con questa email.",
  "email not confirmed":
    "Devi confermare l'email prima di accedere: controlla la posta.",
  "unable to validate email address: invalid format":
    "Inserisci un'email valida.",
  "email rate limit exceeded":
    "Troppe email inviate in poco tempo (conferme, reset password...). Riprova tra qualche minuto.",
  "password should be at least 6 characters":
    "La password deve avere almeno 6 caratteri.",
};

export function translateAuthError(message: string): string {
  const known = KNOWN_AUTH_ERRORS[message.trim().toLowerCase()];
  if (known) return known;

  if (/security purposes.*after \d+ seconds/i.test(message)) {
    return "Hai riprovato troppo presto: attendi qualche secondo e riprova.";
  }

  return message;
}
