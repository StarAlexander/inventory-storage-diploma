"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import UsersByRoleChart from "@/components/UsersByRoleChart";
import ObjectsByCategoryChart from "@/components/ObjectsByCategoryChart";
import AvgCostByCategoryChart from "@/components/AvgCostByCategoryChart";
import Link from "next/link";

export default function Reports() {
    const [reportData, setReportData] = useState<any>(null);
    const [usersByRoleData,setUsersByRoleData] = useState<any>(null)
    const [economicMetricsData,setEconomicMetricsData] = useState<any>(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchReport = async () => {
            if (!session) {
                router.push("/login");
                return;
            }

            try {
                const response = await fetchWithAuth("http://backend:8000/reports/general");
                if (!response.ok) setError(await response.text())
                else setReportData(await response.json());

                const usersByRoleResponse = await fetchWithAuth("http://backend:8000/reports/users-by-role")
                if (!usersByRoleResponse.ok) setError(await response.text())
                else setUsersByRoleData(await usersByRoleResponse.json())
                
                const economicMetricsResponse = await fetchWithAuth("http://backend:8000/reports/economic-metrics")
                if (!economicMetricsResponse.ok) setError(await response.text())
                else setEconomicMetricsData(await economicMetricsResponse.json())
            } catch (err:any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [session, router]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Отчетность</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-500 ease-out duration-100"><Link href={"/users"}>Количество пользователей</Link></h2>
                    <p className="text-2xl font-bold text-gray-600">{reportData.user_count}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-500 ease-out duration-100"><Link href={"/objects"}>Количество объектов</Link></h2>
                    <p className="text-2xl font-bold text-gray-600">{reportData.object_count}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-500 ease-out duration-100"><Link href={"/organizations"}>Количество организаций</Link></h2>
                    <p className="text-2xl font-bold text-gray-600">{reportData.organization_count}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-500 ease-out duration-100"><Link href={"/departments"}>Количество отделов</Link></h2>
                    <p className="text-2xl font-bold text-gray-600">{reportData.department_count}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-500 ease-out duration-100"><Link href={"/categories"}>Количество категорий объектов</Link></h2>
                    <p className="text-2xl font-bold text-gray-600">{reportData.category_count}</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Количество пользователей по ролям</h2>
                <UsersByRoleChart data={usersByRoleData} />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Количество объектов по категориям</h2>
                <ObjectsByCategoryChart data={economicMetricsData.objects_by_category} />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Средняя стоимость объектов по категориям</h2>
                <AvgCostByCategoryChart data={economicMetricsData.avg_cost_by_category} />
            </div>
        </div>
    );
}