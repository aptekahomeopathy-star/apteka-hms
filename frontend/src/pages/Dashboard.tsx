import { useEffect, useState } from 'react'
import { Users, Calendar, IndianRupee, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { DashboardStats } from '../lib/types'
import { useAuth } from '../hooks/useAuth'

function StatCard({
  title, value, icon: Icon, color, link, prefix
}: {
  title: string
  value: string | number
  icon: any
  color: string
  link?: string
  prefix?: string
}) {
  const content = (
    <div className={`card flex items-center gap-4 hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  )
  return link ? <Link to={link}>{content}</Link> : content
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {user?.full_name || user?.username}!
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Patients" value={stats?.total_patients || 0} icon={Users} color="bg-blue-500" link="/patients" />
          <StatCard title="Today's Appointments" value={stats?.today_appointments || 0} icon={Calendar} color="bg-purple-500" link="/appointments" />
          <StatCard title="Today's Revenue" value={(stats?.today_revenue || 0).toFixed(0)} icon={IndianRupee} color="bg-green-500" prefix="₹" />
          <StatCard title="Pending Follow-ups" value={stats?.pending_followups || 0} icon={Clock} color="bg-orange-500" link="/appointments" />
          <StatCard title="Monthly Revenue" value={(stats?.monthly_revenue || 0).toFixed(0)} icon={TrendingUp} color="bg-teal-500" prefix="₹" />
          <StatCard title="Monthly Expenses" value={(stats?.monthly_expenses || 0).toFixed(0)} icon={TrendingDown} color="bg-red-500" prefix="₹" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/patients" className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center">
              <Users size={24} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">New Patient</span>
            </Link>
            <Link to="/appointments" className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center">
              <Calendar size={24} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Schedule Appointment</span>
            </Link>
            <Link to="/prescriptions" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-green-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span className="text-sm font-medium text-green-700">New Prescription</span>
            </Link>
            <Link to="/billing" className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center">
              <IndianRupee size={24} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Create Bill</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Monthly Revenue</span>
              </div>
              <span className="font-semibold text-green-600">₹{(stats?.monthly_revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Monthly Expenses</span>
              </div>
              <span className="font-semibold text-red-600">₹{(stats?.monthly_expenses || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Net Income</span>
              </div>
              <span className={`font-semibold ${(stats?.monthly_revenue || 0) - (stats?.monthly_expenses || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ₹{((stats?.monthly_revenue || 0) - (stats?.monthly_expenses || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
