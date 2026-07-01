import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'

import Dashboard from '@/pages/Dashboard'
import Patients from '@/pages/Patients'
import Visits from '@/pages/Visits'
import Prescriptions from '@/pages/Prescriptions'
import Billing from '@/pages/Billing'
import Payments from '@/pages/Payments'
import Expenses from '@/pages/Expenses'
import Reports from '@/pages/Reports'
import FollowUps from '@/pages/FollowUps'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="visits" element={<Visits />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="billing" element={<Billing />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
          <Route path="followups" element={<FollowUps />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}