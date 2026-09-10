import { create } from "zustand";
import type { UserProps } from "../model/user";
import { supabase } from "../utils/supabase";

type State = {
  user: UserProps | null;
  loading: boolean;
};

type Action = {
  login: (params: {
    email: string;
    password: string;
  }) => Promise<{ error: string | null }>;
  signup: (params: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  modifyName: (newName: UserProps["name"]) => Promise<void>;
  hydrate: () => () => void;
};

const fetchProfile = async (authId: string): Promise<UserProps | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error || !data) return null;

  return { ...data, authId };
};

const ensureProfile = async (
  authId: string,
  email: string,
  fallbackName: string,
): Promise<UserProps> => {
  const existing = await fetchProfile(authId);

  if (existing) return existing;

  const { data, error } = await supabase
    .from("users")
    .insert([{ name: fallbackName, email, auth_id: authId }])
    .select("id, name, email")
    .single();

  if (error || !data) {
    console.error("Error creating profile:", error);

    return { authId, name: fallbackName, email };
  }

  return { ...data, authId };
};

export const useAuthStore = create<State & Action>()((set, get) => ({
  user: null,
  loading: true,
  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return { error: null };
  },
  signup: async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) return { error: error.message, needsConfirmation: false };

    if (data.session && data.user) {
      const profile = await ensureProfile(data.user.id, email, name);
      set({ user: profile });
      return { error: null, needsConfirmation: false };
    }

    // Email già registrata e già confermata in precedenza: per non rivelare
    // quali email esistono già, Supabase non restituisce un errore ma un
    // utente "finto" senza identità collegate. Va trattato come "esiste già".
    if (data.user && data.user.identities?.length === 0) {
      return { error: "User already registered", needsConfirmation: false };
    }

    return { error: null, needsConfirmation: true };
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  modifyName: async (newName) => {
    const { user } = get();
    
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ name: newName })
      .eq("auth_id", user.authId);

    if (error) {
      console.error("Error updating name:", error);
      return;
    }

    set({ user: { ...user, name: newName } });
  },
  hydrate: () => {
    // Sessione valida lato Supabase Auth ma senza più una riga in
    // public.users (es. rimossa manualmente dal Table Editor): non è un
    // account da "riparare" ricreandola, è un accesso non più autorizzato.
    const revokeSession = async () => {
      set({ user: null, loading: false });
      await supabase.auth.signOut();
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        set({ user: null, loading: false });
        return;
      }

      const profile = await fetchProfile(session.user.id);

      if (!profile) {
        await revokeSession();
        return;
      }

      set({ user: profile, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        set({ user: null });
        return;
      }

      // Solo un login/signup appena avvenuto in questa sessione può creare
      // il profilo se manca; ogni altro evento (refresh token, sessione
      // ripristinata) deve solo verificarlo.
      if (event === "SIGNED_IN") {
        const profile = await ensureProfile(
          session.user.id,
          session.user.email ?? "",
          session.user.user_metadata?.name ?? "",
        );
        set({ user: profile });
        return;
      }

      const profile = await fetchProfile(session.user.id);

      if (!profile) {
        await revokeSession();
        return;
      }

      set({ user: profile });
    });

    return () => subscription.unsubscribe();
  },
}));
