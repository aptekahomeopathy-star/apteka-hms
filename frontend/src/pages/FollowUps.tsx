import { useEffect, useState } from 'react'
import { CalendarCheck, Clock, User, Phone, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { Appointment } from '@/lib/types'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function FollowUps() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments', { params: { limit: 300 } })
      setAppointments(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const today = new Date().toDateString()
  const tomorrow = new Date(Date.now() + 86400000).toDateString()
  const thisWeekEnd = new Date(Date.now() + 7 * 86400000)

  const withFollowup = appointments.filter(a => a.follow_up_date && a.status !== 'cancelled')
  const todayFu = withFollowup.filter(a => new Date(a.follow_up_date!).toDateString() === today)
  const tomorrowFu = withFollowup.filter(a => new Date(a.follow_up_date!).toDateString() === tomorrow)
  const upcomingFu = withFollowup.filter(a => {
    const d = new Date(a.follow_up_date!)
    return d > new Date() && d <= thisWeekEnd && d.toDateString() !== today && d.toDateString() !== tomorrow
  })
  const overdueFu = withFollowup.filter(a => new Date(a.follow_up_date!) < new Date() && new Date(a.follow_up_date!).toDateString() !== today)

  const handleMarkCompleted = async (id: number) => {
    try {
      await api.put(`/appointments/${id}`, { status: 'completed' })
      toast.success('Marked as completed'); load()
    } catch { toast.error('Failed to update') }
  }

  const FollowUpCard = ({ appt, variant }: { appt: Appointment; variant?: 'overdue' | 'today' | 'upcoming' }) => (
    <Card className={cn(
      'border-0 shadow-sm hover:shadow-md transition-all',
      variant === 'overdue' && 'border-l-4 border-l-red-400',
      variant === 'today' && 'border-l-4 border-l-[#0F8B4C]',
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F8B4C]/10 text-[#0F8B4C] flex items-center justify-center font-bold shrink-0">
            {appt.patient?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900">{appt.patient?.name}</div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400 flex items-center gap-1"><User size={11} />{appt.patient?.patient_id}</span>
              {appt.patient?.phone && <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={11} />{appt.patient.phone}</span>}
              <span className="text-xs font-medium flex items-center gap-1 text-[#0B6CFB]">
                <CalendarCheck size={11} />Follow-up: {formatDate(appt.follow_up_date!)}
              </span>
            </div>
            {appt.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{appt.notes}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {variant === 'overdue' && <Badge variant="error" className="text-xs">Overdue</Badge>}
            {variant === 'today' && <Badge variant="success" className="text-xs">Today</Badge>}
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-[#0F8B4C] hover:bg-green-50"
              onClick={() => handleMarkCompleted(appt.id)}>
              <CheckCircle2 size={13} /> Done
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-0.5">{todayFu.length} today · {overdueFu.length} overdue</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) : (
          [
            { label: "Today's Follow-ups", value: todayFu.length, color: 'text-[#0F8B4C]', bg: 'bg-green-50' },
            { label: "Tomorrow", value: tomorrowFu.length, color: 'text-[#0B6CFB]', bg: 'bg-blue-50' },
            { label: "This Week", value: upcomingFu.length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: "Overdue", value: overdueFu.length, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg', s.bg, s.color)}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today ({todayFu.length})</TabsTrigger>
          <TabsTrigger value="upcoming">This Week ({upcomingFu.length + tomorrowFu.length})</TabsTrigger>
          <TabsTrigger value="overdue" className="data-[state=active]:text-red-600">Overdue ({overdueFu.length})</TabsTrigger>
          <TabsTrigger value="all">All ({withFollowup.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3">
          {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
            todayFu.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><CalendarCheck size={36} className="text-gray-200 mx-auto mb-2" /><p className="text-gray-400 text-sm">No follow-ups scheduled for today</p></CardContent></Card> :
            todayFu.map(a => <FollowUpCard key={a.id} appt={a} variant="today" />)
          }
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3">
          {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
            [...tomorrowFu, ...upcomingFu].length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><p className="text-gray-400 text-sm">No upcoming follow-ups this week</p></CardContent></Card> :
            [...tomorrowFu, ...upcomingFu].map(a => <FollowUpCard key={a.id} appt={a} variant="upcoming" />)
          }
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3">
          {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
            overdueFu.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><p className="text-gray-400 text-sm">No overdue follow-ups 🎉</p></CardContent></Card> :
            overdueFu.map(a => <FollowUpCard key={a.id} appt={a} variant="overdue" />)
          }
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) :
            withFollowup.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><p className="text-gray-400 text-sm">No follow-up appointments found</p></CardContent></Card> :
            withFollowup.map(a => <FollowUpCard key={a.id} appt={a} />)
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
