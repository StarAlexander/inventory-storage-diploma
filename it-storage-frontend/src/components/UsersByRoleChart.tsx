"use client"
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UsersByRoleChart = ({ data }: {data:any}) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: "Количество пользователей",
                data: Object.values(data),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
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
                text: "Количество пользователей по ролям",
            },
        },
    };

    return <Bar data={chartData} options={options as any} />;
};

export default UsersByRoleChart;