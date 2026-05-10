import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingBag, Clock, TrendingUp } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiRequest('/api/v1/admin/analytics'),
  })

  const stats = [
    { name: "Today's Revenue", value: data?.data?.totalGMV ? `$${Number(data.data.totalGMV).toFixed(2)}` : '—', icon: DollarSign },
    { name: 'Total Orders', value: isLoading ? '—' : String(data?.data?.totalOrders ?? 0), icon: ShoppingBag },
    { name: 'Avg. Prep Time', value: '14 min', icon: Clock },
    { name: 'Total Customers', value: isLoading ? '—' : String(data?.data?.totalUsers ?? 0), icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Here is what's happening at your food truck today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 font-medium">Active Trucks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '—' : data?.data?.totalTrucks ?? 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 font-medium">Paid Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '—' : data?.data?.totalOrders ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
