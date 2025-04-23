"use client"
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AvgCostByCategoryChart = ({ data }: {data:any}) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: "Средняя стоимость",
                data: Object.values(data),
                fill: false,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Средняя стоимость объектов по категориям",
            },
        },
    };

    return <Line data={chartData} options={options as any} />;
};

export default AvgCostByCategoryChart;