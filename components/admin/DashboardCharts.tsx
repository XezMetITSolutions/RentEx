'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
    { month: 'Jan', revenue: 12500, rentals: 45 },
    { month: 'Feb', revenue: 15000, rentals: 52 },
    { month: 'Mär', revenue: 18200, rentals: 61 },
    { month: 'Apr', revenue: 14500, rentals: 48 },
    { month: 'Mai', revenue: 21000, rentals: 68 },
    { month: 'Jun', revenue: 24500, rentals: 75 },
];

const categoryData = [
    { name: 'Kleinwagen', value: 35, color: '#3B82F6' },
    { name: 'Limousine', value: 28, color: '#8B5CF6' },
    { name: 'SUV', value: 22, color: '#10B981' },
    { name: 'Van', value: 15, color: '#F59E0B' },
];

const locationData = [
    { location: 'München', rentals: 145 },
    { location: 'Frankfurt', rentals: 132 },
    { location: 'Berlin', rentals: 128 },
    { location: 'Hamburg', rentals: 98 },
    { location: 'Köln', rentals: 87 },
];

export default function DashboardCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Umsatzentwicklung</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: any) => `€${value.toLocaleString('de-DE')}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            name="Umsatz (€)"
                            dot={{ fill: '#3B82F6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Rentals by Category */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vermietungen nach Kategorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Location Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Standort Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="location" stroke="#6B7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Bar dataKey="rentals" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Vermietungen" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
