import React, { useState } from 'react';
import { Truck, Plus, CheckCircle, XCircle, Clock, PackageCheck, AlertCircle } from 'lucide-react';

export default function SupplyRequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: 'REQ-2026-089',
      requester: 'Bahria Town Franchise',
      supplyingBranch: 'Saddar Main Kitchen',
      date: '2026-10-28',
      itemsCount: 3,
      status: 'Pending',
      items: [
        { name: 'Signature Peri Peri Sauce', qty: 20, unit: 'Bottles' },
        { name: 'Special Tikka Spice Mix', qty: 15, unit: 'Packs' },
        { name: 'Branded Burger Boxes', qty: 500, unit: 'Pieces' },
      ],
    },
    {
      id: 'REQ-2026-084',
      requester: 'Commercial Market Outlet',
      supplyingBranch: 'Saddar Main Kitchen',
      date: '2026-10-27',
      itemsCount: 2,
      status: 'Dispatched',
      items: [
        { name: 'Branded Wrapping Paper', qty: 1000, unit: 'Sheets' },
        { name: 'Signature Peri Peri Sauce', qty: 30, unit: 'Bottles' },
      ],
    },
    {
      id: 'REQ-2026-078',
      requester: 'Bahria Town Franchise',
      supplyingBranch: 'Saddar Main Kitchen',
      date: '2026-10-25',
      itemsCount: 1,
      status: 'Received',
      items: [
        { name: 'Special Tikka Spice Mix', qty: 25, unit: 'Packs' },
      ],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={14} /> Pending Approval</span>;
      case 'Approved':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20"><CheckCircle size={14} /> Approved</span>;
      case 'Dispatched':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Truck size={14} /> Dispatched</span>;
      case 'Received':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><PackageCheck size={14} /> Received</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle size={14} /> Rejected</span>;
      default:
        return null;
    }
  };

  const handleUpdateStatus = (reqId, newStatus) => {
    setRequests(requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Supply Request Workflow</h1>
          <p className="text-slate-400 text-sm mt-1">Inter-branch and franchise supply transfers for dependent raw materials.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg text-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          <span>New Supply Request</span>
        </button>
      </div>

      {/* Request Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider bg-slate-950/50">
                <th className="p-4 font-semibold">Request ID</th>
                <th className="p-4 font-semibold">Requester (Franchise/Outlet)</th>
                <th className="p-4 font-semibold">Supplying Branch</th>
                <th className="p-4 font-semibold">Items Requested</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-850 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-amber-400">{req.id}</td>
                  <td className="p-4 font-medium text-white">{req.requester}</td>
                  <td className="p-4 text-slate-300">{req.supplyingBranch}</td>
                  <td className="p-4 font-semibold text-white">{req.itemsCount} Items</td>
                  <td className="p-4 text-slate-400 text-xs">{req.date}</td>
                  <td className="p-4">{getStatusBadge(req.status)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail & Status Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Supply Request #{selectedRequest.id}</h3>
                <p className="text-xs text-slate-400">From: {selectedRequest.requester}</p>
              </div>
              {getStatusBadge(selectedRequest.status)}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested Items</p>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                {selectedRequest.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-amber-400 font-bold">{item.qty} <span className="text-xs font-normal text-slate-400">{item.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer shadow-lg"
                  >
                    Approve Request
                  </button>
                </>
              )}

              {selectedRequest.status === 'Approved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Dispatched')}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold cursor-pointer shadow-lg"
                >
                  Mark as Dispatched
                </button>
              )}

              {selectedRequest.status === 'Dispatched' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'Received')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer shadow-lg"
                >
                  Confirm Delivery & Update Stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}