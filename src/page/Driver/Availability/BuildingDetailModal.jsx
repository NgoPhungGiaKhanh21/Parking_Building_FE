import React from 'react';
import { Modal } from 'antd';
import { 
  Building2, 
  Clock, 
  Car, 
  CreditCard, 
  FileText,
  CheckCircle2,
  AlertCircle,
  MapPin
} from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-6 last:mb-0">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
        <Icon size={18} />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
    </div>
    <div className="pl-1">
      {children}
    </div>
  </div>
);

const BuildingDetailModal = ({ visible, onClose, building }) => {
  if (!building) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={null}
      width={650}
      centered
      className="building-detail-modal"
      classNames={{
        content: 'p-0 overflow-hidden rounded-2xl shadow-2xl',
        mask: 'backdrop-blur-sm bg-slate-900/60',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-10 transform -rotate-12">
          <Building2 size={160} />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            OPERATIONAL
          </div>
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight">{building.name}</h2>
          <p className="text-blue-100 text-sm flex items-center gap-2 font-medium">
            <Car size={16} />
            {building.totalSlots} Total Parking Slots ({building.availableSlots} Available)
          </p>
        </div>
      </div>

      <div className="p-6 bg-[#f8fafc] max-h-[60vh] overflow-y-auto custom-scrollbar">
        
        {/* Operating Hours & Vehicle Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-emerald-500" />
              <h4 className="font-bold text-slate-700">Operating Hours</h4>
            </div>
            <p className="text-slate-600 font-medium text-lg ml-8">24/7</p>
            <p className="text-slate-400 text-sm ml-8 mt-1">Open all days including holidays</p>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Car size={20} className="text-indigo-500" />
              <h4 className="font-bold text-slate-700">Vehicle Types</h4>
            </div>
            <div className="flex flex-wrap gap-2 ml-8 mt-2">
              {building.vehicleTypes && building.vehicleTypes.length > 0 ? (
                building.vehicleTypes.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-100">
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">All typical vehicles</span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <Section icon={CreditCard} title="Pricing & Fees">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-5 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Base Price</p>
                <p className="text-2xl font-bold text-slate-800">
                  {building.sampleSlot?.basePrice ? formatCurrency(building.sampleSlot.basePrice) : 'N/A'}
                </p>
                <p className="text-slate-500 text-xs mt-1">First block</p>
              </div>
              <div className="p-5 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Hourly Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {building.sampleSlot?.hourlyRate ? formatCurrency(building.sampleSlot.hourlyRate) : 'N/A'}
                </p>
                <p className="text-slate-500 text-xs mt-1">Per subsequent hour</p>
              </div>
            </div>
            {building.sampleSlot?.maxHours && (
              <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                <p className="text-slate-600 text-sm font-medium flex justify-center items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-500" />
                  Maximum parking duration allowed: <strong className="text-slate-800">{building.sampleSlot.maxHours} Hours</strong>
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* Zone Availability */}
        <Section icon={MapPin} title="Zone Availability">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {building.zones?.map((zone) => (
              <div key={zone.zoneId} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700">Zone {zone.zoneName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Floor: {zone.floorName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{zone.availableSlots} <span className="text-slate-400 font-medium text-xs">/ {zone.totalSlots}</span></p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Available</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
        
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-100 flex justify-end rounded-b-2xl">
        <button
          onClick={onClose}
          className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-200 active:scale-95"
        >
          Got it
        </button>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </Modal>
  );
};

export default BuildingDetailModal;
