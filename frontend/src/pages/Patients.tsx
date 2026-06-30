import { useEffect, useState } from 'react'
import { Plus, Search, Eye, Edit, Trash2, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { Patient } from '../lib/types'
import toast from 'react-hot-toast'

function PatientModal({
  patient,
  onClose,
  onSave
}: {
  patient: Patient | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    name: patient?.name || '',
    age: patient?.age?.toString() || '',
    gender: patient?.gender || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    occupation: patient?.occupation || '',
    chief_complaint: patient?.chief_complaint || '',
    past_history: patient?.past_history || '',
    family_history: patient?.family_history || '',
    personal_history: patient?.personal_history || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, age: form.age ? parseInt(form.age) : null }
      if (patient) {
        await api.put(`/patients/${patient.id}`, data)
        toast.success('Patient updated')
      } else {
        await api.post('/patients', data)
        toast.success('Patient registered')
      }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving patient')
    } finally {
      setLoading(false)
    }
  }

  const f = (field: string) => ({
    value: (form as any)[field],
    onChange: (e: any) => setForm({ ...form, [field]: e.target.value })
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{patient ? 'Edit Patient' : 'Register New Patient'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Full Name *</label>
              <input className="input-field" {...f('name')} required placeholder="Patient name" />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input-field" {...f('age')} placeholder="Age in years" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" {...f('gender')}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" {...f('phone')} placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" {...f('email')} placeholder="patient@email.com" />
            </div>
            <div>
              <label className="label">Occupation</label>
              <input className="input-field" {...f('occupation')} placeholder="Occupation" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <textarea className="input-field" rows={2} {...f('address')} placeholder="Full address" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Chief Complaint</label>
              <textarea className="input-field" rows={2} {...f('chief_complaint')} placeholder="Main complaints" />
            </div>
            <div>
              <label className="label">Past History</label>
              <textarea className="input-field" rows={2} {...f('past_history')} placeholder="Past medical history" />
            </div>
            <div>
              <label className="label">Family History</label>
              <textarea className="input-field" rows={2} {...f('family_history')} placeholder="Family medical history" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Personal History</label>
              <textarea className="input-field" rows={2} {...f('personal_history')} placeholder="Diet, habits, lifestyle" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : patient ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)

  const loadPatients = async () => {
    setLoading(true)
    try {
      const res = await api.get('/patients', { params: { search: search || undefined, limit: 200 } })
      setPatients(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPatients() }, [search])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this patient?')) return
    try {
      await api.delete(`/patients/${id}`)
      toast.success('Patient deleted')
      loadPatients()
    } catch {
      toast.error('Failed to delete patient')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} patients registered</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => { setEditPatient(null); setShowModal(true) }}
        >
          <Plus size={18} /> New Patient
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Search by name, phone, or patient ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-16" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="card text-center py-12">
          <User size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No patients found</p>
          <button className="btn-primary mt-4" onClick={() => { setEditPatient(null); setShowModal(true) }}>
            Register First Patient
          </button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Chief Complaint</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {p.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.patient_id} · {p.age ? `${p.age}yr` : ''} {p.gender || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600">{p.phone || '-'}</td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600 max-w-xs truncate">{p.chief_complaint || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${p.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye size={16} />
                        </Link>
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit"
                          onClick={() => { setEditPatient(p); setShowModal(true) }}>
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"
                          onClick={() => handleDelete(p.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <PatientModal
          patient={editPatient}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadPatients() }}
        />
      )}
    </div>
  )
}
