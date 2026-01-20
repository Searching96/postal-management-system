import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Info, ArrowRight, Navigation, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { ConsolidationRoute } from '../../models/consolidationRoute';
import { ConsolidationRouteMap } from '../../components/admin/ConsolidationRouteMap';
import { generateMockRoutes } from '../../hooks/realData';

export function ConsolidationRouteManagementPage() {
    const { user: currentUser } = useAuth();
    const [routes, setRoutes] = useState<ConsolidationRoute[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedRoute, setSelectedRoute] = useState<ConsolidationRoute | null>(null);
    const [selectedOfficeCode, setSelectedOfficeCode] = useState<string | null>(null);
    const [interactionMode, setInteractionMode] = useState<'VIEW' | 'PICK_DESTINATION'>('VIEW');

    const [pendingReroute, setPendingReroute] = useState<{
        sourceCode: string;
        targetId: string;
        targetName: string;
    } | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setRoutes(generateMockRoutes());
            setLoading(false);
        }, 500);
    }, []);

    // 1. Interaction Handler
    const handleNodeInteraction = (targetId: string, targetName: string, route?: ConsolidationRoute) => {
        if (interactionMode === 'PICK_DESTINATION' && selectedOfficeCode) {
            if (targetId === selectedOfficeCode) {
                alert("Cannot route a node to itself.");
                return;
            }
            setPendingReroute({
                sourceCode: selectedOfficeCode,
                targetId: targetId,
                targetName: targetName
            });
            return;
        }

        if (route) {
            setSelectedRoute(route);
            setSelectedOfficeCode(targetId);
        }
    };

    const handleOfficeClick = (officeCode: string, route: ConsolidationRoute) => {
        // officeCode could be 'warehouse-01' or '00123'
        const name = officeCode === 'warehouse-01' ? 'Hanoi Central (PW)' : `Office ${officeCode}`;
        handleNodeInteraction(officeCode, name, route);
    };

    // 2. Actions
    const startRerouteSelection = () => setInteractionMode('PICK_DESTINATION');

    const cancelRerouteSelection = () => {
        setInteractionMode('VIEW');
        setPendingReroute(null);
    };

    const confirmReroute = () => {
        if (!selectedRoute || !pendingReroute) return;

        const updatedRoutes = [...routes];
        const routeIdx = updatedRoutes.findIndex(r => r.id === selectedRoute.id);

        if (routeIdx > -1) {
            const stopIdx = updatedRoutes[routeIdx].routeStops.findIndex(s => s.officeCode === pendingReroute.sourceCode);
            if (stopIdx > -1) {
                (updatedRoutes[routeIdx].routeStops[stopIdx] as any).nextDestinationId = pendingReroute.targetId;
                setRoutes(updatedRoutes);
                setSelectedRoute({ ...updatedRoutes[routeIdx] });
            }
        }
        setPendingReroute(null);
        setInteractionMode('VIEW');
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const selectedStop = selectedRoute?.routeStops.find(s => s.officeCode === selectedOfficeCode);
    const nextId = (selectedStop as any)?.nextDestinationId;

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Route Graph Management</h1>
                {interactionMode === 'PICK_DESTINATION' && (
                    <button onClick={cancelRerouteSelection} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg flex items-center gap-2">
                        <XCircle className="w-5 h-5" /> Cancel Reroute
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ConsolidationRouteMap
                        routes={routes}
                        selectedRoute={selectedRoute}
                        selectedOfficeCode={selectedOfficeCode}
                        isSelectionMode={interactionMode === 'PICK_DESTINATION'}
                        onRouteClick={(r) => interactionMode === 'VIEW' && setSelectedRoute(r)}
                        onOfficeClick={handleOfficeClick}
                    />
                </div>

                <div className="lg:col-span-1">
                    {selectedRoute ? (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col sticky top-6">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-lg">{selectedRoute.name}</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
                                {selectedRoute.routeStops.map((stop, idx) => {
                                    const isSelected = selectedOfficeCode === stop.officeCode;
                                    const isWarehouse = stop.officeCode === 'warehouse-01';
                                    const stopNextId = (stop as any).nextDestinationId;

                                    return (
                                        <div
                                            key={stop.officeCode}
                                            onClick={() => interactionMode === 'VIEW' && setSelectedOfficeCode(stop.officeCode)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                                                : (interactionMode === 'VIEW' ? 'hover:border-blue-300' : 'opacity-40')
                                                } ${isWarehouse ? 'bg-orange-50/50 border-orange-100' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isWarehouse ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className={`font-medium text-sm ${isWarehouse ? 'text-orange-900' : ''}`}>
                                                        {isWarehouse ? 'Hanoi Central (PW)' : `Office ${stop.officeCode}`}
                                                    </span>
                                                </div>
                                                {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                            </div>

                                            <div className="mt-2 text-xs flex items-center gap-1 text-gray-500 bg-gray-100/50 p-1.5 rounded">
                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                <span className={stopNextId === 'warehouse-01' ? 'text-orange-600 font-bold' : ''}>
                                                    {stopNextId === 'warehouse-01' ? 'PW (Warehouse)' : `Office ${stopNextId}`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                {interactionMode === 'VIEW' ? (
                                    <button
                                        onClick={startRerouteSelection}
                                        disabled={!selectedOfficeCode}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        {selectedOfficeCode ? 'Reroute Selected Node' : 'Select a Node to Reroute'}
                                    </button>
                                ) : (
                                    <div className="text-center p-3 text-blue-800 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
                                        <p className="font-bold text-sm">Selection Mode Active</p>
                                        <p className="text-xs">Click a target node on the map</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 p-8">
                            <Info className="w-12 h-12 mb-2 opacity-20" />
                            <p>Select a route or node on the map</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {pendingReroute && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-blue-100 rounded-full text-blue-600">
                                <Navigation className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Confirm Reroute</h3>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 relative">
                            <div className="text-center z-10">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">From</p>
                                <p className="font-bold text-lg text-gray-800">{pendingReroute.sourceCode === 'warehouse-01' ? 'PW' : pendingReroute.sourceCode}</p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-blue-300" />
                            <div className="text-center z-10">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">To</p>
                                <p className="font-bold text-lg text-blue-600 truncate max-w-[120px]">{pendingReroute.targetId === 'warehouse-01' ? 'PW' : pendingReroute.targetId}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={cancelRerouteSelection} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={confirmReroute} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}