import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Stethoscope, Calendar, Clock, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import api from '@/lib/api'
import { Appointment, Patient } from '@/lib/types'
import { formatDate, formatTime, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'error',
  no_show: 'warning',
}

function VisitForm({ visit, open, onClose, onSave }: { visit: Appointment | null; open: boolean; onClose: () => void; onSave: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState({ patient_id: '', appointment_date: '', status: 'scheduled', notes: '', follow_up_date: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/patients', { params: { limit: 500 } }).then(r => setPatients(r.data))
  }, [])

  useEffect(() => {
    if (visit) {
      setForm({
        patient_id: visit.patient_id?.toString() || '',
        appointment_date: visit.appointment_date ? new Date(visit.appointment_date).toISOString().slice(0, 16) : '',
        status: visit.status || 'scheduled',
        notes: visit.notes || '',
        follow_up_date: visit.follow_up_date || '',
      })
    } else {
      const now = new Date()
      now.setMinutes(0, 0, 0)
      setForm({ patient_id: '', appointment_date: now.toISOString().slice(0, 16), status: 'scheduled', notes: '', follow_up_date: '' })
    }
  }, [visit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, patient_id: parseInt(form.patient_id), follow_up_date: form.follow_up_date || null }
      if (visit) { await api.put(`/appointments/${visit.id}`, data); toast.success('Visit updated') }
      else { await api.post('/appointments', data); toast.success('Visit scheduled') }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving visit')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{visit ? 'Edit Visit' : 'Schedule New Visit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Patient *</Label>
            <Select value={form.patient_id} onValueChange={v => setForm({ ...form, patient_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.patient_id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date & Time *</Label>
            <Input type="datetime-local" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Follow-up Date</Label>
              <Input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Visit notes, chief complaint for this visit..." rows={3} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.patient_id}>{loading ? 'Saving...' : visit ? 'Update' : 'Schedule Visit'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Visits() {
  const [visits, setVisits] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [editVisit, setEditVisit] = useState<Appointment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => { if (searchParams.get('new')) setShowForm(true) }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments', { params: { limit: 300, status: statusFilter || undefined } })
      setVisits(res.data)
    } finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = visits.filter(v =>
    !search || v.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.patient?.patient_id?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this visit?')) return
    await api.delete(`/appointments/${id}`); toast.success('Visit deleted'); load()
  }

  const stats = { total: visits.length, scheduled: visits.filter(v => v.status === 'scheduled').length, completed: visits.filter(v => v.status === 'completed').length }

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{stats.scheduled} scheduled · {stats.completed} completed</p>
        </div>
        <Button onClick={() => { setEditVisit(null); setShowForm(true) }} className="gap-2 shrink-0">
          <Plus size={16} /> Schedule Visit
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input className="pl-9" placeholder="Search by patient..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'scheduled', 'completed', 'cancelled', 'no_show'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
              onClick={() => setStatusFilter(s)} className="text-xs h-8">
              {s || 'All'} {s === '' && `(${stats.total})`}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Stethoscope size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No visits found</p>
            <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}><Plus size={15} /> Schedule Visit</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(v => (
            <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0B6CFB]/10 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#0B6CFB]">{new Date(v.appointment_date).getDate()}</span>
                    <span className="text-[10px] text-[#0B6CFB]/70">{new Date(v.appointment_date).toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{v.patient?.name || 'Unknown'}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{formatTime(v.appointment_date)}</span>
                      <span className="text-xs text-gray-400">{v.patient?.patient_id}</span>
                      {v.follow_up_date && <span className="text-xs text-amber-600 font-medium">Follow-up: {v.follow_up_date}</span>}
                    </div>
                    {v.notes && <p className="text-xs text-gray-500 mt-1 truncate">{v.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={STATUS_STYLES[v.status] as any || 'outline'} className="text-xs capitalize">{v.status.replace('_', ' ')}</Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setEditVisit(v); setShowForm(true) }}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(v.id)}>Del</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VisitForm visit={editVisit} open={showForm} onClose={() => { setShowForm(false); setEditVisit(null) }} onSave={() => { setShowForm(false); setEditVisit(null); load() }} />
    </div>
  )
}
