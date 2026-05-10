import { TrendingUp, DollarSign, ShoppingBag, Clock } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: "Today's Revenue", value: '$458.50', change: '+12.5%', icon: DollarSign },
    { name: 'Active Orders', value: '12', change: '4 preparing', icon: ShoppingBag },
    { name: 'Avg. Prep Time', value: '14 min', change: '-2 min', icon: Clock },
    { name: 'Total Customers', value: '84', change: '+18%', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Here is what's happening at your food truck today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-orange-500" />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-gray-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-gray-500">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No recent activity to show.</p>
        </div>
      </div>
    </div>
  )
}
