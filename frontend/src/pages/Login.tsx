import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'
import { Leaf, Phone, MapPin, User } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', full_name: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(loginForm.username, loginForm.password)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(regForm)
      toast.success('Account created! Please sign in.')
      setLoginForm({ username: regForm.username, password: regForm.password })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-green-50/40 to-blue-50/30 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-gradient-to-b from-[#0F8B4C] to-[#0a6e3c] p-10 text-white shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-black text-2xl">A</span>
            </div>
            <div>
              <div className="font-black text-xl tracking-wide">APTEKA</div>
              <div className="text-green-200 text-xs font-medium tracking-widest uppercase">Homoeopathy HMS</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Professional Healthcare Management
          </h1>
          <p className="text-green-100/90 text-sm leading-relaxed">
            A complete clinic management system designed for homeopathic practitioners. Manage patients, prescriptions, billing, and analytics — all in one place.
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-green-200" />
              <span className="font-semibold text-sm">Dr. Siddhartha Kumar</span>
            </div>
            <div className="flex items-start gap-2 mb-2">
              <Phone size={14} className="text-green-200 mt-0.5 shrink-0" />
              <span className="text-green-100/80 text-xs">+91 9461102820</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-green-200 mt-0.5 shrink-0" />
              <span className="text-green-100/80 text-xs">B-48 Chandanvan Phase-2, Mathura, Uttar Pradesh 281001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#0F8B4C] rounded-2xl mb-3 shadow-lg">
              <span className="text-white font-black text-2xl">A</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">APTEKA HMS</h2>
            <p className="text-gray-500 text-sm mt-1">Homoeopathy Management System</p>
          </div>

          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your clinic dashboard</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={loginForm.username}
                        onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input placeholder="Dr. Your Name" value={regForm.full_name} onChange={e => setRegForm({ ...regForm, full_name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Username *</Label>
                      <Input placeholder="username" value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email *</Label>
                      <Input type="email" placeholder="doctor@apteka.com" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Password *</Label>
                      <Input type="password" placeholder="Create a strong password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <p className="text-xs text-center text-gray-400">First account becomes administrator</p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
