import { type Direction } from "../utils/gameLogic";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

interface GameResponse {
  id?: string;
  _id?: string;
  state: string;
  grid: (number | null)[][];
}

async function handleResponse(response: Response) {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.detail ?? body?.errors ?? response.statusText;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return body as GameResponse;
}

export async function createGame(size: number): Promise<GameResponse> {
  const response = await fetch(`${API_BASE_URL}/game/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ size }),
  });

  return handleResponse(response);
}

export async function getGame(id: string): Promise<GameResponse> {
  const response = await fetch(`${API_BASE_URL}/game/get?id=${encodeURIComponent(id)}`);
  return handleResponse(response);
}

export async function moveGame(id: string, direction: Direction): Promise<GameResponse> {
  const response = await fetch(`${API_BASE_URL}/game/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, direction }),
  });

  return handleResponse(response);
}
