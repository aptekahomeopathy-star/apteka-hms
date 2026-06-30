import { useEffect, useState } from 'react'
import { Plus, TrendingDown, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { Expense } from '../lib/types'
import toast from 'react-hot-toast'

const CATEGORIES = ['Rent', 'Medicines', 'Equipment', 'Utilities', 'Staff Salary', 'Marketing', 'Maintenance', 'Stationery', 'Other']

function ExpenseModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    payment_mode: 'cash',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/expenses', { ...form, amount: parseFloat(form.amount) })
      toast.success('Expense added')
      onSave()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error adding expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Date *</label>
            <input type="date" className="input-field" value={form.expense_date}
              onChange={e => setForm({ ...form, expense_date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (₹) *</label>
            <input type="number" className="input-field" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" placeholder="0.00" />
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <select className="input-field" value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details" />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/expenses', { params: { limit: 200, category: categoryFilter || undefined } })
      setExpenses(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [categoryFilter])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}`)
    toast.success('Expense deleted')
    load()
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Total: ₹{total.toLocaleString()}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(byCategory).map(([cat, amt]) => (
            <div key={cat} className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}>
              <div className="text-xs text-gray-500 font-medium">{cat}</div>
              <div className="text-lg font-bold text-red-600 mt-1">₹{Number(amt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!categoryFilter ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
          onClick={() => setCategoryFilter('')}>All</button>
        {CATEGORIES.filter(c => byCategory[c]).map(c => (
          <button key={c} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === c ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setCategoryFilter(categoryFilter === c ? '' : c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-14 animate-pulse" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingDown size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No expenses recorded</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Description</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Mode</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.expense_date).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">{e.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{e.description || '-'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">₹{Number(e.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 hidden sm:table-cell capitalize">{e.payment_mode || '-'}</td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(e.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ExpenseModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load() }} />
      )}
    </div>
  )
}
