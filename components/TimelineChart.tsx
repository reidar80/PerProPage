import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { RESUME_DATA } from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const TimelineChart: React.FC = () => {
  // Prepare data
  const jobs = [...RESUME_DATA.employmentHistory].reverse(); 
  
  const labels = jobs.map(j => j.company);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Employment Duration',
        data: jobs.map(j => {
          const start = new Date(j.startDate).getTime();
          const end = j.endDate === 'Present' ? new Date().getTime() : new Date(j.endDate).getTime();
          return [start, end];
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue-500 transparent
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        barPercentage: 0.5,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const raw = context.raw as [number, number];
            const start = new Date(raw[0]).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            const end = raw[1] > Date.now() - 86400000 ? 'Present' : new Date(raw[1]).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            return `${context.chart.data.labels?.[context.dataIndex]}: ${start} - ${end}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'year',
        },
        min: new Date('1999-01-01').getTime(),
        grid: {
          color: '#f3f4f6'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
            font: {
                size: 11
            }
        }
      }
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Career Timeline</h2>
      {/* Responsive Height: 300px mobile, 400px default */}
      <div className="h-[300px] sm:h-[400px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TimelineChart;