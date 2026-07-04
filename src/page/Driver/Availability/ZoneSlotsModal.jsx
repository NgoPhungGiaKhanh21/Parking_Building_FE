import React from 'react';
import { Modal, Spin } from 'antd';
import { MapPin, Car, CheckCircle2, XCircle, Bike, Clock } from 'lucide-react';

const ZoneSlotsModal = ({ visible, onClose, zone, slots, loading }) => {
  if (!zone) return null;

  const availableSlots = slots?.filter(s => s.slotStatus === 'Available') || [];
  const occupiedSlots = slots?.filter(s => s.slotStatus !== 'Available') || [];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={null}
      width={700}
      centered
      destroyOnClose
      classNames={{
        content: 'p-0 overflow-hidden rounded-2xl shadow-2xl',
        mask: 'backdrop-blur-sm bg-slate-900/60',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
          <MapPin size={140} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-2">
            <MapPin size={12} />
            {zone.floorName || 'Floor'}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{zone.zoneName}</h2>
          <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-300" />
              {zone.availableSlots} Available
            </span>
            <span>·</span>
            <span>{zone.totalSlots} Total Slots</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 bg-[#f8fafc] max-h-[55vh] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-70">
            <Spin size="large" />
            <p className="mt-3 text-sm font-medium text-slate-500">Loading slots...</p>
          </div>
        ) : !slots || slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Car size={48} strokeWidth={1.2} />
            <p className="mt-3 text-sm font-medium">No slot data available.</p>
          </div>
        ) : (
          <>
            {/* Available */}
            {availableSlots.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Available</span>
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{availableSlots.length}</span>
                  <div className="flex-1 border-t border-dashed border-slate-200" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="bg-white rounded-xl border-2 border-emerald-200 p-3 text-center hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 mx-auto rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-sm font-extrabold text-slate-800">{slot.slotName}</p>
                      {slot.vehicleTypeName && (
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1 flex items-center justify-center gap-1">
                          {slot.vehicleTypeName === 'Car' ? <Car size={10} /> : <Bike size={10} />}
                          {slot.vehicleTypeName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Occupied */}
            {occupiedSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Occupied / Unavailable</span>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{occupiedSlots.length}</span>
                  <div className="flex-1 border-t border-dashed border-slate-200" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {occupiedSlots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center opacity-60"
                    >
                      <div className="w-9 h-9 mx-auto rounded-lg bg-red-50 text-red-400 flex items-center justify-center mb-2">
                        <XCircle size={18} />
                      </div>
                      <p className="text-sm font-bold text-slate-500">{slot.slotName}</p>
                      {slot.vehicleTypeName && (
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-1">{slot.vehicleTypeName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
        <button
          onClick={onClose}
          className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
        >
          Close
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>
    </Modal>
  );
};

export default ZoneSlotsModal;
