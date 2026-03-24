import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * SessionSync component ensures that the Supabase auth token is stored in a cookie
 * that can be read by the Next.js middleware on the server side.
 * It listens to auth state changes and updates the cookie accordingly.
 */
export default function SessionSync() {
  useEffect(() => {
    // Initialize cookie with current session if available
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        document.cookie = `sb-beoqkvfymqhsavbebbcb-auth-token=${session.access_token}; path=/; SameSite=Lax;`;
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        document.cookie = `sb-beoqkvfymqhb...`;
      } else {
        document.cookie = "sb-beoqkvfymqhb...";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
