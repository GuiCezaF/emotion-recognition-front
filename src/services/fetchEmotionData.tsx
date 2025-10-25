const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://localhost:32769";

export type EmotionData = {
  title: string;
  value: number;
};

/**
 * Busca dados de emoções filtrados por data
 * @param start data inicial (YYYY-MM-DD)
 * @param end data final (YYYY-MM-DD)
 */
export async function fetchEmotionData(
  start: string,
  end: string
): Promise<EmotionData[]> {
  try {
    const url = new URL(`${BACKEND_URL}/emotions`);
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!Array.isArray(json)) throw new Error("Formato inválido do backend");
    
    return json as EmotionData[];
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    return [];
  }
}
