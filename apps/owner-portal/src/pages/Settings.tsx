import { useState } from 'react'
import { Save, Store, Clock, MapPin, Image as ImageIcon } from 'lucide-react'

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000) // Mock save delay
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 mt-1">Manage your food truck's public profile and operating details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Public Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Store className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="font-bold text-gray-900">Public Profile</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover Image Placeholder */}
              <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-orange-300 transition-colors cursor-pointer">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Cover</span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Food Truck Name</label>
                  <input 
                    type="text" 
                    defaultValue="The Burger Lab"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cuisine Type</label>
                    <input 
                      type="text" 
                      defaultValue="American, Burgers"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      defaultValue="(555) 123-4567"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                rows={3}
                defaultValue="Gourmet smash burgers made with 100% Angus beef and our secret house sauce."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Operating Details Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="font-bold text-gray-900">Operating Details</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                Current Location
              </label>
              <input 
                type="text" 
                defaultValue="123 Food Truck Plaza, Downtown"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Update this when you move to a new spot.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Weekly Hours</label>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={index > 0 && index < 6} />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                    <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                      <input type="time" defaultValue="11:00" className="w-full text-sm px-2 py-1 rounded-md border border-gray-200" disabled={index === 0 || index === 6} />
                      <span className="text-gray-400 text-sm">-</span>
                      <input type="time" defaultValue="20:00" className="w-full text-sm px-2 py-1 rounded-md border border-gray-200" disabled={index === 0 || index === 6} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
