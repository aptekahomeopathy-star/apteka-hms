import { useEffect, useState } from 'react'
import { Plus, FileText, Search } from 'lucide-react'
import api from '../lib/api'
import { Prescription, Patient } from '../lib/types'
import toast from 'react-hot-toast'

function PrescriptionModal({ rx, onClose, onSave }: { rx: Prescription | null; onClose: () => void; onSave: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState({
    patient_id: rx?.patient_id?.toString() || '',
    chief_complaint: rx?.chief_complaint || '',
    symptoms: rx?.symptoms || '',
    miasmatic_analysis: rx?.miasmatic_analysis || '',
    repertorization: rx?.repertorization || '',
    medicine_name: rx?.medicine_name || '',
    potency: rx?.potency || '',
    dosage: rx?.dosage || '',
    frequency: rx?.frequency || '',
    duration: rx?.duration || '',
    diet_advice: rx?.diet_advice || '',
    follow_up_instructions: rx?.follow_up_instructions || '',
    notes: rx?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/patients', { params: { limit: 500 } }).then(r => setPatients(r.data))
  }, [])

  const f = (field: string) => ({
    value: (form as any)[field],
    onChange: (e: any) => setForm({ ...form, [field]: e.target.value })
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, patient_id: parseInt(form.patient_id) }
      if (rx) {
        await api.put(`/prescriptions/${rx.id}`, data)
        toast.success('Prescription updated')
      } else {
        await api.post('/prescriptions', data)
        toast.success('Prescription saved')
      }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving prescription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{rx ? 'Edit Prescription' : 'New Prescription'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select className="input-field" {...f('patient_id')} required>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Chief Complaint</label>
              <textarea className="input-field" rows={2} {...f('chief_complaint')} placeholder="Main complaint" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Symptoms</label>
              <textarea className="input-field" rows={3} {...f('symptoms')} placeholder="Detailed symptoms (modalities, sensations...)" />
            </div>
            <div>
              <label className="label">Miasmatic Analysis</label>
              <textarea className="input-field" rows={2} {...f('miasmatic_analysis')} placeholder="Psora / Sycosis / Syphilis / Tubercular" />
            </div>
            <div>
              <label className="label">Repertorization</label>
              <textarea className="input-field" rows={2} {...f('repertorization')} placeholder="Rubrics used" />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Medicine Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Medicine Name</label>
                <input className="input-field" {...f('medicine_name')} placeholder="e.g., Natrum Mur" />
              </div>
              <div>
                <label className="label">Potency</label>
                <input className="input-field" {...f('potency')} placeholder="e.g., 30C, 200C, 1M" />
              </div>
              <div>
                <label className="label">Dosage</label>
                <input className="input-field" {...f('dosage')} placeholder="e.g., 4 pills" />
              </div>
              <div>
                <label className="label">Frequency</label>
                <input className="input-field" {...f('frequency')} placeholder="e.g., Once daily" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Duration</label>
                <input className="input-field" {...f('duration')} placeholder="e.g., 1 month" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Diet Advice</label>
            <textarea className="input-field" rows={2} {...f('diet_advice')} placeholder="Dietary recommendations, food to avoid" />
          </div>
          <div>
            <label className="label">Follow-up Instructions</label>
            <textarea className="input-field" rows={2} {...f('follow_up_instructions')} placeholder="Follow-up instructions" />
          </div>
          <div>
            <label className="label">Additional Notes</label>
            <textarea className="input-field" rows={2} {...f('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : rx ? 'Update' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editRx, setEditRx] = useState<Prescription | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/prescriptions', { params: { limit: 200 } })
      setPrescriptions(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = prescriptions.filter(r =>
    !search ||
    r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.medicine_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 text-sm mt-1">{prescriptions.length} prescriptions</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditRx(null); setShowModal(true) }}>
          <Plus size={18} /> New Prescription
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input-field pl-10" placeholder="Search by patient or medicine..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rx => (
            <div key={rx.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold shrink-0">
                    {rx.patient?.name?.[0] || 'P'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{rx.patient?.name}</div>
                    <div className="text-xs text-gray-500">{new Date(rx.prescription_date).toLocaleDateString('en-IN')}</div>
                    {rx.chief_complaint && <p className="text-sm text-gray-600 mt-1">{rx.chief_complaint}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {rx.medicine_name && (
                    <div className="font-medium text-green-700">{rx.medicine_name}</div>
                  )}
                  {rx.potency && <div className="text-xs text-gray-500">{rx.potency} · {rx.dosage}</div>}
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button className="text-sm text-green-600 hover:text-green-700 font-medium"
                  onClick={() => { setEditRx(rx); setShowModal(true) }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PrescriptionModal rx={editRx} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />
      )}
    </div>
  )
}
