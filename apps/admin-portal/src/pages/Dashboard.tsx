import { TrendingUp, Truck, Users, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { name: 'Total Platform Revenue', value: '$124,500', change: '+24%', icon: DollarSign },
    { name: 'Active Food Trucks', value: '48', change: '+3 this week', icon: Truck },
    { name: 'Registered Users', value: '12,400', change: '+12%', icon: Users },
    { name: 'Orders Processed', value: '8,430', change: '+18%', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">High-level metrics for the StreetBite platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600" />
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

      {/* Placeholder Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Chart Visualization Coming Soon</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">New Truck #{i}</p>
                    <p className="text-xs text-gray-500">Applied 2h ago</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
