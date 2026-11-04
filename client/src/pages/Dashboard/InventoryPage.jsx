import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, Search, Filter, ArrowUpDown } from 'lucide-react';

export default function InventoryPage() {
  const [selectedLocation, setSelectedLocation] = useState('Saddar Main Kitchen');
  const [searchTerm, setSearchTerm] = useState('');

  const [inventory, setInventory] = useState([
    { id: 1, sku: 'SKU-PRV-01', name: 'Signature Peri Peri Sauce', category: 'Proprietary (Dependent)', unit: 'Bottles', stock: 145, minStock: 50, cost: 350, location: 'Saddar Main Kitchen' },
    { id: 2, sku: 'SKU-VEG-02', name: 'Fresh Chicken Breast', category: 'Raw Materials (Local)', unit: 'Kg', stock: 24, minStock: 40, cost: 750, location: 'Saddar Main Kitchen' },
    { id: 3, sku: 'SKU-PKG-03', name: 'Branded Burger Boxes', category: 'Packaging (Dependent)', unit: 'Pieces', stock: 1200, minStock: 300, cost: 25, location: 'Saddar Main Kitchen' },
    { id: 4, sku: 'SKU-DAI-04', name: 'Cheddar Cheese Slices', category: 'Dairy (Local)', unit: 'Packs', stock: 12, minStock: 25, cost: 1100, location: 'Bahria Town Franchise' },
  ]);

  const filteredInventory = inventory.filter(item => 
    item.location === selectedLocation && 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Location Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory & Stock Control</h1>
          <p className="text-slate-400 text-sm mt-1">Manage location-specific stock levels and dependent purchasing rules.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-amber-500 w-full md:w-64"
          >
            <option value="Saddar Main Kitchen">Saddar Main Kitchen</option>
            <option value="Commercial Market Kitchen">Commercial Market Kitchen</option>
            <option value="Bahria Town Franchise">Bahria Town Franchise</option>
          </select>
          <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search product or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-slate-400">
          <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Showing stock for: <strong className="text-white">{selectedLocation}</strong>
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider bg-slate-950/50">
                <th className="p-4 font-semibold">SKU / Item Name</th>
                <th className="p-4 font-semibold">Category Type</th>
                <th className="p-4 font-semibold">Current Stock</th>
                <th className="p-4 font-semibold">Min Threshold</th>
                <th className="p-4 font-semibold">Unit Cost (Rs.)</th>
                <th className="p-4 font-semibold">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const isLowStock = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{item.sku}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${item.category.includes('Dependent') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">
                        {item.stock} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        Rs. {item.cost.toLocaleString()}
                      </td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 w-fit">
                            <AlertTriangle size={14} /> Low Stock Alert
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No inventory items found for {selectedLocation}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}