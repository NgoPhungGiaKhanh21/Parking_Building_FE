import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import {
  MapPin,
  Car,
  Search,
  Building2,
  ParkingCircle,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Bike,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { getAllSlotDriverRequest } from '../../../redux/driver/reservationManagement/getAllSlotDriver/getAllSlotDriverSlice';
import CommonBreadcrumb from '../../../components/Commandbreadcrumb/Commandbreadcrumb';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/* ─── Building Row Component ──────────────────────────────────────────────── */
const BuildingRow = ({ building, formatCurrency }) => {
  const [expanded, setExpanded] = useState(false);

  const availabilityPercentage = building.totalSlots > 0
    ? Math.round((building.availableSlots / building.totalSlots) * 100)
    : 0;

  let statusColor, statusBg, statusText, barColor;
  if (availabilityPercentage === 0) {
    statusColor = 'text-red-600';
    statusBg = 'bg-red-50 border-red-200';
    statusText = 'Full';
    barColor = 'bg-red-500';
  } else if (availabilityPercentage < 20) {
    statusColor = 'text-amber-600';
    statusBg = 'bg-amber-50 border-amber-200';
    statusText = 'Almost Full';
    barColor = 'bg-amber-500';
  } else {
    statusColor = 'text-emerald-600';
    statusBg = 'bg-emerald-50 border-emerald-200';
    statusText = 'Available';
    barColor = 'bg-emerald-500';
  }

  // Group zones by floor
  const zonesByFloor = useMemo(() => {
    if (!building.zones) return {};
    return building.zones.reduce((acc, zone) => {
      const floorName = zone.floorName || 'Unknown Floor';
      if (!acc[floorName]) acc[floorName] = [];
      acc[floorName].push(zone);
      return acc;
    }, {});
  }, [building]);

  const operatingHours = useMemo(() => {
    if (building.operatingHoursDisplay) return building.operatingHoursDisplay;
    if (building.operatingStartTime && building.operatingEndTime) {
      return `${building.operatingStartTime?.slice(0, 5)} – ${building.operatingEndTime?.slice(0, 5)}`;
    }
    return null;
  }, [building]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Main Row */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">

          {/* Left: Building Identity */}
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 size={28} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 truncate">
                  {building.name}
                </h2>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusBg} ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${barColor} ${availabilityPercentage > 0 ? 'animate-pulse' : ''}`} />
                  {statusText}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {building.zones?.length || 0} Zones
                </span>
                {operatingHours && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    {operatingHours}
                  </span>
                )}
                {building.vehicleTypes?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Car size={14} className="text-slate-400" />
                    {building.vehicleTypes.join(' · ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Availability Bar */}
          <div className="flex-shrink-0 lg:w-[280px]">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Availability</span>
              <span className="text-xs font-semibold text-slate-500">{availabilityPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className={`text-2xl font-extrabold ${statusColor}`}>{building.availableSlots}</span>
              <span className="text-sm text-slate-400 font-medium">/ {building.totalSlots} slots</span>
            </div>
          </div>

          {/* Right: Pricing + Action */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {building.pricingByType?.length > 0 && (
              <div className="hidden md:flex flex-col gap-1 items-end">
                {building.pricingByType.slice(0, 2).map((p) => (
                  <div key={p.typeName} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{p.typeName}</span>
                    <span className="text-sm font-extrabold text-blue-600">{formatCurrency(p.basePrice)}</span>
                  </div>
                ))}
                {building.pricingByType.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{building.pricingByType.length - 2} more</span>
                )}
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer active:scale-95 ${
                expanded
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 hover:shadow-lg'
              }`}
            >
              {expanded ? 'Hide' : 'View'} Details
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

        </div>
      </div>

      {/* Expanded Details Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          {/* Info Strip */}
          {/* Info Strip: Hours + Vehicle Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100">
            {/* Operating Hours */}
            <div className="bg-white p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating Hours</p>
              </div>
              <p className="text-base font-bold text-slate-800 ml-[46px]">
                {operatingHours || 'Not specified'}
              </p>
            </div>

            {/* Vehicle Types */}
            <div className="bg-white p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Car size={18} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Vehicles</p>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-[46px]">
                {building.vehicleTypes?.length > 0 ? building.vehicleTypes.map((type, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                    {type}
                  </span>
                )) : (
                  <span className="text-sm text-slate-500">All types</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing by Vehicle Type */}
          {building.pricingByType?.length > 0 && (
            <div className="p-6 md:px-8">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-800">Pricing by Vehicle Type</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {building.pricingByType.map((p) => (
                  <div key={p.typeName} className="bg-white rounded-2xl border border-slate-200/70 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Car size={14} />
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">{p.typeName}</h4>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Base Price</p>
                        <p className="text-lg font-extrabold text-slate-800">{formatCurrency(p.basePrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Hourly</p>
                        <p className="text-base font-bold text-blue-600">{formatCurrency(p.hourlyRate)}</p>
                      </div>
                    </div>
                    {p.maxHours && (
                      <p className="text-[11px] text-amber-600 font-medium mt-2 flex items-center gap-1">
                        <AlertCircle size={11} /> Max parking: {p.maxHours}h
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zone Breakdown */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Zone Breakdown by Floor</h3>
            </div>

            {Object.entries(zonesByFloor).length > 0 ? (
              <div className="space-y-5">
                {Object.entries(zonesByFloor).map(([floorName, zones]) => (
                  <div key={floorName}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{floorName}</span>
                      <div className="flex-1 border-t border-dashed border-slate-200" />
                      <span className="text-xs font-medium text-slate-400">
                        {zones.reduce((sum, z) => sum + (z.availableSlots || 0), 0)} available
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {zones.map((zone) => {
                        const zonePercent = zone.totalSlots > 0 ? Math.round((zone.availableSlots / zone.totalSlots) * 100) : 0;
                        const zoneBarColor = zonePercent === 0 ? 'bg-red-400' : zonePercent < 30 ? 'bg-amber-400' : 'bg-emerald-400';
                        const zoneStatusColor = zonePercent === 0 ? 'text-red-600' : zonePercent < 30 ? 'text-amber-600' : 'text-emerald-600';

                        return (
                          <div key={zone.zoneId} className="bg-white rounded-2xl border border-slate-200/70 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                  <MapPin size={14} />
                                </div>
                                <h4 className="font-bold text-slate-700 text-sm">{zone.zoneName}</h4>
                              </div>
                              <div className="text-right">
                                <span className={`text-base font-extrabold ${zoneStatusColor}`}>{zone.availableSlots}</span>
                                <span className="text-xs text-slate-400 font-medium"> / {zone.totalSlots}</span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${zoneBarColor}`}
                                style={{ width: `${zonePercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic text-center py-6">No zone data available for this building.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const AvailabilityPage = () => {
  const dispatch = useDispatch();
  const { listSlot, loading, error } = useSelector((state) => state.getAllSlotDriver);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getAllSlotDriverRequest());
  }, [dispatch]);

  // Aggregate zone data into building data
  const buildings = useMemo(() => {
    if (!listSlot || !Array.isArray(listSlot)) return [];

    const buildingMap = new Map();

    listSlot.forEach(zone => {
      if (!buildingMap.has(zone.buildingId)) {
        buildingMap.set(zone.buildingId, {
          id: zone.buildingId,
          name: zone.buildingName,
          totalSlots: 0,
          availableSlots: 0,
          vehicleTypes: new Set(),
          pricingMap: new Map(),
          zones: [],
          operatingStartTime: zone.operatingStartTime || null,
          operatingEndTime: zone.operatingEndTime || null,
          operatingHoursDisplay: zone.operatingHoursDisplay || null,
        });
      }

      const b = buildingMap.get(zone.buildingId);
      b.totalSlots += zone.totalSlots || 0;
      b.availableSlots += zone.availableSlots || 0;
      b.zones.push(zone);

      if (zone.floorVehicleTypeName) {
        b.vehicleTypes.add(zone.floorVehicleTypeName);
      }
      // Collect pricing per vehicle type
      if (zone.floorVehicleTypeName && zone.slots?.length > 0) {
        const slot = zone.slots[0];
        if (!b.pricingMap.has(zone.floorVehicleTypeName) && (slot.basePrice || slot.hourlyRate)) {
          b.pricingMap.set(zone.floorVehicleTypeName, {
            typeName: zone.floorVehicleTypeName,
            basePrice: slot.basePrice,
            hourlyRate: slot.hourlyRate,
            maxHours: slot.maxHours || null,
          });
        }
      }
    });

    return Array.from(buildingMap.values()).map(b => ({
      ...b,
      vehicleTypes: Array.from(b.vehicleTypes),
      pricingByType: Array.from(b.pricingMap.values()),
    }));
  }, [listSlot]);

  const filteredBuildings = buildings.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary stats
  const totalAvailable = buildings.reduce((sum, b) => sum + b.availableSlots, 0);
  const totalSlots = buildings.reduce((sum, b) => sum + b.totalSlots, 0);

  return (
    <div className="min-h-screen bg-[#f3f0fa] p-4 md:p-8">
      {/* Hero Header */}
      <div className="mb-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/50 p-6 md:p-8 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Driver" page="available" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hidden md:flex">
              <ParkingCircle size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                Find Parking
              </h1>
              <p className="mt-1.5 text-base text-slate-500 font-medium max-w-lg">
                Browse available parking across all locations. Select a building to see real-time availability, pricing, and zone details.
              </p>
            </div>
          </div>

          {/* Stats badges */}
          {!loading && buildings.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {totalAvailable} Available
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-600">
                {totalSlots} Total
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600">
                <Building2 size={13} /> {buildings.length} {buildings.length === 1 ? 'Building' : 'Buildings'}
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-6 relative max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by building name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm font-medium transition-all bg-white"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-slate-100">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Scanning parking availability...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <Building2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-slate-500 max-w-md">{error}</p>
        </div>
      ) : filteredBuildings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Buildings Found</h3>
          <p className="text-slate-500">We couldn't find any parking buildings matching your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBuildings.map(building => (
            <BuildingRow key={building.id} building={building} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityPage;
