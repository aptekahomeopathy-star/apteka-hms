import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, FileText, Receipt } from 'lucide-react'
import api from '../lib/api'
import { Patient, Prescription, Bill, Appointment } from '../lib/types'

export default function PatientDetail() {
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tab, setTab] = useState<'overview' | 'prescriptions' | 'bills' | 'appointments'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get(`/patients/${id}`),
      api.get('/prescriptions', { params: { patient_id: id } }),
      api.get('/bills', { params: { patient_id: id } }),
      api.get('/appointments', { params: { limit: 50 } }),
    ]).then(([p, rx, b, a]) => {
      setPatient(p.data)
      setPrescriptions(rx.data)
      setBills(b.data)
      setAppointments(a.data.filter((apt: Appointment) => apt.patient_id === parseInt(id)))
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="card animate-pulse h-64" />
  if (!patient) return <div className="card text-center py-12 text-gray-500">Patient not found</div>

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'prescriptions', label: `Prescriptions (${prescriptions.length})` },
    { key: 'bills', label: `Bills (${bills.length})` },
    { key: 'appointments', label: `Appointments (${appointments.length})` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-500 text-sm">{patient.patient_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold">
              {patient.name[0]}
            </div>
            <div>
              <div className="font-semibold text-lg">{patient.name}</div>
              <div className="text-sm text-gray-500">{patient.age ? `${patient.age} years` : ''} {patient.gender ? `· ${patient.gender}` : ''}</div>
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {patient.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} />{patient.phone}</div>}
            {patient.email && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} />{patient.email}</div>}
            {patient.address && <div className="flex items-start gap-2 text-sm text-gray-600"><MapPin size={14} className="mt-0.5 shrink-0" />{patient.address}</div>}
            {patient.occupation && <div className="flex items-center gap-2 text-sm text-gray-600"><Briefcase size={14} />{patient.occupation}</div>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex border-b border-gray-200">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setTab(t.key as any)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {[
                { label: 'Chief Complaint', value: patient.chief_complaint },
                { label: 'Past History', value: patient.past_history },
                { label: 'Family History', value: patient.family_history },
                { label: 'Personal History', value: patient.personal_history },
              ].map(({ label, value }) => value ? (
                <div key={label} className="card p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
                </div>
              ) : null)}
            </div>
          )}

          {tab === 'prescriptions' && (
            <div className="space-y-3">
              {prescriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No prescriptions found</p>
              ) : prescriptions.map(rx => (
                <div key={rx.id} className="card p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-green-700">{rx.medicine_name || 'No medicine specified'}</span>
                    <span className="text-xs text-gray-500">{new Date(rx.prescription_date).toLocaleDateString('en-IN')}</span>
                  </div>
                  {rx.potency && <p className="text-sm text-gray-600">Potency: {rx.potency} · {rx.dosage} · {rx.frequency}</p>}
                  {rx.symptoms && <p className="text-sm text-gray-500 mt-1">{rx.symptoms}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'bills' && (
            <div className="space-y-3">
              {bills.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bills found</p>
              ) : bills.map(b => (
                <div key={b.id} className="card p-4 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{b.bill_number}</span>
                    <p className="text-xs text-gray-500">{new Date(b.bill_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">₹{Number(b.total_amount).toLocaleString()}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              ) : appointments.map(a => (
                <div key={a.id} className="card p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{new Date(a.appointment_date).toLocaleDateString('en-IN')}</div>
                    <div className="text-xs text-gray-500">{new Date(a.appointment_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === 'completed' ? 'bg-green-100 text-green-700' :
                    a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
