import { useEffect, useState } from 'react'
import { Wallet, CreditCard, Smartphone, Banknote, TrendingUp, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import { Bill } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function Payments() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/bills', { params: { limit: 500 } }).then(r => setBills(r.data)).finally(() => setLoading(false))
  }, [])

  const paid = bills.filter(b => b.status === 'paid')
  const pending = bills.filter(b => b.status === 'pending')
  const partial = bills.filter(b => b.status === 'partial')

  const byMode = paid.reduce((acc, b) => {
    const mode = b.payment_mode || 'other'
    acc[mode] = (acc[mode] || 0) + Number(b.total_amount)
    return acc
  }, {} as Record<string, number>)

  const totalCollected = paid.reduce((s, b) => s + Number(b.total_amount), 0)
  const totalPending = pending.reduce((s, b) => s + Number(b.total_amount), 0)

  const filtered = bills.filter(b =>
    !search || b.patient?.name?.toLowerCase().includes(search.toLowerCase()) || b.bill_number?.toLowerCase().includes(search.toLowerCase())
  )

  const modeIcon: Record<string, any> = {
    cash: Banknote, upi: Smartphone, card: CreditCard, bank_transfer: TrendingUp
  }

  const modeColors: Record<string, string> = {
    cash: 'bg-green-50 text-green-700', upi: 'bg-purple-50 text-purple-700',
    card: 'bg-blue-50 text-blue-700', bank_transfer: 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Payment collection overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : (
          <>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Collected</p>
                    <p className="text-xl font-bold text-[#0F8B4C] mt-1">{formatCurrency(totalCollected)}</p>
                    <p className="text-xs text-gray-400 mt-1">{paid.length} bills paid</p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Wallet size={18} className="text-[#0F8B4C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Dues</p>
                    <p className="text-xl font-bold text-red-500 mt-1">{formatCurrency(totalPending)}</p>
                    <p className="text-xs text-gray-400 mt-1">{pending.length} bills pending</p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <CreditCard size={18} className="text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">{formatCurrency(byMode.cash || 0)}</p>
                    <p className="text-xs text-gray-400 mt-1">{paid.filter(b => b.payment_mode === 'cash').length} payments</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Banknote size={18} className="text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">UPI / Digital</p>
                    <p className="text-xl font-bold text-purple-600 mt-1">{formatCurrency((byMode.upi || 0) + (byMode.card || 0))}</p>
                    <p className="text-xs text-gray-400 mt-1">{paid.filter(b => b.payment_mode === 'upi' || b.payment_mode === 'card').length} payments</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Smartphone size={18} className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Payment Mode Breakdown */}
      {Object.keys(byMode).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(byMode).map(([mode, amt]) => {
            const Icon = modeIcon[mode] || Wallet
            return (
              <Card key={mode} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${modeColors[mode] || 'bg-gray-50 text-gray-600'}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 capitalize">{mode.replace('_', ' ')}</div>
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(amt)}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Transaction List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-sm font-semibold">All Transactions</CardTitle>
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input className="pl-9 h-8 text-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Bill #</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Patient</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 hidden md:table-cell">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 hidden sm:table-cell">Mode</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Amount</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-xs font-mono text-gray-600">{b.bill_number}</td>
                      <td className="py-3 text-sm text-gray-800">{b.patient?.name}</td>
                      <td className="py-3 text-xs text-gray-400 hidden md:table-cell">{formatDate(b.bill_date)}</td>
                      <td className="py-3 hidden sm:table-cell"><span className="text-xs capitalize text-gray-500">{b.payment_mode?.replace('_', ' ') || '—'}</span></td>
                      <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(Number(b.total_amount))}</td>
                      <td className="py-3 text-center">
                        <Badge variant={b.status === 'paid' ? 'success' : b.status === 'pending' ? 'warning' : 'info'} className="text-xs capitalize">{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No transactions found</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
