import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../lib/api'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Analytics() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [genderDist, setGenderDist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [year] = useState(new Date().getFullYear())

  useEffect(() => {
    Promise.all([
      api.get('/analytics/monthly-revenue', { params: { year } }),
      api.get('/analytics/patient-gender-distribution'),
    ]).then(([r, g]) => {
      setMonthlyRevenue(r.data)
      setGenderDist(g.data.map((d: any) => ({
        ...d,
        gender: d.gender.charAt(0).toUpperCase() + d.gender.slice(1)
      })))
    }).finally(() => setLoading(false))
  }, [year])

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  const maxMonth = monthlyRevenue.reduce((max, m) => m.revenue > max.revenue ? m : max, { month: '-', revenue: 0 })

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-64 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Practice performance overview for {year}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-sm text-gray-500">Annual Revenue</div>
          <div className="text-3xl font-bold text-green-600 mt-1">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="card text-center">
          <div className="text-sm text-gray-500">Monthly Average</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">₹{(totalRevenue / 12).toFixed(0)}</div>
        </div>
        <div className="card text-center">
          <div className="text-sm text-gray-500">Best Month</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">{maxMonth.month}</div>
          <div className="text-sm text-gray-500">₹{maxMonth.revenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Revenue ({year})</h2>
          {totalRevenue === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>No revenue data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Patient Distribution by Gender</h2>
          {genderDist.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>No patient data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  nameKey="gender"
                  label={({ gender, count, percent }) => `${gender}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {genderDist.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h2>
        {totalRevenue === 0 ? (
          <div className="text-center py-8 text-gray-400">Start adding bills to see revenue trends</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500 font-medium">Month</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                  <th className="text-right py-2 text-gray-500 font-medium">% of Annual</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.filter(m => m.revenue > 0).map(m => (
                  <tr key={m.month} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 font-medium">{m.month} {year}</td>
                    <td className="py-2 text-right text-green-600 font-semibold">₹{m.revenue.toLocaleString()}</td>
                    <td className="py-2 text-right text-gray-500">{totalRevenue > 0 ? ((m.revenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
