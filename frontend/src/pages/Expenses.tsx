import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, TrendingDown, Trash2 } from 'lucide-react'
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
import { Expense } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const CATEGORIES = ['Rent', 'Medicines/Stock', 'Equipment', 'Utilities', 'Staff Salary', 'Marketing', 'Maintenance', 'Stationery', 'Miscellaneous']
const CAT_COLORS: Record<string, string> = {
  'Rent': 'bg-blue-100 text-blue-700', 'Medicines/Stock': 'bg-green-100 text-green-700',
  'Equipment': 'bg-purple-100 text-purple-700', 'Utilities': 'bg-amber-100 text-amber-700',
  'Staff Salary': 'bg-rose-100 text-rose-700', 'Marketing': 'bg-indigo-100 text-indigo-700',
  'Maintenance': 'bg-orange-100 text-orange-700', 'Stationery': 'bg-cyan-100 text-cyan-700',
  'Miscellaneous': 'bg-gray-100 text-gray-700',
}

function ExpenseForm({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ expense_date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', payment_mode: 'cash' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm({ expense_date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', payment_mode: 'cash' })
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/expenses', { ...form, amount: parseFloat(form.amount) })
      toast.success('Expense recorded'); onSave()
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Error saving')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹) *</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment Mode</Label>
            <Select value={form.payment_mode} onValueChange={v => setForm({ ...form, payment_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['cash', 'upi', 'card', 'bank_transfer'].map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_', ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Details about this expense..." rows={2} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !form.category || !form.amount}>{loading ? 'Saving...' : 'Add Expense'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [catFilter, setCatFilter] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => { if (searchParams.get('new')) setShowForm(true) }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await api.get('/expenses', { params: { limit: 300, category: catFilter || undefined } }); setExpenses(res.data) }
    finally { setLoading(false) }
  }, [catFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}`); toast.success('Expense deleted'); load()
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const byCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc }, {} as Record<string, number>)
  const topCat = Object.entries(byCategory).sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total: {formatCurrency(total)}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      {topCat.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {topCat.slice(0, 5).map(([cat, amt]) => (
            <Card key={cat} className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${catFilter === cat ? 'ring-2 ring-[#0F8B4C]' : ''}`} onClick={() => setCatFilter(catFilter === cat ? '' : cat)}>
              <CardContent className="p-4">
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-1 ${CAT_COLORS[cat] || 'bg-gray-100 text-gray-700'}`}>{cat}</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(amt)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant={!catFilter ? 'default' : 'outline'} size="sm" className="text-xs h-8" onClick={() => setCatFilter('')}>All</Button>
        {CATEGORIES.filter(c => byCategory[c]).map(c => (
          <Button key={c} variant={catFilter === c ? 'default' : 'outline'} size="sm" className="text-xs h-8" onClick={() => setCatFilter(catFilter === c ? '' : c)}>{c}</Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : expenses.length === 0 ? (
        <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center">
          <TrendingDown size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No expenses recorded</p>
          <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}><Plus size={15} /> Add Expense</Button>
        </CardContent></Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Description</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Mode</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(e.expense_date)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[e.category] || 'bg-gray-100 text-gray-700'}`}>{e.category}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-500">{e.description || '—'}</td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell text-xs text-gray-500 capitalize">{e.payment_mode || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-red-600">{formatCurrency(Number(e.amount))}</td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ExpenseForm open={showForm} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load() }} />
    </div>
  )
}
