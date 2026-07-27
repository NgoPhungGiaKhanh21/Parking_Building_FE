import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import {
  MapPin, Car, X, Eye,
  CheckCircle2, AlertCircle, Layers
} from 'lucide-react';
import { getZoneSlotsRequest, getZoneSlotsReset } from '../../../redux/driver/reservationManagement/getZoneSlots/getZoneSlotsSlice';

const isAvail = (s) => {
  const st = (s.slotStatus || s.status || '').toString().toLowerCase();
  return st === 'available';
};

/**
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - floor: { floorName, zones: [...] }
 *  - buildingName: string
 */
const BuildingFloorsModal = ({ visible, onClose, floor, buildingName }) => {
  const dispatch = useDispatch();
  const [selectedZone, setSelectedZone] = useState(null);
  const { slots, loading: loadingSlots } = useSelector((s) => s.getZoneSlots);

  const openSlots = (zone) => {
    setSelectedZone(zone);
    dispatch(getZoneSlotsRequest(zone.zoneId));
  };

  const closeSlots = () => {
    setSelectedZone(null);
    dispatch(getZoneSlotsReset());
  };

  const handleClose = () => {
    closeSlots();
    onClose();
  };

  if (!visible || !floor) return null;

  const zones = [...(floor.zones || [])].sort((a, b) => (a.zoneName || '').localeCompare(b.zoneName || ''));
  const totalAvail = zones.reduce((s, z) => s + (z.slotSummary?.available ?? z.availableSlots ?? 0), 0);
  const totalSlots = zones.reduce((s, z) => s + (z.slotSummary?.total ?? z.totalSlots ?? 0), 0);

  const avail = slots?.filter(isAvail) || [];
  const occupied = slots?.filter(s => !isAvail(s)) || [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      <div className="relative z-10 flex gap-4 max-w-[95vw] max-h-[85vh]" onClick={e => e.stopPropagation()}>

        {/* ── Left Panel: Zones ── */}
        <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out ${selectedZone ? 'w-[480px]' : 'w-[560px]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-5 text-white relative flex-shrink-0">
            <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer">
              <X size={16} />
            </button>
            <p className="text-blue-200 text-xs font-semibold mb-0.5">{buildingName}</p>
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Layers size={20} /> {floor.floorName}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-blue-100 text-sm font-medium">
              <span>{zones.length} Zones</span>
              <span>·</span>
              <span>{totalAvail} / {totalSlots} slots available</span>
            </div>
          </div>

          {/* Zone List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {zones.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-slate-400">
                <MapPin size={40} strokeWidth={1.2} />
                <p className="mt-2 text-sm">No zones on this floor.</p>
              </div>
            ) : (
              zones.map(zone => {
                const zTotal = zone.slotSummary?.total ?? zone.totalSlots ?? 0;
                const zAvail = zone.slotSummary?.available ?? zone.availableSlots ?? 0;
                const pct = zTotal > 0 ? Math.round((zAvail / zTotal) * 100) : 0;
                const barCl = pct === 0 ? 'bg-red-400' : pct < 30 ? 'bg-amber-400' : 'bg-emerald-400';
                const txtCl = pct === 0 ? 'text-red-600' : pct < 30 ? 'text-amber-600' : 'text-emerald-600';
                const isSel = selectedZone?.zoneId === zone.zoneId;

                return (
                  <div
                    key={zone.zoneId}
                    onClick={() => openSlots(zone)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSel
                        ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 shadow-md'
                        : 'border-slate-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSel ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{zone.zoneName}</h4>
                          {zone.vehicleTypeName && (
                            <p className="text-[10px] text-slate-400 font-medium">{zone.vehicleTypeName}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-extrabold ${txtCl}`}>{zAvail}</span>
                        <span className="text-xs text-slate-400 font-medium"> / {zTotal}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all duration-500 ${barCl}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-500">
                      <Eye size={11} /> View Slots
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Panel: Zone Slots ── */}
        <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out origin-left ${
          selectedZone ? 'w-[440px] opacity-100 scale-100' : 'w-0 opacity-0 scale-95 pointer-events-none'
        }`}>
          {selectedZone && (
            <>
              {/* Slot Header */}
              <div className="bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 p-5 text-white relative flex-shrink-0">
                <button onClick={closeSlots} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer">
                  <X size={14} />
                </button>
                <p className="text-purple-200 text-[10px] font-bold uppercase tracking-wider mb-0.5">{floor.floorName} · {selectedZone.zoneName}</p>
                <h3 className="text-lg font-extrabold">Parking Slots</h3>
                <p className="text-purple-200 text-xs mt-1 font-medium">
                  {selectedZone.slotSummary?.available ?? selectedZone.availableSlots ?? 0} available · {selectedZone.slotSummary?.total ?? selectedZone.totalSlots ?? 0} total
                </p>
              </div>

              {/* Slot Body */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loadingSlots ? (
                  <div className="flex flex-col items-center py-16"><Spin /><p className="mt-2 text-xs text-slate-500">Loading slots...</p></div>
                ) : !slots || slots.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-slate-400"><Car size={36} strokeWidth={1.2} /><p className="mt-2 text-xs">No slot data.</p></div>
                ) : (
                  <>
                    {/* Available */}
                    {avail.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Available</span>
                          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">{avail.length}</span>
                          <div className="flex-1 border-t border-dashed border-slate-200" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {avail.map(slot => (
                            <div key={slot.slotId} className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center hover:shadow-sm transition-all">
                              <CheckCircle2 size={18} className="mx-auto text-emerald-500 mb-1.5" />
                              <p className="text-xs font-bold text-slate-800">{slot.slotName}</p>
                              {slot.vehicleTypeName && <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">{slot.vehicleTypeName}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Occupied */}
                    {occupied.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Occupied</span>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{occupied.length}</span>
                          <div className="flex-1 border-t border-dashed border-slate-200" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {occupied.map(slot => (
                            <div key={slot.slotId} className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center opacity-50">
                              <Car size={18} className="mx-auto text-slate-400 mb-1.5" />
                              <p className="text-xs font-bold text-slate-500">{slot.slotName}</p>
                              {slot.vehicleTypeName && <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">{slot.vehicleTypeName}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:5px}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
      `}</style>
    </div>
  );
};

export default BuildingFloorsModal;
