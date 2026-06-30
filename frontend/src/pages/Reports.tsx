import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

const COLORS = ['#0F8B4C', '#0B6CFB', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [revenue, setRevenue] = useState<any[]>([])
  const [gender, setGender] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/analytics/monthly-revenue', { params: { year } }),
      api.get('/analytics/patient-gender-distribution'),
    ]).then(([r, g]) => {
      setRevenue(r.data)
      setGender(g.data.map((d: any) => ({ ...d, gender: d.gender ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1) : 'Unknown' })))
    }).finally(() => setLoading(false))
  }, [year])

  const totalRev = revenue.reduce((s, m) => s + m.revenue, 0)
  const maxRev = Math.max(...revenue.map(m => m.revenue))
  const bestMonth = revenue.find(m => m.revenue === maxRev)?.month || '—'
  const avgRev = totalRev / 12

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Practice performance insights</p>
        </div>
        <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
          <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Summary KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Annual Revenue', value: formatCurrency(totalRev), sub: `Year ${year}`, color: 'text-[#0F8B4C]' },
            { label: 'Monthly Average', value: formatCurrency(avgRev), sub: 'Per month', color: 'text-[#0B6CFB]' },
            { label: 'Best Month', value: bestMonth, sub: formatCurrency(maxRev), color: 'text-purple-600' },
            { label: 'Active Months', value: String(revenue.filter(m => m.revenue > 0).length), sub: 'With revenue', color: 'text-amber-600' },
          ].map(kpi => (
            <Card key={kpi.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1.5 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Monthly Revenue — {year}</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 rounded-xl" /> : revenue.every(m => m.revenue === 0) ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No revenue data for {year}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F8B4C" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0F8B4C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#0F8B4C" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#0F8B4C', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Patient Gender Split</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 rounded-xl" /> : gender.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No patient data</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={gender} cx="50%" cy="45%" innerRadius={60} outerRadius={85} dataKey="count" nameKey="gender">
                    {gender.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend formatter={(v) => <span className="text-xs text-gray-600 capitalize">{v}</span>} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly breakdown table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Monthly Revenue Breakdown</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48 rounded-xl" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Month</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Revenue</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">% of Annual</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 hidden sm:table-cell">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {revenue.map(m => (
                    <tr key={m.month} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-sm font-medium text-gray-700">{m.month} {year}</td>
                      <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(m.revenue)}</td>
                      <td className="py-3 text-right text-sm text-gray-500">{totalRev > 0 ? ((m.revenue / totalRev) * 100).toFixed(1) : 0}%</td>
                      <td className="py-3 hidden sm:table-cell">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-[#0F8B4C] rounded-full transition-all" style={{ width: maxRev > 0 ? `${(m.revenue / maxRev) * 100}%` : '0%' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
