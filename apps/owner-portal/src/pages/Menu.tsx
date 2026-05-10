import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Tag, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export default function Menu() {
  const api = useApi()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['owner-truck'],
    queryFn: () => api('/api/v1/trucks/owner/me'),
  })

  const toggleAvailability = useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      api(`/api/v1/menu/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-truck'] }),
  })

  const deleteItem = useMutation({
    mutationFn: (itemId: string) =>
      api(`/api/v1/menu/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-truck'] }),
  })

  const truck = data?.data
  const categories = truck?.categories || []

  // Flatten all items for search
  const allItems = categories.flatMap((cat: any) =>
    cat.items.map((item: any) => ({ ...item, categoryName: cat.name }))
  )
  const filtered = search
    ? allItems.filter(
        (item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.categoryName.toLowerCase().includes(search.toLowerCase())
      )
    : allItems

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 mt-1">Add, edit, and organize your menu items.</p>
        </div>
        <button className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading menu...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No menu items found.</div>
          ) : (
            categories.map((cat: any) => {
              const catFiltered = filtered.filter((i: any) => i.categoryName === cat.name)
              if (catFiltered.length === 0) return null
              return (
                <div key={cat.id}>
                  <div className="bg-gray-50/50 px-6 py-3 flex items-center">
                    <Tag className="w-4 h-4 text-orange-500 mr-2" />
                    <h2 className="font-bold text-gray-900">{cat.name}</h2>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {catFiltered.map((item: any) => (
                      <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between sm:justify-start">
                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                            <span className="font-bold text-emerald-600 sm:ml-4">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-gray-500 mt-1 max-w-2xl">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={item.isAvailable}
                                onChange={() => toggleAvailability.mutate({ itemId: item.id, isAvailable: !item.isAvailable })}
                              />
                              <div className={`block w-10 h-6 rounded-full transition-colors ${item.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${item.isAvailable ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                              {item.isAvailable ? 'Available' : 'Sold Out'}
                            </span>
                          </label>

                          <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this item?')) deleteItem.mutate(item.id)
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
