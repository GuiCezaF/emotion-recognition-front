import { useEffect, useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { fetchEmotionData } from "../services/fetchEmotionData";
import type { EmotionData } from "../services/fetchEmotionData";
import { UnprocessedData } from "./UnprocessedData";

export const DailyGraphic = () => {
  const [data, setData] = useState<(EmotionData & { color: string })[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // "2025-10-25"
    // Next day pois o backend retorna os dados sem o timezone então chega sendo 00:00:00 o que da problema na query
    // TODO(gabas): brigar com o Guilherme para melhorar a query do backend

    const nextDay = new Date(new Date(today).setDate(new Date(today).getDate() + 1)).toISOString().split("T")[0];
    
    fetchEmotionData(today, nextDay)
      .then((res) => {
        const colored = res.map((item, i) => ({
          ...item,
          color: ["#ffd700", "#008f39", "#3d1931", "#ff4500", "#4169e1"][i % 5],
        }));
        setData(colored);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Emoções Diárias</h2>
      {data.length ? (
      <PieChart
        data={data}
        label={({ dataEntry }) => `${dataEntry.title} (${dataEntry.value}%)`}
        labelStyle={{ fontSize: "4px", fill: "#fff" }}
        className="w-[50vh]"
      />) : (
        <UnprocessedData/>
      )}
    </div>
  );
};
