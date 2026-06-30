import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, IndianRupee, TrendingDown, TrendingUp, CalendarCheck,
  UserPlus, Stethoscope, FileText, Receipt, Wallet, CreditCard,
  Smartphone, AlertCircle, BarChart3, ArrowRight, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { DashboardStats } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { cn } from '@/lib/utils'

const COLORS = ['#0F8B4C', '#0B6CFB', '#f59e0b', '#ef4444']

function StatCard({
  title, value, icon: Icon, color, bg, change, prefix = '', onClick
}: {
  title: string; value: string | number; icon: any; color: string; bg: string;
  change?: string; prefix?: string; onClick?: () => void
}) {
  return (
    <Card
      className={cn('border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group', onClick && 'hover:-translate-y-0.5')}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5">
              {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </p>
            {change && (
              <p className="text-xs text-gray-400 mt-1">{change}</p>
            )}
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
            <Icon size={18} className={color} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({ label, icon: Icon, color, onClick }: { label: string; icon: any; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#0F8B4C]/30 hover:bg-[#0F8B4C]/5 transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 text-center leading-tight">{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [genderDist, setGenderDist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const year = new Date().getFullYear()
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/monthly-revenue', { params: { year } }),
      api.get('/analytics/patient-gender-distribution'),
    ]).then(([s, r, g]) => {
      setStats(s.data)
      setMonthlyRevenue(r.data)
      setGenderDist(g.data.map((d: any) => ({ ...d, gender: d.gender ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1) : 'Unknown' })))
    }).finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const profit = (stats?.monthly_revenue || 0) - (stats?.monthly_expenses || 0)

  const quickActions = [
    { label: 'New Patient', icon: UserPlus, color: 'bg-[#0F8B4C]', onClick: () => navigate('/patients?new=1') },
    { label: 'New Visit', icon: Stethoscope, color: 'bg-[#0B6CFB]', onClick: () => navigate('/visits?new=1') },
    { label: 'Write Rx', icon: FileText, color: 'bg-purple-500', onClick: () => navigate('/prescriptions?new=1') },
    { label: 'Create Bill', icon: Receipt, color: 'bg-amber-500', onClick: () => navigate('/billing?new=1') },
    { label: 'Receive Payment', icon: Wallet, color: 'bg-emerald-500', onClick: () => navigate('/payments') },
    { label: 'Add Expense', icon: TrendingDown, color: 'bg-red-500', onClick: () => navigate('/expenses?new=1') },
    { label: 'Search Patient', icon: Users, color: 'bg-slate-500', onClick: () => navigate('/patients') },
    { label: 'Daily Report', icon: BarChart3, color: 'bg-indigo-500', onClick: () => navigate('/reports') },
  ]

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {greeting()}, {user?.full_name?.split(' ')[0] || user?.username}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening at your clinic today.</p>
        </div>
        <Badge variant="success" className="hidden sm:flex gap-1 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F8B4C] animate-pulse" />
          Clinic Active
        </Badge>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard title="Today's Patients" value={stats?.today_appointments || 0} icon={Users} color="text-[#0F8B4C]" bg="bg-green-50" change="Visits today" onClick={() => navigate('/visits')} />
          <StatCard title="Today's Collection" value={formatCurrency(stats?.today_revenue || 0)} icon={IndianRupee} color="text-[#0B6CFB]" bg="bg-blue-50" change="All modes" onClick={() => navigate('/billing')} />
          <StatCard title="Cash Collection" value={formatCurrency((stats?.today_revenue || 0) * 0.6)} icon={CreditCard} color="text-amber-600" bg="bg-amber-50" change="Estimated" />
          <StatCard title="UPI Collection" value={formatCurrency((stats?.today_revenue || 0) * 0.4)} icon={Smartphone} color="text-purple-600" bg="bg-purple-50" change="Estimated" />
          <StatCard title="Pending Dues" value={formatCurrency(0)} icon={AlertCircle} color="text-red-500" bg="bg-red-50" change="Outstanding" onClick={() => navigate('/billing')} />
          <StatCard title="Today's Expenses" value={formatCurrency(0)} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" change="Today" onClick={() => navigate('/expenses')} />
          <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthly_revenue || 0)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" change="This month" onClick={() => navigate('/reports')} />
          <StatCard title="Monthly Profit" value={formatCurrency(profit)} icon={BarChart3} color={profit >= 0 ? "text-[#0F8B4C]" : "text-red-500"} bg={profit >= 0 ? "bg-green-50" : "bg-red-50"} change="Revenue - Expenses" />
          <StatCard title="Follow-ups Today" value={stats?.pending_followups || 0} icon={CalendarCheck} color="text-orange-600" bg="bg-orange-50" change="Scheduled" onClick={() => navigate('/followups')} />
          <StatCard title="New Patients/Month" value={stats?.total_patients || 0} icon={UserPlus} color="text-indigo-600" bg="bg-indigo-50" change="Total registered" onClick={() => navigate('/patients')} />
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {quickActions.map(qa => <QuickAction key={qa.label} {...qa} />)}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="border-0 shadow-sm xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Monthly Revenue — {new Date().getFullYear()}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="text-xs text-[#0F8B4C] h-7 gap-1">
                Full Report <ArrowRight size={12} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 rounded-xl" />
            ) : monthlyRevenue.every(m => m.revenue === 0) ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthlyRevenue} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} cursor={{ fill: '#f9fafb', radius: 8 }} />
                  <Bar dataKey="revenue" fill="#0F8B4C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Patient Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 rounded-xl" />
            ) : genderDist.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No patient data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={genderDist} cx="50%" cy="45%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="gender">
                    {genderDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Financial Overview</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="text-xs h-7 gap-1 text-[#0F8B4C]">
                View <ArrowRight size={12} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Monthly Revenue', value: stats?.monthly_revenue || 0, color: 'bg-green-500', text: 'text-green-600' },
              { label: 'Monthly Expenses', value: stats?.monthly_expenses || 0, color: 'bg-red-400', text: 'text-red-600' },
              { label: 'Net Profit', value: profit, color: profit >= 0 ? 'bg-blue-500' : 'bg-red-500', text: profit >= 0 ? 'text-blue-600' : 'text-red-600' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', item.color)} />
                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                <span className={cn('text-sm font-semibold', item.text)}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Clinic Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Users, label: 'Total Patients', value: stats?.total_patients || 0 },
              { icon: CalendarCheck, label: 'Pending Follow-ups', value: stats?.pending_followups || 0 },
              { icon: Clock, label: "Today's Visits", value: stats?.today_appointments || 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                  <item.icon size={14} className="text-gray-500" />
                </div>
                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
