import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Truck, Users, DollarSign } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function Dashboard() {
  const api = useApi()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api('/api/v1/admin/analytics'),
  })

  const stats = [
    { name: 'Total Platform Revenue', value: data?.data?.totalGMV ? `$${Number(data.data.totalGMV).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—', icon: DollarSign },
    { name: 'Active Food Trucks', value: isLoading ? '—' : String(data?.data?.totalTrucks ?? 0), icon: Truck },
    { name: 'Registered Users', value: isLoading ? '—' : String(data?.data?.totalUsers ?? 0), icon: Users },
    { name: 'Orders Processed', value: isLoading ? '—' : String(data?.data?.totalOrders ?? 0), icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">High-level metrics for the StreetBite platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-opacity ${isLoading ? 'opacity-60 animate-pulse' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Chart integration coming soon (recharts)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approvals</h2>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center pt-8">No trucks awaiting approval</p>
          )}
        </div>
      </div>
    </div>
  )
}
