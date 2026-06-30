import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { MapPin, Phone, User, Mail, Building2, Stethoscope, Shield, Info } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Clinic and account configuration</p>
      </div>

      {/* Clinic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 size={16} className="text-[#0F8B4C]" /> Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Clinic Name</Label>
              <Input defaultValue="APTEKA HOMOEOPATHY" readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Doctor Name</Label>
              <Input defaultValue="Dr. Siddhartha Kumar" readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input defaultValue="+91 9461102820" readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Specialization</Label>
              <Input defaultValue="Homoeopathy" readOnly className="bg-gray-50" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Input defaultValue="B-48 Chandanvan Phase-2, Mathura, Uttar Pradesh 281001" readOnly className="bg-gray-50" />
            </div>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1"><Info size={12} />Contact your administrator to update clinic information.</p>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User size={16} className="text-[#0B6CFB]" /> Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-[#0F8B4C] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.full_name || user?.username}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <Badge variant={user?.is_admin ? 'default' : 'secondary'} className="mt-1 text-xs">
                {user?.is_admin ? 'Administrator' : 'Doctor'}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input value={user?.username || ''} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email || ''} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={user?.full_name || ''} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={user?.is_admin ? 'Administrator' : 'Doctor'} readOnly className="bg-gray-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield size={16} className="text-purple-500" /> System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Application', value: 'APTEKA HMS v1.0' },
            { label: 'Database', value: 'PostgreSQL (Replit Managed)' },
            { label: 'Framework', value: 'React + FastAPI' },
            { label: 'Currency', value: 'Indian Rupee (₹)' },
            { label: 'Patient ID Format', value: 'APT0001, APT0002...' },
            { label: 'Bill Number Format', value: 'BILL202506XXXX' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
