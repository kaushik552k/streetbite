import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, CheckCircle2, ChefHat, ArrowRight, X, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { apiRequest } from '../lib/api'
import { io } from 'socket.io-client'

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'

const COLUMNS: { id: OrderStatus; label: string; color: string; icon: any }[] = [
  { id: 'PENDING',   label: 'New Orders',       color: 'bg-red-50 text-red-700 border-red-200',     icon: Clock },
  { id: 'PREPARING', label: 'In Kitchen',        color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ChefHat },
  { id: 'READY',     label: 'Ready for Pickup',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
]

const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  if (status === 'PENDING') return 'PREPARING'
  if (status === 'PREPARING') return 'READY'
  if (status === 'READY') return 'COMPLETED'
  return null
}

export default function Orders() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['owner-orders'],
    queryFn: () => apiRequest('/api/v1/orders?limit=50'),
    refetchInterval: 15000, // Poll every 15s as fallback
  })

  // Real-time Socket.IO connection for live order updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000')
    
    socket.on('order:new', () => {
      queryClient.invalidateQueries({ queryKey: ['owner-orders'] })
    })
    socket.on('order:status', () => {
      queryClient.invalidateQueries({ queryKey: ['owner-orders'] })
    })

    return () => { socket.disconnect() }
  }, [queryClient])

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      apiRequest(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-orders'] })
    },
  })

  const orders = data?.data || []
  const activeOrders = orders.filter((o: any) => ['PENDING', 'PREPARING', 'READY'].includes(o.status))

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
          <p className="text-gray-500 mt-1">Manage active orders as they come in.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = activeOrders.filter((o: any) => o.status === col.id)

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
                {isLoading ? (
                  <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Loading orders...</div>
                ) : colOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm font-medium">No orders here</div>
                ) : (
                  colOrders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <h3 className="font-bold text-gray-900 mt-2">{order.customer?.name || 'Customer'}</h3>
                        </div>
                        <span className="text-xs font-medium text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(order.createdAt))} ago
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              <span className="font-medium text-gray-900">{item.quantity}x</span> {item.menuItem?.name || 'Item'}
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
                              onClick={() => updateStatus.mutate({ orderId: order.id, status: 'CANCELLED' })}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Order"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const next = getNextStatus(order.status)
                              if (next) updateStatus.mutate({ orderId: order.id, status: next })
                            }}
                            disabled={updateStatus.isPending}
                            className="flex items-center bg-gray-900 hover:bg-orange-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
