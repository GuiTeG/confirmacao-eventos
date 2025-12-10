// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

// GET /api/eventos (lista)
export async function listarEventos(usuarioId) {
  const url = usuarioId
    ? `${API_BASE_URL}/api/eventos?usuarioId=${usuarioId}`
    : `${API_BASE_URL}/api/eventos`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao carregar eventos");
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.eventos)) return data.eventos;
  return [];
}

// POST /api/eventos (criar)
export async function criarEvento(eventData) {
  const res = await fetch(`${API_BASE_URL}/api/eventos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao criar evento");
  }

  return data.evento || data;
}

// GET /api/eventos/:id  (buscar 1 evento)
export async function buscarEvento(id) {
  const res = await fetch(`${API_BASE_URL}/api/eventos/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao carregar evento");
  }

  return data.evento || data;
}

// POST /api/eventos/:id/confirmacoes  (convidado confirma presença)
export async function confirmarPresenca(eventoId, payload) {
  const res = await fetch(
    `${API_BASE_URL}/api/eventos/${eventoId}/confirmacoes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao confirmar presença");
  }

  return data.confirmacao || data;
}

// DELETE /api/eventos/:id?usuarioId=...
export async function deletarEvento(eventId, usuarioId) {
  const url = `${API_BASE_URL}/api/eventos/${eventId}?usuarioId=${usuarioId}`;

  const res = await fetch(url, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao excluir evento");
  }

  return data;
}
