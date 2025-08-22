import { useState } from "react";
import GoogleSignIn from "./components/GoogleSignIn";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", gap: 16 }}>
      {user ? (
        <>
          <img
            src={user.picture}
            alt="avatar"
            style={{ width: 64, height: 64, borderRadius: "50%" }}
          />
          <p>Hello, {user.name}</p>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST", credentials: "include" });
              setUser(null);
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <GoogleSignIn onSignIn={setUser} />
      )}
    </main>
  );
}
