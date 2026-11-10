import { useEffect, useState } from "react";
import { apiGet } from "./api";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    apiGet("/api/health")
      .then((data) => setStatus(data.status))
      .catch((err) => setStatus(`error: ${err.message}`));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Campus Carpool</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}
