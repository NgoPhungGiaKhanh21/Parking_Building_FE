import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { 
  MapPin, 
  Info, 
  Car, 
  Search,
  Building2,
  ChevronRight,
  ParkingCircle
} from 'lucide-react';
import { getAllSlotDriverRequest } from '../../../redux/driver/reservationManagement/getAllSlotDriver/getAllSlotDriverSlice';
import BuildingDetailModal from './BuildingDetailModal';
import CommonBreadcrumb from '../../../components/Commandbreadcrumb/Commandbreadcrumb';

const AvailabilityPage = () => {
  const dispatch = useDispatch();
  const { listSlot, loading, error } = useSelector((state) => state.getAllSlotDriver);
  
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
          sampleSlot: null,
          zones: []
        });
      }
      
      const b = buildingMap.get(zone.buildingId);
      b.totalSlots += zone.totalSlots || 0;
      b.availableSlots += zone.availableSlots || 0;
      b.zones.push(zone);

      if (zone.floorVehicleTypeName) {
        b.vehicleTypes.add(zone.floorVehicleTypeName);
      }
      if (!b.sampleSlot && zone.slots && zone.slots.length > 0) {
        // Find a slot to extract pricing info
        b.sampleSlot = zone.slots[0];
      }
    });

    return Array.from(buildingMap.values()).map(b => ({
      ...b,
      vehicleTypes: Array.from(b.vehicleTypes)
    }));
  }, [listSlot]);

  const filteredBuildings = buildings.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (building) => {
    setSelectedBuilding(building);
    setIsModalVisible(true);
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] p-6 md:p-8">
      {/* Header section */}
      <div className="mb-6 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Driver" page="available" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-inner">
              <ParkingCircle size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Parking Availability
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                Find available parking slots across all our buildings.
              </p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-0 py-3 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuildings.map(building => {
              const availabilityPercentage = building.totalSlots > 0 
                ? Math.round((building.availableSlots / building.totalSlots) * 100) 
                : 0;
                
              let statusColor = "bg-green-50 text-green-700 ring-green-200";
              let statusText = "Available";
              
              if (availabilityPercentage === 0) {
                statusColor = "bg-red-50 text-red-700 ring-red-200";
                statusText = "Full";
              } else if (availabilityPercentage < 20) {
                statusColor = "bg-amber-50 text-amber-700 ring-amber-200";
                statusText = "Almost Full";
              }

              return (
                <div 
                  key={building.id} 
                  className="group bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 pb-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Building2 size={24} />
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {building.name}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                      <MapPin size={16} />
                      <span>{building.zones?.length || 0} Parking Zones</span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Slots</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-blue-600 leading-none">
                            {building.availableSlots}
                          </span>
                          <span className="text-sm font-medium text-slate-500">
                            / {building.totalSlots}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-16 h-16 rounded-full border-4 border-slate-100 relative flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-100"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={28 * 2 * Math.PI}
                            strokeDashoffset={(28 * 2 * Math.PI) - ((availabilityPercentage / 100) * (28 * 2 * Math.PI))}
                            className={
                              availabilityPercentage > 20 
                                ? "text-green-500" 
                                : availabilityPercentage > 0 
                                  ? "text-amber-500" 
                                  : "text-red-500"
                            }
                          />
                        </svg>
                        <Car size={20} className={
                              availabilityPercentage > 20 
                                ? "text-green-500" 
                                : availabilityPercentage > 0 
                                  ? "text-amber-500" 
                                  : "text-red-500"
                            } />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => handleOpenModal(building)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow-md"
                    >
                      <Info size={18} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BuildingDetailModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        building={selectedBuilding} 
      />
    </div>
  );
};

export default AvailabilityPage;
