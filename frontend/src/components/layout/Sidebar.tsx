import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, FileText, Receipt, Wallet,
  TrendingDown, BarChart3, CalendarCheck, Settings, LogOut,
  ChevronLeft, ChevronRight, Leaf
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/visits', label: 'Visits', icon: Stethoscope },
  { to: '/prescriptions', label: 'Prescriptions', icon: FileText },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/expenses', label: 'Expenses', icon: TrendingDown },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/followups', label: 'Follow-ups', icon: CalendarCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-gray-100",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F8B4C] to-[#0d7a42] flex items-center justify-center shadow-md shrink-0">
          <span className="text-white font-black text-lg leading-none">A</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-black text-[#0F8B4C] text-sm leading-tight tracking-wide">APTEKA</div>
            <div className="text-[10px] text-gray-400 leading-tight font-medium uppercase tracking-widest">Homoeopathy</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  end={exact}
                  onClick={onMobileClose}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
                    collapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-[#0F8B4C] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={cn('shrink-0', isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700')} />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="ml-1">
                  {label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-gray-100 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <div className="text-xs font-semibold text-gray-800 truncate">{user?.full_name || user?.username}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.is_admin ? 'Administrator' : 'Doctor'}</div>
          </div>
        )}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-sm font-medium',
                  collapsed ? 'justify-center' : ''
                )}
              >
                <LogOut size={18} className="shrink-0" />
                {!collapsed && 'Logout'}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-7 w-7 rounded-full border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all absolute -right-3.5 top-16 z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-xl lg:hidden transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        'relative hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
