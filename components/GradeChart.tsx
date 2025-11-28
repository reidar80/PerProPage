import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RESUME_DATA } from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GradeChart: React.FC = () => {
  // 1. Parse Data
  const gradeMap: Record<string, number> = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };
  const rawData: { year: number; semester: string; grade: number }[] = [];

  RESUME_DATA.education.forEach(edu => {
    // Only parse English description for data consistency
    const desc = edu.description?.en || "";
    const lines = desc.split('\n');
    lines.forEach(line => {
      // Regex to match "Semester Year" and "Grade X" e.g., (Spring 2025) - Grade A
      const match = line.match(/\((Spring|Autumn|Fall)\s+(\d{4})\)\s*-\s*Grade\s*([A-F])/i);
      if (match) {
        let semester = match[1];
        if (semester === 'Fall') semester = 'Autumn'; // Normalize
        const year = parseInt(match[2]);
        const gradeChar = match[3].toUpperCase();
        const grade = gradeMap[gradeChar];
        
        // Filter: Since Fall 2020 (Autumn 2020)
        // Autumn 2020 is valid. Spring 2020 is not.
        if (year > 2020 || (year === 2020 && semester === 'Autumn')) {
           rawData.push({ year, semester, grade });
        }
      }
    });
  });

  // 2. Aggregate Averages per Semester
  const periods: Record<string, { total: number; count: number; sortKey: number }> = {};

  rawData.forEach(item => {
    const label = `${item.semester} ${item.year}`;
    // Sort Key: Year + Semester Weight (Spring=1, Autumn=2)
    const sortKey = item.year * 10 + (item.semester === 'Autumn' ? 2 : 1);
    
    if (!periods[label]) {
      periods[label] = { total: 0, count: 0, sortKey };
    }
    periods[label].total += item.grade;
    periods[label].count += 1;
  });

  // 3. Format for Chart
  const sortedData = Object.keys(periods)
    .map(label => ({
      label,
      avg: periods[label].total / periods[label].count,
      sortKey: periods[label].sortKey
    }))
    .sort((a, b) => a.sortKey - b.sortKey);

  const labels = sortedData.map(d => d.label);
  const dataPoints = sortedData.map(d => d.avg);

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Grade (A=5, E=1)',
        data: dataPoints,
        borderColor: 'rgb(37, 99, 235)', // Blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        pointBackgroundColor: 'rgb(255, 255, 255)',
        pointBorderColor: 'rgb(37, 99, 235)',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.3, // Curve the line slightly
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Average Grade Performance (Since Autumn 2020)',
        font: {
          size: 14,
          weight: 'bold',
        },
        padding: {
          bottom: 20
        },
        color: '#374151' // Gray-700
      },
      tooltip: {
        callbacks: {
          label: (context) => `Avg Grade: ${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        min: 2,
        max: 5.5,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            if (value === 5) return 'A (5)';
            if (value === 4) return 'B (4)';
            if (value === 3) return 'C (3)';
            if (value === 2) return 'D (2)';
            return '';
          }
        },
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  return (
    <div className="w-full h-[350px] bg-white p-4 rounded-xl shadow-lg border border-gray-200 mt-6">
      <Line data={data} options={options} />
    </div>
  );
};

export default GradeChart;
