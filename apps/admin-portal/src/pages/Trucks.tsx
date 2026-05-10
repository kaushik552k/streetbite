import { Search, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const mockTrucks = [
  { id: 'TRK-001', name: 'The Burger Lab', owner: 'Alex Johnson', status: 'ACTIVE', revenue: '$45,200', joined: 'Oct 12, 2023' },
  { id: 'TRK-002', name: 'Taco Fiesta', owner: 'Maria Garcia', status: 'ACTIVE', revenue: '$32,150', joined: 'Nov 05, 2023' },
  { id: 'TRK-003', name: 'Waffle Wagon', owner: 'Sarah Smith', status: 'PENDING', revenue: '$0', joined: 'Yesterday' },
  { id: 'TRK-004', name: 'Sushi Wheels', owner: 'David Kim', status: 'SUSPENDED', revenue: '$12,400', joined: 'Jan 15, 2024' },
]

export default function Trucks() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Trucks</h1>
          <p className="text-gray-500 mt-1">Manage all registered vendors on the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trucks by name or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Truck Details</th>
                <th className="p-4 font-bold">Owner</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Total Revenue</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTrucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{truck.name}</p>
                    <p className="text-xs text-gray-500">{truck.id}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{truck.owner}</td>
                  <td className="p-4">
                    {truck.status === 'ACTIVE' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                    {truck.status === 'PENDING' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                    {truck.status === 'SUSPENDED' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{truck.revenue}</td>
                  <td className="p-4 text-sm text-gray-500">{truck.joined}</td>
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
