import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Receipt, Search, IndianRupee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import { Bill, Patient } from '@/lib/types'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLE: Record<string, any> = { paid: 'success', pending: 'warning', partial: 'info' }

function BillForm({ bill, open, onClose, onSave }: { bill: Bill | null; open: boolean; onClose: () => void; onSave: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState({ patient_id: '', consultation_fee: '0', medicine_cost: '0', other_charges: '0', payment_mode: 'cash', status: 'paid', notes: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/patients', { params: { limit: 500 } }).then(r => setPatients(r.data)) }, [])

  useEffect(() => {
    if (bill) {
      setForm({
        patient_id: bill.patient_id?.toString() || '', consultation_fee: String(bill.consultation_fee || 0),
        medicine_cost: String(bill.medicine_cost || 0), other_charges: String(bill.other_charges || 0),
        payment_mode: bill.payment_mode || 'cash', status: bill.status || 'paid', notes: bill.notes || ''
      })
    } else {
      setForm({ patient_id: '', consultation_fee: '500', medicine_cost: '0', other_charges: '0', payment_mode: 'cash', status: 'paid', notes: '' })
    }
  }, [bill, open])

  const total = (parseFloat(form.consultation_fee) || 0) + (parseFloat(form.medicine_cost) || 0) + (parseFloat(form.other_charges) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const data = { ...form, patient_id: parseInt(form.patient_id), consultation_fee: parseFloat(form.consultation_fee) || 0, medicine_cost: parseFloat(form.medicine_cost) || 0, other_charges: parseFloat(form.other_charges) || 0 }
      if (bill) { await api.put(`/bills/${bill.id}`, data); toast.success('Bill updated') }
      else { await api.post('/bills', data); toast.success('Bill created') }
      onSave()
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Error saving bill')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{bill ? 'Edit Bill' : 'Create New Bill'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Patient *</Label>
            <Select value={form.patient_id} onValueChange={v => setForm({ ...form, patient_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.patient_id}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['consultation_fee', 'Consultation (₹)'], ['medicine_cost', 'Medicines (₹)'], ['other_charges', 'Other (₹)']].map(([f, l]) => (
              <div key={f} className="space-y-1.5">
                <Label className="text-xs">{l}</Label>
                <Input type="number" min="0" step="0.01" value={(form as any)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="bg-[#0F8B4C]/5 rounded-xl p-4 text-center border border-[#0F8B4C]/10">
            <div className="text-xs text-gray-500 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-[#0F8B4C]">{formatCurrency(total)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={v => setForm({ ...form, payment_mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['cash', 'upi', 'card', 'bank_transfer', 'cheque'].map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes" />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.patient_id}>{loading ? 'Saving...' : bill ? 'Update Bill' : 'Create Bill'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [editBill, setEditBill] = useState<Bill | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => { if (searchParams.get('new')) setShowForm(true) }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/bills', { params: { limit: 300, status: statusFilter || undefined } }); setBills(res.data) }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = bills.filter(b => !search || b.patient?.name?.toLowerCase().includes(search.toLowerCase()) || b.bill_number?.toLowerCase().includes(search.toLowerCase()))
  const totalRevenue = filtered.filter(b => b.status === 'paid').reduce((s, b) => s + Number(b.total_amount), 0)
  const totalPending = filtered.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.total_amount), 0)

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatCurrency(totalRevenue)} collected · {formatCurrency(totalPending)} pending</p>
        </div>
        <Button onClick={() => { setEditBill(null); setShowForm(true) }} className="gap-2 shrink-0">
          <Plus size={16} /> New Bill
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input className="pl-9" placeholder="Search by patient or bill number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['', 'paid', 'pending', 'partial'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="text-xs h-8 capitalize" onClick={() => setStatusFilter(s)}>{s || 'All'}</Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center">
          <Receipt size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No bills found</p>
          <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}><Plus size={15} /> Create Bill</Button>
        </CardContent></Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Bill</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Patient</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Mode</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="px-5 py-3 hidden lg:table-cell text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-sm font-medium text-gray-900">{b.bill_number}</div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-sm text-gray-700">{b.patient?.name}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="font-bold text-gray-900">{formatCurrency(Number(b.total_amount))}</span></td>
                    <td className="px-5 py-3.5 text-center hidden md:table-cell"><span className="text-xs text-gray-500 capitalize">{b.payment_mode?.replace('_', ' ') || '—'}</span></td>
                    <td className="px-5 py-3.5 text-center"><Badge variant={STATUS_STYLE[b.status] || 'outline'} className="text-xs capitalize">{b.status}</Badge></td>
                    <td className="px-5 py-3.5 hidden lg:table-cell"><span className="text-xs text-gray-400">{formatDate(b.bill_date)}</span></td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setEditBill(b); setShowForm(true) }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <BillForm bill={editBill} open={showForm} onClose={() => { setShowForm(false); setEditBill(null) }} onSave={() => { setShowForm(false); setEditBill(null); load() }} />
    </div>
  )
}
