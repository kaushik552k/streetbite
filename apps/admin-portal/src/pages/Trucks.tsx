import { useQuery } from '@tanstack/react-query'
import { Search, MoreVertical, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { apiRequest } from '../lib/api'

export default function Trucks() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-trucks'],
    queryFn: () => apiRequest('/api/v1/admin/trucks?limit=50'),
  })

  const trucks = (data?.data || []).filter((t: any) =>
    search ? t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) : true
  )

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <th className="p-4 font-bold">Orders</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                    <td className="p-4"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-10" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                    <td className="p-4" />
                  </tr>
                ))
              ) : trucks.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No trucks found.</td></tr>
              ) : trucks.map((truck: any) => (
                <tr key={truck.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{truck.name}</p>
                    <p className="text-xs text-gray-500">{truck.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{truck.owner?.name || '—'}</td>
                  <td className="p-4">
                    {truck.isApproved && truck.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    ) : !truck.isApproved ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{truck._count?.orders ?? 0}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(truck.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
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
