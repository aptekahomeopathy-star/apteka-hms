import { useEffect, useState } from 'react'
import { Plus, Calendar, Clock, User } from 'lucide-react'
import api from '../lib/api'
import { Appointment, Patient } from '../lib/types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function AppointmentModal({ appt, onClose, onSave }: { appt: Appointment | null; onClose: () => void; onSave: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState({
    patient_id: appt?.patient_id?.toString() || '',
    appointment_date: appt?.appointment_date ? new Date(appt.appointment_date).toISOString().slice(0, 16) : '',
    status: appt?.status || 'scheduled',
    notes: appt?.notes || '',
    follow_up_date: appt?.follow_up_date || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/patients', { params: { limit: 500 } }).then(r => setPatients(r.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        patient_id: parseInt(form.patient_id),
        follow_up_date: form.follow_up_date || null,
      }
      if (appt) {
        await api.put(`/appointments/${appt.id}`, data)
        toast.success('Appointment updated')
      } else {
        await api.post('/appointments', data)
        toast.success('Appointment scheduled')
      }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{appt ? 'Edit Appointment' : 'Schedule Appointment'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select className="input-field" value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })} required>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date & Time *</label>
            <input type="datetime-local" className="input-field" value={form.appointment_date}
              onChange={e => setForm({ ...form, appointment_date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div>
            <label className="label">Follow-up Date</label>
            <input type="date" className="input-field" value={form.follow_up_date}
              onChange={e => setForm({ ...form, follow_up_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field" rows={3} value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : appt ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-700',
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editAppt, setEditAppt] = useState<Appointment | null>(null)
  const [filter, setFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments', { params: { limit: 200, status: filter || undefined } })
      setAppointments(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this appointment?')) return
    await api.delete(`/appointments/${id}`)
    toast.success('Appointment deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} appointments</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditAppt(null); setShowModal(true) }}>
          <Plus size={18} /> Schedule
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'scheduled', 'completed', 'cancelled', 'no_show'].map(s => (
          <button key={s} className={clsx('px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            filter === s ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50')}
            onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="card flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex flex-col items-center justify-center text-xs font-bold shrink-0">
                <span>{new Date(a.appointment_date).getDate()}</span>
                <span>{new Date(a.appointment_date).toLocaleString('en', { month: 'short' })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{a.patient?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(a.appointment_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {a.follow_up_date && <span className="ml-2 text-orange-600">Follow-up: {a.follow_up_date}</span>}
                </div>
              </div>
              <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', statusColors[a.status] || 'bg-gray-100 text-gray-700')}>
                {a.status}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg text-xs font-medium transition-colors"
                  onClick={() => { setEditAppt(a); setShowModal(true) }}>Edit</button>
                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                  onClick={() => handleDelete(a.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AppointmentModal appt={editAppt} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />
      )}
    </div>
  )
}
