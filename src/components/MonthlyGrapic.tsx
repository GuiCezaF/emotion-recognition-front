import { PieChart } from 'react-minimal-pie-chart';

export const MonthlyGraphic = () => {
  return (
    <div className="rounded-2xl p-8 w-[50vh] flex flex-col items-center justify-center bg-white">
        <h2 className="text-4xl font-semibold mb-6 text-gray-700">
          Emoções Mensal
        </h2>

        <PieChart
          className="h-[40vh] w-full"
          label={({ dataEntry }) =>
            `${dataEntry.title} (${Math.round(dataEntry.percentage)}%)`
          }
          labelStyle={{
            fill: 'white',
            fontSize: '5px',
            fontFamily: 'Helvetica Neue, sans-serif',
            textShadow: '1px 1px 5px #000',
          }}
          labelPosition={75}
          data={[
            { title: 'Happy', value: 25, color: '#ffd700' },
            { title: 'Sad', value: 50, color: '#0000ff' },
            { title: 'Angry', value: 25, color: '#f00' },
          ]}
        />
      </div>
  )
}
