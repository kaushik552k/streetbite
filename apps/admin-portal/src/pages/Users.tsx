import { Search, MoreVertical, Shield } from 'lucide-react'

const mockUsers = [
  { id: 'USR-001', name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', orders: 12, joined: 'Oct 10, 2023' },
  { id: 'USR-002', name: 'Alex Johnson', email: 'alex@burgerlab.com', role: 'OWNER', orders: 0, joined: 'Oct 12, 2023' },
  { id: 'USR-003', name: 'Admin Account', email: 'admin@streetbite.com', role: 'ADMIN', orders: 0, joined: 'Sep 01, 2023' },
  { id: 'USR-004', name: 'Emily Chen', email: 'emily.c@example.com', role: 'CUSTOMER', orders: 4, joined: 'Jan 05, 2024' },
  { id: 'USR-005', name: 'Michael Brown', email: 'mbrown@example.com', role: 'CUSTOMER', orders: 1, joined: 'Last week' },
]

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all customers, owners, and admins.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Total Orders</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="p-4">
                    {user.role === 'ADMIN' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Shield className="w-3 h-3 mr-1" /> Admin
                      </span>
                    )}
                    {user.role === 'OWNER' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Owner
                      </span>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        Customer
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{user.orders}</td>
                  <td className="p-4 text-sm text-gray-500">{user.joined}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
