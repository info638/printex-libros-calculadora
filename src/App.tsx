import { useState } from "react";

function Calculator() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Calculadora libros Printex</h1>
      <p>Configurador en construcción...</p>
    </div>
  );
}

function Admin() {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);

  if (!ok) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Acceso admin</h2>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => setOk(password === "Sena@2121")}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Backoffice Printex</h1>
      <p>Panel de control en construcción...</p>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;

  if (path === "/admin") return <Admin />;
  return <Calculator />;
}
