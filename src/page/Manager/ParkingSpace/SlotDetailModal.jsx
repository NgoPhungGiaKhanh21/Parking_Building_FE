import React from 'react';
import { Modal, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { 
  Car, User, Clock, Calendar, 
  MapPin, Tag, Hash, CreditCard 
} from 'lucide-react';

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A';
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  
  if (status === 'OCCUPIED' || status === 'ACTIVE') {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === 'RESERVED' || status === 'APPROVED') {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (status === 'COMPLETED') {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClass}`}>
      {status || 'N/A'}
    </span>
  );
};

const SectionHeading = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-3 mt-5 pb-2 border-b border-slate-100">
    <Icon size={18} className="text-violet-500" />
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
  </div>
);

const StackedDetail = ({ label, value, isBold, valueClass = "" }) => (
  <div className="flex flex-col py-1.5">
    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-sm text-slate-800 ${isBold ? 'font-bold' : 'font-medium'} ${valueClass}`}>
      {value || '—'}
    </span>
  </div>
);

const DetailRow = ({ label, value, isBold }) => (
  <div className="flex justify-between items-center py-1.5">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm text-slate-800 text-right ${isBold ? 'font-semibold' : ''}`}>
      {value || '—'}
    </span>
  </div>
);

const SlotDetailModal = ({ visible, onClose, slotName }) => {
  const { getOccupiedSlot: data, loading, error } = useSelector(
    (state) => state.getOccupiedSlot
  );

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={null}
      width={650}
      centered
      className="slot-detail-modal"
      classNames={{
        content: 'p-0 overflow-hidden rounded-2xl shadow-2xl',
        mask: 'backdrop-blur-sm bg-slate-900/60',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-10 transform rotate-12">
          <Car size={160} />
        </div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-extrabold mb-1 tracking-tight">Slot {data?.slotName || slotName || 'Details'}</h2>
            <p className="text-violet-100 text-sm flex items-center gap-1.5 font-medium">
              <MapPin size={16} />
              {data ? `${data.buildingName} • ${data.floorName} • Zone ${data.zoneName}` : 'Location Loading...'}
            </p>
          </div>
          {data?.slotStatus && (
            <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold border border-white/30 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {data.slotStatus}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-[#f8fafc] min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-16 space-y-4">
            <Spin size="large" />
            <p className="text-slate-500 font-medium animate-pulse">Retrieving comprehensive slot data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-50">
              <Car size={32} />
            </div>
            <p className="text-slate-800 font-bold text-lg">{error}</p>
            <p className="text-slate-500 mt-2 text-sm max-w-sm">
              Could not load details for this slot. It might be available or the system encountered an error.
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Car size={32} />
            </div>
            <p className="text-slate-500 font-medium">No occupancy details available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Vehicle Details */}
            <div className="col-span-1 md:col-span-2">
              <SectionHeading icon={Car} title="Vehicle Information" />
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <StackedDetail label="Plate Number" value={data.vehiclePlateNumber} isBold valueClass="text-blue-600 text-base" />
                  <StackedDetail label="Brand & Model" value={`${data.vehicleBrand || ''} ${data.vehicleModel || ''}`} />
                  <StackedDetail label="Color" value={data.vehicleColor} />
                  <StackedDetail label="Type" value={data.vehicleTypeName} />
                </div>
              </div>
            </div>

            {/* Driver Details */}
            <div className="col-span-1">
              <SectionHeading icon={User} title="Driver Profile" />
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow h-[170px]">
                <DetailRow label="Full Name" value={data.driverFullName} isBold />
                <div className="my-2 border-t border-dashed border-slate-100" />
                <DetailRow label="Phone" value={data.driverPhoneNumber} />
                <div className="my-2 border-t border-dashed border-slate-100" />
                <DetailRow label="Email" value={data.driverEmail} />
              </div>
            </div>

            {/* Parking Session */}
            <div className="col-span-1">
              <SectionHeading icon={Clock} title="Parking Session" />
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow h-[170px]">
                <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">Session Status</span>
                  <StatusBadge status={data.sessionStatus} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <StackedDetail label="Check-in Time" value={formatDateTime(data.checkinTime)} />
                  <StackedDetail label="Duration" value={formatDuration(data.parkedDurationMinutes)} isBold valueClass="text-violet-600" />
                </div>
              </div>
            </div>

            {/* Reservation Details (If applicable) */}
            {data.reservationId && (
              <div className="col-span-1 md:col-span-2">
                <SectionHeading icon={Calendar} title="Reservation Info" />
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Reservation Status</span>
                    <StatusBadge status={data.reservationStatus} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StackedDetail label="Ticket Code" value={data.ticketCode} isBold valueClass="text-purple-600 font-mono text-base" />
                    <StackedDetail label="Start Time" value={formatDateTime(data.reservationStart)} />
                    <StackedDetail label="End Time" value={formatDateTime(data.reservationEnd)} />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      
      {/* Footer action area */}
      <div className="p-4 bg-white border-t border-slate-100 flex justify-end rounded-b-2xl">
        <button
          onClick={onClose}
          className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-200 active:scale-95"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default SlotDetailModal;
