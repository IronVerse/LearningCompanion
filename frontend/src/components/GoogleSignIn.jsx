import { useEffect } from "react";

export default function GoogleSignIn({ onSignIn }) {
  const handleClick = () => {
    if (!window.google) {
      console.error("Google API not loaded yet");
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log("Google One Tap not displayed:", notification.getNotDisplayedReason());
      }
    });
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    function initialize() {
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

  return (
    <button
      className="google-signin flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md text-sm"
      onClick={handleClick}
    >
      <svg
        className="w-3 h-3 mr-2" 
        viewBox="0 0 533.5 544.3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M533.5 278.4c0-17.6-1.6-34.5-4.6-51H272v96.8h146.9c-6.3 33.8-25.4 62.4-54.2 81.5v67h87.5c51.1-47.1 80.3-116.2 80.3-194.3z"
          fill="#4285F4"
        />
        <path
          d="M272 544.3c73.2 0 134.7-24.3 179.6-66.2l-87.5-67c-24.3 16.3-55.3 25.8-92.1 25.8-70.8 0-130.7-47.9-152.3-112.3H30.6v70.6C75.7 478.3 168.8 544.3 272 544.3z"
          fill="#34A853"
        />
        <path
          d="M119.7 325.6c-8.5-25.4-8.5-52.9 0-78.3v-70.6H30.6c-29.5 58.6-29.5 127.8 0 186.4l89.1-37.5z"
          fill="#FBBC05"
        />
        <path
          d="M272 107.2c38.8 0 73.7 13.3 101.3 39.3l76-76C406.7 24.4 345.2 0 272 0 168.8 0 75.7 66 30.6 164.2l89.1 70.6C141.3 155.1 201.2 107.2 272 107.2z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
