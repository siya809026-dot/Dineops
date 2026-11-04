import React, { useState } from 'react';
import { Store, Plus, MapPin, Phone, User, ShieldCheck, Building2 } from 'lucide-react';

export default function BranchesPage() {
  const [locations, setLocations] = useState([
    { id: 1, name: 'Pindi Junction - Saddar Main', type: 'Branch Kitchen', city: 'Rawalpindi', manager: 'Ali Khan', phone: '+92 300 1234567', status: 'Operational', inventoryStatus: 'Optimal' },
    { id: 2, name: 'Pindi Junction - Bahria Town', type: 'Franchise Outlet', city: 'Rawalpindi', manager: 'Usman Malik', phone: '+92 321 9876543', status: 'Operational', inventoryStatus: 'Low Stock' },
    { id: 3, name: 'Pindi Junction - Commercial Market', type: 'Branch Kitchen', city: 'Rawalpindi', manager: 'Bilal Ahmed', phone: '+92 333 5554433', status: 'Operational', inventoryStatus: 'Optimal' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', type: 'Branch Kitchen', city: '', manager: '', phone: '' });

  const handleAddLocation = (e) => {
    e.preventDefault();
    setLocations([...locations, { id: Date.now(), ...newLocation, status: 'Operational', inventoryStatus: 'Optimal' }]);
    setNewLocation({ name: '', type: 'Branch Kitchen', city: '', manager: '', phone: '' });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Branch & Franchise Network</h1>
          <p className="text-slate-400 text-sm mt-1">Manage centralized kitchen branches and decentralized franchise outlets.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg text-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${loc.type === 'Branch Kitchen' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                  <Building2 size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${loc.type === 'Branch Kitchen' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                  {loc.type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{loc.name}</h3>
              
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-500" />
                  <span>City: <strong className="text-slate-300">{loc.city}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-500" />
                  <span>Manager: <strong className="text-slate-300">{loc.manager}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-500" />
                  <span>Contact: <strong className="text-slate-300">{loc.phone}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {loc.status}
              </span>
              <span className={`px-2 py-1 rounded font-medium ${loc.inventoryStatus === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                Stock: {loc.inventoryStatus}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding Branch/Franchise */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Register New Branch or Franchise</h3>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="e.g. Pindi Junction - Giga Mall"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Location Type</label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Branch Kitchen">Branch Kitchen (Direct Control)</option>
                  <option value="Franchise Outlet">Franchise Outlet (Independent Agreement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">City / Area</label>
                <input
                  type="text"
                  required
                  value={newLocation.city}
                  onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                  placeholder="Rawalpindi / Islamabad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Manager Name</label>
                <input
                  type="text"
                  required
                  value={newLocation.manager}
                  onChange={(e) => setNewLocation({ ...newLocation, manager: e.target.value })}
                  placeholder="Manager Full Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Contact Number</label>
                <input
                  type="text"
                  required
                  value={newLocation.phone}
                  onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                  placeholder="+92 3XX XXXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-sm font-bold transition-colors shadow-lg"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}