"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle first login
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(async () => {
          try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select()
              .eq("id", session.user.id)
              .single();

            if (!existingProfile) {
              // Create new profile with Google data
              await supabase.from("profiles").insert({
                id: session.user.id,
                full_name: session.user.user_metadata?.name,
                avatar_url: session.user.user_metadata?.picture,
                updated_at: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error("Error handling first login:", error);
          }
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
