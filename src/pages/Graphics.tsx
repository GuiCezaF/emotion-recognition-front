import { useState } from 'react';

import { DailyGraphic } from '../components/DailyGraphic';
import { MonthlyGraphic } from '../components/MonthlyGrapic';
import { YearlyGraphic } from '../components/YearlyGrapic';

export const Graphics = () => {
  const [activeTab, setActiveTab] = useState("Diário");

  const renderContent = () => {
    switch (activeTab) {
      case "Diário":
        return <DailyGraphic />;
      case "Mensal":
        return <MonthlyGraphic />;
      case "Anual":
        return <YearlyGraphic/>;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-white p-6 flex flex-col items-center">
      
      {/* Navbar */}
      <nav className="w-full flex justify-center mb-6">
        <ul className="flex space-x-8 bg-white px-6 py-4 rounded-2xl shadow-md">
          {["Diário", "Mensal", "Anual"].map((tab) => (
            <li
              key={tab}
              className={`font-semibold cursor-pointer ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </nav>

      {/* Conteúdo principal */}
      {renderContent()}
    </div>
  );
};
