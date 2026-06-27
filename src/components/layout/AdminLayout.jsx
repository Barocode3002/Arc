import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-brand-50">
      <Sidebar />
      <main className="ms-[260px] p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
