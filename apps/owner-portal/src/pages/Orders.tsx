import { useState } from 'react'
import { Clock, CheckCircle2, ChefHat, ArrowRight, X } from 'lucide-react'
import { mockOrders } from '../lib/mockData'
import type { Order, OrderStatus } from '../lib/mockData'
import { formatDistanceToNow } from 'date-fns'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)

  const COLUMNS: { id: OrderStatus; label: string; color: string; icon: any }[] = [
    { id: 'PENDING', label: 'New Orders', color: 'bg-red-50 text-red-700 border-red-200', icon: Clock },
    { id: 'PREPARING', label: 'In Kitchen', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ChefHat },
    { id: 'READY', label: 'Ready for Pickup', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  ]

  const moveOrder = (orderId: string, newStatus: OrderStatus) => {
    setOrders(current =>
      current.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  const cancelOrder = (orderId: string) => {
    setOrders(current => current.filter(order => order.id !== orderId))
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    if (currentStatus === 'PENDING') return 'PREPARING'
    if (currentStatus === 'PREPARING') return 'READY'
    if (currentStatus === 'READY') return 'COMPLETED'
    return null
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
        <p className="text-gray-500 mt-1">Manage active orders as they come in.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter(o => o.status === col.id)
          
          return (
            <div key={col.id} className="flex-1 min-w-[320px] flex flex-col bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-4 ${col.color}`}>
                <div className="flex items-center font-bold">
                  <col.icon className="w-5 h-5 mr-2" />
                  {col.label}
                </div>
                <span className="bg-white px-2.5 py-0.5 rounded-full text-sm font-bold shadow-sm">
                  {colOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {colOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm font-medium">
                    No orders here
                  </div>
                ) : (
                  colOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                            {order.id}
                          </span>
                          <h3 className="font-bold text-gray-900 mt-2">{order.customerName}</h3>
                        </div>
                        <span className="text-xs font-medium text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(order.createdAt))} ago
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              <span className="font-medium text-gray-900">{item.quantity}x</span> {item.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.note && (
                        <div className="mb-4 text-sm bg-yellow-50 text-yellow-800 p-2 rounded-md border border-yellow-100">
                          <span className="font-bold">Note:</span> {order.note}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                        
                        <div className="flex items-center space-x-2">
                          {order.status === 'PENDING' && (
                            <button 
                              onClick={() => cancelOrder(order.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Order"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              const next = getNextStatus(order.status)
                              if (next) moveOrder(order.id, next)
                              else cancelOrder(order.id) // Clear completed
                            }}
                            className="flex items-center bg-gray-900 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            {order.status === 'READY' ? 'Complete' : 'Next'}
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
