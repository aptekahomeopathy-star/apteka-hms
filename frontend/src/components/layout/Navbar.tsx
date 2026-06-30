import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, Calendar, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import api from '@/lib/api'
import { Patient } from '@/lib/types'

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const handleSearch = async (val: string) => {
    setSearch(val)
    if (val.length < 2) { setResults([]); setShowResults(false); return }
    setSearching(true)
    setShowResults(true)
    try {
      const res = await api.get('/patients', { params: { search: val, limit: 6 } })
      setResults(res.data)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectPatient = (id: number) => {
    setSearch('')
    setResults([])
    setShowResults(false)
    navigate(`/patients/${id}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-3 px-4 shrink-0 z-20 relative">
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          className="pl-9 h-8 text-sm bg-gray-50 border-gray-200 focus-visible:ring-[#0F8B4C]"
          placeholder="Search patients..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
            {searching ? (
              <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No patients found</div>
            ) : results.map(p => (
              <button
                key={p.id}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                onMouseDown={() => handleSelectPatient(p.id)}
              >
                <div className="w-7 h-7 rounded-full bg-[#0F8B4C]/10 text-[#0F8B4C] flex items-center justify-center text-xs font-bold shrink-0">
                  {p.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.patient_id} · {p.phone || 'No phone'}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Date */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
        <Calendar size={13} className="text-[#0F8B4C]" />
        <span>{today}</span>
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <Bell size={18} />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#0B6CFB] rounded-full border border-white" />
      </button>

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-50 transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[#0F8B4C] text-white text-xs font-bold">
                {(user?.full_name || user?.username || 'D')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-800 leading-tight">
                {user?.full_name?.split(' ').slice(0, 2).join(' ') || user?.username}
              </div>
              <div className="text-[10px] text-gray-400">{user?.is_admin ? 'Admin' : 'Doctor'}</div>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <div className="font-semibold text-gray-800">{user?.full_name || user?.username}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings size={14} /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <LogOut size={14} /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
