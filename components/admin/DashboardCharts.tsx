'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
    revenueData: any[];
    categoryData: any[];
    locationData: any[];
}

export default function DashboardCharts({ revenueData, categoryData, locationData }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Umsatzentwicklung</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.2} />
                        <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vermietungen nach Kategorie</h3>
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
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Location Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Standort Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.2} />
                        <XAxis dataKey="location" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
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
