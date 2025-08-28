"use client";

import React, { useState, useEffect, useTransition, useOptimistic } from "react";
import { useFormState, useFormStatus } from "react-dom";
import "./App.css";

// --- Server Action simulasi ---
async function registerParticipant(prevState, formData) {
  const name = formData.get("name")?.trim();
  const email = formData.get("email")?.trim();

  if (!name || !email) {
    return { error: "Nama dan Email wajib diisi!", success: false };
  }

  await new Promise((res) => setTimeout(res, 1500)); 

  return { success: true, participant: { name, email } };
}


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Mendaftar..." : "Daftar"}
    </button>
  );
}

export default function App() {
  const [participants, setParticipants] = useState([]);
  const [formState, formAction] = useFormState(registerParticipant, {
    success: false,
    error: null,
    participant: null,
  });

  const [isPending, startTransition] = useTransition();

  
  const [optimisticParticipants, addOptimistic] = useOptimistic(
    participants,
    (state, newParticipant) => [...state, newParticipant]
  );

  useEffect(() => {
    if (formState.success && formState.participant) {
      startTransition(() => {
        addOptimistic(formState.participant);
        setParticipants((prev) => [...prev, formState.participant]);
      });
    }
  }, [formState, addOptimistic, startTransition]);

  return (
    <div className="container">
      <h1>Formulir Pendaftaran Online</h1>

      <form action={formAction}>
        <label>
          Nama:
          <input type="text" name="name" placeholder="Masukkan nama" />
        </label>
        <label>
          Email:
          <input type="email" name="email" placeholder="Masukkan email" />
        </label>
        {formState.error && <p className="error">{formState.error}</p>}
        <SubmitButton />
      </form>

      {isPending && <p className="loading">⏳ Menyimpan data...</p>}

      <h2>Daftar Peserta</h2>
      <ul>
        {optimisticParticipants.map((p, idx) => (
          <li key={idx}>
            <strong>{p.name}</strong> - {p.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
