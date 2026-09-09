const KNOWN_AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email o password non corretti.",
  "User already registered": "Esiste già un account con questa email.",
  "Email not confirmed":
    "Devi confermare l'email prima di accedere: controlla la posta.",
  "Unable to validate email address: invalid format":
    "Inserisci un'email valida.",
  "Email rate limit exceeded":
    "Troppi tentativi con questa email. Riprova tra qualche minuto.",
  "Password should be at least 6 characters":
    "La password deve avere almeno 6 caratteri.",
};

export function translateAuthError(message: string): string {
  if (KNOWN_AUTH_ERRORS[message]) return KNOWN_AUTH_ERRORS[message];

  if (/security purposes.*after \d+ seconds/i.test(message)) {
    return "Hai riprovato troppo presto: attendi qualche secondo e riprova.";
  }

  return message;
}
