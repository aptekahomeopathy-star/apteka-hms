import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Trash2, Users, Phone, User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import api from '@/lib/api'
import { Patient } from '@/lib/types'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', age: '', gender: '', phone: '', email: '', address: '', occupation: '',
  chief_complaint: '', past_history: '', family_history: '', personal_history: '',
}

function PatientForm({ patient, open, onClose, onSave }: { patient: Patient | null; open: boolean; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || '', age: patient.age?.toString() || '', gender: patient.gender || '',
        phone: patient.phone || '', email: patient.email || '', address: patient.address || '',
        occupation: patient.occupation || '', chief_complaint: patient.chief_complaint || '',
        past_history: patient.past_history || '', family_history: patient.family_history || '',
        personal_history: patient.personal_history || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [patient, open])

  const f = (field: string) => (val: string) => setForm(prev => ({ ...prev, [field]: val }))
  const fi = (field: string) => ({ value: (form as any)[field], onChange: (e: any) => setForm(prev => ({ ...prev, [field]: e.target.value })) })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, age: form.age ? parseInt(form.age) : null, gender: form.gender || null }
      if (patient) { await api.put(`/patients/${patient.id}`, data); toast.success('Patient updated') }
      else { await api.post('/patients', data); toast.success('Patient registered') }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving patient')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? 'Edit Patient' : 'Register New Patient'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Full Name *</Label>
              <Input {...fi('name')} required placeholder="Patient's full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input type="number" {...fi('age')} placeholder="Age in years" min="0" max="150" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={f('gender')}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...fi('phone')} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...fi('email')} placeholder="patient@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Occupation</Label>
              <Input {...fi('occupation')} placeholder="Occupation" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Textarea {...fi('address')} placeholder="Full address" rows={2} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Chief Complaint</Label>
              <Textarea {...fi('chief_complaint')} placeholder="Main presenting complaints" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Past History</Label>
              <Textarea {...fi('past_history')} placeholder="Past medical history, surgeries, allergies" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Family History</Label>
              <Textarea {...fi('family_history')} placeholder="Family medical history" rows={2} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Personal History</Label>
              <Textarea {...fi('personal_history')} placeholder="Diet, habits, lifestyle, occupation" rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : patient ? 'Update Patient' : 'Register Patient'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => { if (searchParams.get('new')) setShowForm(true) }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/patients', { params: { search: search || undefined, limit: 500 } })
      setPatients(res.data)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this patient and all their records?')) return
    try { await api.delete(`/patients/${id}`); toast.success('Patient deleted'); load() }
    catch { toast.error('Failed to delete patient') }
  }

  const genderBadge: Record<string, any> = { male: 'info', female: 'purple', other: 'warning' }

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{patients.length} patients registered</p>
        </div>
        <Button onClick={() => { setEditPatient(null); setShowForm(true) }} className="gap-2 shrink-0">
          <Plus size={16} /> New Patient
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input className="pl-9" placeholder="Search by name, phone, or patient ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : patients.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Users size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{search ? 'No patients match your search' : 'No patients registered yet'}</p>
            {!search && <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}><Plus size={15} /> Register First Patient</Button>}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Complaint</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Registered</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0F8B4C]/10 text-[#0F8B4C] flex items-center justify-center font-bold text-sm shrink-0">
                          {p.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-400">{p.patient_id}</span>
                            {p.age && <span className="text-xs text-gray-400">· {p.age}yr</span>}
                            {p.gender && <Badge variant={genderBadge[p.gender] || 'outline'} className="text-[10px] px-1.5 py-0 h-4">{p.gender}</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        {p.phone || <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{p.chief_complaint || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">{formatDate(p.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/patients/${p.id}`)} title="View"><Eye size={14} /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => { setEditPatient(p); setShowForm(true) }} title="Edit"><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(p.id)} title="Delete" className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PatientForm
        patient={editPatient}
        open={showForm}
        onClose={() => { setShowForm(false); setEditPatient(null) }}
        onSave={() => { setShowForm(false); setEditPatient(null); load() }}
      />
    </div>
  )
}
