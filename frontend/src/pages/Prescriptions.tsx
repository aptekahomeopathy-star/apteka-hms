import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, FileText, Search, Pill } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { Prescription, Patient } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const POTENCIES = ['6C', '12C', '30C', '200C', '1M', '10M', '50M', 'CM', '3X', '6X', '12X', '30X', 'Q']
const FREQUENCIES = ['Once daily', 'Twice daily', 'Thrice daily', 'Four times daily', 'Once weekly', 'Twice weekly', 'SOS', 'As needed']

const EMPTY = {
  patient_id: '', chief_complaint: '', symptoms: '', miasmatic_analysis: '', repertorization: '',
  medicine_name: '', potency: '', dosage: '', frequency: '', duration: '',
  diet_advice: '', follow_up_instructions: '', notes: ''
}

function PrescriptionForm({ rx, open, onClose, onSave }: { rx: Prescription | null; open: boolean; onClose: () => void; onSave: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/patients', { params: { limit: 500 } }).then(r => setPatients(r.data)) }, [])

  useEffect(() => {
    if (rx) {
      setForm({
        patient_id: rx.patient_id?.toString() || '',
        chief_complaint: rx.chief_complaint || '', symptoms: rx.symptoms || '',
        miasmatic_analysis: rx.miasmatic_analysis || '', repertorization: rx.repertorization || '',
        medicine_name: rx.medicine_name || '', potency: rx.potency || '',
        dosage: rx.dosage || '', frequency: rx.frequency || '', duration: rx.duration || '',
        diet_advice: rx.diet_advice || '', follow_up_instructions: rx.follow_up_instructions || '',
        notes: rx.notes || ''
      })
    } else setForm(EMPTY)
  }, [rx, open])

  const fi = (field: string) => ({ value: (form as any)[field], onChange: (e: any) => setForm(prev => ({ ...prev, [field]: e.target.value })) })
  const fs = (field: string) => (val: string) => setForm(prev => ({ ...prev, [field]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const data = { ...form, patient_id: parseInt(form.patient_id) }
      if (rx) { await api.put(`/prescriptions/${rx.id}`, data); toast.success('Prescription updated') }
      else { await api.post('/prescriptions', data); toast.success('Prescription saved') }
      onSave()
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Error saving')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rx ? 'Edit Prescription' : 'Write New Prescription'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Patient *</Label>
            <Select value={form.patient_id} onValueChange={fs('patient_id')}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.patient_id}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Chief Complaint</Label>
              <Input {...fi('chief_complaint')} placeholder="Main presenting complaint" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Symptoms (with Modalities)</Label>
              <Textarea {...fi('symptoms')} placeholder="Detailed symptoms, modalities (better/worse from), sensations, concomitants..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Miasmatic Analysis</Label>
              <Select value={form.miasmatic_analysis} onValueChange={fs('miasmatic_analysis')}>
                <SelectTrigger><SelectValue placeholder="Select miasm" /></SelectTrigger>
                <SelectContent>
                  {['Psora', 'Sycosis', 'Syphilis', 'Tubercular', 'Mixed (Psora-Sycosis)', 'Mixed (Psora-Syphilis)', 'Mixed (Tubercular)'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Repertorization Notes</Label>
              <Input {...fi('repertorization')} placeholder="Rubrics, repertory used" />
            </div>
          </div>

          <div className="bg-green-50/60 rounded-xl p-4 space-y-4 border border-green-100">
            <h3 className="text-sm font-semibold text-[#0F8B4C] flex items-center gap-2"><Pill size={14} />Medicine Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-1.5">
                <Label>Medicine Name</Label>
                <Input {...fi('medicine_name')} placeholder="e.g., Natrum Mur" />
              </div>
              <div className="space-y-1.5">
                <Label>Potency</Label>
                <Select value={form.potency} onValueChange={fs('potency')}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{POTENCIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dosage</Label>
                <Input {...fi('dosage')} placeholder="e.g., 4 pills" />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={fs('frequency')}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input {...fi('duration')} placeholder="e.g., 1 month" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Diet Advice</Label>
              <Textarea {...fi('diet_advice')} placeholder="Food to avoid, dietary recommendations..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Follow-up Instructions</Label>
              <Textarea {...fi('follow_up_instructions')} placeholder="Follow-up schedule, what to watch for..." rows={2} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Additional Notes</Label>
              <Textarea {...fi('notes')} placeholder="Doctor's notes..." rows={2} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.patient_id}>{loading ? 'Saving...' : rx ? 'Update Prescription' : 'Save Prescription'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [editRx, setEditRx] = useState<Prescription | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => { if (searchParams.get('new')) setShowForm(true) }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/prescriptions', { params: { limit: 300 } }); setPrescriptions(res.data) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = prescriptions.filter(r =>
    !search || r.patient?.name?.toLowerCase().includes(search.toLowerCase()) || r.medicine_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{prescriptions.length} prescriptions</p>
        </div>
        <Button onClick={() => { setEditRx(null); setShowForm(true) }} className="gap-2 shrink-0">
          <Plus size={16} /> Write Prescription
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input className="pl-9" placeholder="Search by patient or medicine..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No prescriptions found</p>
          <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}><Plus size={15} /> Write Prescription</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(rx => (
            <Card key={rx.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0F8B4C]/10 text-[#0F8B4C] flex items-center justify-center font-bold shrink-0">
                    {rx.patient?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{rx.patient?.name}</div>
                        <div className="text-xs text-gray-400">{rx.patient?.patient_id} · {formatDate(rx.prescription_date)}</div>
                      </div>
                      {rx.medicine_name && (
                        <div className="text-right shrink-0">
                          <Badge variant="success" className="text-xs">{rx.medicine_name}</Badge>
                          {rx.potency && <div className="text-xs text-gray-500 mt-0.5">{rx.potency} · {rx.dosage}</div>}
                        </div>
                      )}
                    </div>
                    {rx.chief_complaint && <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{rx.chief_complaint}</p>}
                    {rx.miasmatic_analysis && <Badge variant="outline" className="mt-1.5 text-[10px] h-4">{rx.miasmatic_analysis}</Badge>}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setEditRx(rx); setShowForm(true) }}>Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PrescriptionForm rx={editRx} open={showForm} onClose={() => { setShowForm(false); setEditRx(null) }} onSave={() => { setShowForm(false); setEditRx(null); load() }} />
    </div>
  )
}
