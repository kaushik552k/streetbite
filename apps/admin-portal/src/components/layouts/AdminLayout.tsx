import { Outlet, Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { LayoutDashboard, Truck, Users, Settings, ShieldAlert } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()

  const navItems = [
    { name: 'Platform Overview', path: '/', icon: LayoutDashboard },
    { name: 'Food Trucks', path: '/trucks', icon: Truck },
    { name: 'User Management', path: '/users', icon: Users },
  ]

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <ShieldAlert className="w-6 h-6 text-blue-500 mr-2" />
          <span className="text-xl font-bold">StreetBite Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Super Admin</p>
              <p className="text-xs text-gray-400">admin@streetbite.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-sm font-medium text-gray-500">
            {navItems.find(i => i.path === location.pathname)?.name || 'Admin Portal'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
