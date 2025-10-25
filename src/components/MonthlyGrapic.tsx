import { useEffect, useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { fetchEmotionData } from "../services/fetchEmotionData";
import type { EmotionData } from "../services/fetchEmotionData";

export const MonthlyGraphic = () => {
  const [data, setData] = useState<(EmotionData & { color: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    fetchEmotionData(start, end)
      .then((res) => {
        const colored = res.map((item, i) => ({
          ...item,
          color: ["#ff6f61", "#6a0572", "#0077b6", "#ffd700"][i % 4],
        }));
        setData(colored);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Emoções Mensais</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : data.length ? (
        <PieChart
          data={data}
          label={({ dataEntry }) => `${dataEntry.title} (${dataEntry.value}%)`}
          labelStyle={{ fontSize: "6px", fill: "#fff" }}
        />
      ) : (
        <p>Nenhum dado disponível</p>
      )}
    </div>
  );
};
