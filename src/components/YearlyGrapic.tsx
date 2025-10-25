import { useEffect, useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { fetchEmotionData } from "../services/fetchEmotionData";
import type { EmotionData } from "../services/fetchEmotionData";

export const YearlyGraphic = () => {
  const [data, setData] = useState<(EmotionData & { color: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const year = new Date().getFullYear();
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    fetchEmotionData(start, end)
      .then((res) => {
        const colored = res.map((item, i) => ({
          ...item,
          color: ["#3d1931", "#ff9f1c", "#2ec4b6", "#e71d36"][i % 4],
        }));
        setData(colored);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-semibold mb-4">Emoções Anuais</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : data.length ? (
        <PieChart
          data={data}
          label={({ dataEntry }) => `${dataEntry.title} (${dataEntry.value}%)`}
          labelStyle={{ fontSize: 6, fill: "#fff" }}
          radius={40}
          labelPosition={60}
        />
      ) : (
        <p>Nenhum dado disponível</p>
      )}
    </div>
  );
};
