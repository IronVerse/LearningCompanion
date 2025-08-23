import { useEffect, useRef } from "react";

export default function GoogleSignIn({ onSignIn }) {
  const divRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    function initialize() {
      // global google
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();
            if (res.ok) onSignIn?.(data);
            else console.error("Auth failed:", data);
          } catch (e) {
            console.error(e);
          }
        },
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(divRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        logo_alignment: "left",
      });

      // Optional: show One Tap
      window.google.accounts.id.prompt();
    }

    const src = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (!existing) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = initialize;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initialize();
    } else {
      existing.addEventListener("load", initialize, { once: true });
    }
  }, [onSignIn]);

  return <div ref={divRef} />;
}
