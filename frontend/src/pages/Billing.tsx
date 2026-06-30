import { useEffect, useState } from 'react'
import { Plus, Receipt, Search } from 'lucide-react'
import api from '../lib/api'
import { Bill, Patient } from '../lib/types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function BillModal({ bill, onClose, onSave }: { bill: Bill | null; onClose: () => void; onSave: () => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState({
    patient_id: bill?.patient_id?.toString() || '',
    consultation_fee: bill?.consultation_fee?.toString() || '0',
    medicine_cost: bill?.medicine_cost?.toString() || '0',
    other_charges: bill?.other_charges?.toString() || '0',
    payment_mode: bill?.payment_mode || 'cash',
    status: bill?.status || 'paid',
    notes: bill?.notes || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/patients', { params: { limit: 500 } }).then(r => setPatients(r.data))
  }, [])

  const total = (parseFloat(form.consultation_fee) || 0) + (parseFloat(form.medicine_cost) || 0) + (parseFloat(form.other_charges) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        patient_id: parseInt(form.patient_id),
        consultation_fee: parseFloat(form.consultation_fee) || 0,
        medicine_cost: parseFloat(form.medicine_cost) || 0,
        other_charges: parseFloat(form.other_charges) || 0,
      }
      if (bill) {
        await api.put(`/bills/${bill.id}`, data)
        toast.success('Bill updated')
      } else {
        await api.post('/bills', data)
        toast.success('Bill created')
      }
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error saving bill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{bill ? 'Edit Bill' : 'Create Bill'}</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Consultation Fee (₹)</label>
              <input type="number" className="input-field" value={form.consultation_fee}
                onChange={e => setForm({ ...form, consultation_fee: e.target.value })} min="0" step="0.01" />
            </div>
            <div>
              <label className="label">Medicine Cost (₹)</label>
              <input type="number" className="input-field" value={form.medicine_cost}
                onChange={e => setForm({ ...form, medicine_cost: e.target.value })} min="0" step="0.01" />
            </div>
            <div>
              <label className="label">Other Charges (₹)</label>
              <input type="number" className="input-field" value={form.other_charges}
                onChange={e => setForm({ ...form, other_charges: e.target.value })} min="0" step="0.01" />
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-3xl font-bold text-green-700">₹{total.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Mode</label>
              <select className="input-field" value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving...' : bill ? 'Update' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBill, setEditBill] = useState<Bill | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/bills', { params: { limit: 200, status: filter || undefined } })
      setBills(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const filtered = bills.filter(b =>
    !search ||
    b.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.bill_number?.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = filtered.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.total_amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 text-sm mt-1">Total: ₹{totalRevenue.toLocaleString()} collected</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditBill(null); setShowModal(true) }}>
          <Plus size={18} /> New Bill
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search by patient or bill number..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['', 'paid', 'pending', 'partial'].map(s => (
            <button key={s} className={clsx('px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === s ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50')}
              onClick={() => setFilter(s)}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No bills found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Bill</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Patient</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Mode</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{b.bill_number}</div>
                      <div className="text-xs text-gray-500">{new Date(b.bill_date).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-600">{b.patient?.name}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">₹{Number(b.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 hidden md:table-cell capitalize">{b.payment_mode || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx('text-xs px-2 py-1 rounded-full font-medium',
                        b.status === 'paid' ? 'bg-green-100 text-green-700' :
                        b.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700')}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-green-600 hover:text-green-700 font-medium"
                        onClick={() => { setEditBill(b); setShowModal(true) }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <BillModal bill={editBill} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />
      )}
    </div>
  )
}
