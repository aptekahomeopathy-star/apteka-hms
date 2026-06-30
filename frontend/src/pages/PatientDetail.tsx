import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, FileText, Receipt, Stethoscope, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { Patient, Prescription, Bill, Appointment } from '@/lib/types'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get(`/patients/${id}`),
      api.get('/prescriptions', { params: { patient_id: id } }),
      api.get('/bills', { params: { patient_id: id } }),
      api.get('/appointments', { params: { limit: 100 } }),
    ]).then(([p, rx, b, a]) => {
      setPatient(p.data)
      setPrescriptions(rx.data)
      setBills(b.data)
      setAppointments(a.data.filter((apt: Appointment) => apt.patient_id === parseInt(id)))
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
  }
  if (!patient) {
    return <div className="text-center py-16 text-gray-400">Patient not found</div>
  }

  const totalBilled = bills.reduce((s, b) => s + Number(b.total_amount), 0)

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/patients')} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{patient.name}</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-sm text-gray-400">{patient.patient_id}</span>
            {patient.age && <span className="text-sm text-gray-400">· {patient.age} years</span>}
            {patient.gender && <Badge variant={patient.gender === 'male' ? 'info' : patient.gender === 'female' ? 'purple' : 'outline'} className="text-xs capitalize">{patient.gender}</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => navigate('/patients')}>
          <Edit2 size={14} /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Patient Info Card */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#0F8B4C]/10 text-[#0F8B4C] rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
                  {patient.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{patient.name}</div>
                  <div className="text-xs text-gray-400">Registered {formatDate(patient.created_at)}</div>
                </div>
              </div>
              <div className="space-y-2.5 pt-1">
                {patient.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-gray-400 shrink-0" />{patient.phone}</div>}
                {patient.email && <div className="flex items-center gap-2 text-sm text-gray-600 truncate"><Mail size={14} className="text-gray-400 shrink-0" />{patient.email}</div>}
                {patient.occupation && <div className="flex items-center gap-2 text-sm text-gray-600"><Briefcase size={14} className="text-gray-400 shrink-0" />{patient.occupation}</div>}
                {patient.address && <div className="flex items-start gap-2 text-sm text-gray-600"><MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />{patient.address}</div>}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Visits', value: appointments.length, icon: Stethoscope },
              { label: 'Rx', value: prescriptions.length, icon: FileText },
              { label: 'Bills', value: bills.length, icon: Receipt },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {bills.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs text-gray-500 mb-1">Total Billed</div>
                <div className="text-xl font-bold text-[#0F8B4C]">{formatCurrency(totalBilled)}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="visits" className="flex-1">Visits ({appointments.length})</TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex-1">Rx ({prescriptions.length})</TabsTrigger>
              <TabsTrigger value="bills" className="flex-1">Bills ({bills.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-3">
              {[
                { label: 'Chief Complaint', value: patient.chief_complaint },
                { label: 'Past History', value: patient.past_history },
                { label: 'Family History', value: patient.family_history },
                { label: 'Personal History', value: patient.personal_history },
              ].filter(s => s.value).map(s => (
                <Card key={s.label} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{s.label}</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
              {!patient.chief_complaint && !patient.past_history && !patient.family_history && !patient.personal_history && (
                <Card className="border-0 shadow-sm"><CardContent className="py-10 text-center text-gray-400 text-sm">No medical history recorded</CardContent></Card>
              )}
            </TabsContent>

            <TabsContent value="visits" className="mt-4 space-y-3">
              {appointments.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-10 text-center text-gray-400 text-sm">No visits recorded</CardContent></Card> :
                appointments.map(a => (
                  <Card key={a.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{formatDateTime(a.appointment_date)}</div>
                          {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
                          {a.follow_up_date && <p className="text-xs text-amber-600 mt-1">Follow-up: {formatDate(a.follow_up_date)}</p>}
                        </div>
                        <Badge variant={a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'error' : 'info'} className="text-xs capitalize">{a.status.replace('_', ' ')}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-4 space-y-3">
              {prescriptions.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-10 text-center text-gray-400 text-sm">No prescriptions found</CardContent></Card> :
                prescriptions.map(rx => (
                  <Card key={rx.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {rx.medicine_name && <Badge variant="success" className="text-xs">{rx.medicine_name}</Badge>}
                            {rx.potency && <span className="text-xs text-gray-500">{rx.potency}</span>}
                          </div>
                          {rx.chief_complaint && <p className="text-xs text-gray-500 mt-1.5">{rx.chief_complaint}</p>}
                          {rx.dosage && <p className="text-xs text-gray-400 mt-1">{rx.dosage} · {rx.frequency} · {rx.duration}</p>}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{formatDate(rx.prescription_date)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </TabsContent>

            <TabsContent value="bills" className="mt-4 space-y-3">
              {bills.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-10 text-center text-gray-400 text-sm">No bills found</CardContent></Card> :
                bills.map(b => (
                  <Card key={b.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm font-medium text-gray-800">{b.bill_number}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(b.bill_date)} · {b.payment_mode}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(Number(b.total_amount))}</div>
                        <Badge variant={b.status === 'paid' ? 'success' : b.status === 'pending' ? 'warning' : 'info'} className="text-xs capitalize mt-0.5">{b.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
