import { useEffect, useRef, useState } from 'react';

// Plotly is loaded via CDN in index.html, so we access it from window
declare global {
    interface Window {
        Plotly: any;
    }
}

interface Placement {
    order: number;
    id: string | number;
    x: number;
    y: number;
    z: number;
    l: number;
    w: number;
    h: number;
    color: string;
}

export interface PackingAnimationData {
    id: string | number;
    type: string;
    dim_l: number;
    dim_w: number;
    dim_h: number;
    items: number;
    fill_rate: string;
    placements: Placement[];
}

interface Packing3DAnimationProps {
    data: PackingAnimationData;
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    type?: 'BUNDLE' | 'CONTAINER';
    embedded?: boolean;
    onStepChange?: (step: number) => void;
    onCompleteAll?: () => void;
}

export function Packing3DAnimation({ data, isOpen, onClose, onConfirm, title, type = 'BUNDLE', embedded = false, onStepChange, onCompleteAll }: Packing3DAnimationProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);
    const chartRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initial Render
    useEffect(() => {
        if ((!isOpen && !embedded) || !data || !window.Plotly) return;

        // Reset state on open
        setCurrentStep(0);
        onStepChange?.(0);
        setIsPlaying(false);

        // Initial chart render
        renderChart(0);

        return () => {
            if (chartRef.current) {
                window.Plotly.purge(chartRef.current);
            }
        };
    }, [isOpen, data, embedded]);

    // Effect to handle rendering when step changes
    useEffect(() => {
        if ((!isOpen && !embedded) || !data) return;
        renderChart(currentStep);
        onStepChange?.(currentStep);

        // Auto-stop if we reached the end
        if (currentStep >= data.placements.length && isPlaying) {
            setIsPlaying(false);
        }
    }, [currentStep, isOpen, data, embedded]);

    // Effect for Animation Interval
    useEffect(() => {
        if (isPlaying) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev < data.placements.length) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, speed);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPlaying, speed, data.placements.length]);

    const renderChart = (step: number) => {
        if (!chartRef.current || !data) return;
        if (!window.Plotly) return;

        const placements = data.placements.slice(0, step);
        const traces: any[] = [];

        // 1. Container Wireframe
        traces.push({
            type: 'mesh3d',
            x: [0, data.dim_l, data.dim_l, 0, 0, data.dim_l, data.dim_l, 0],
            y: [0, 0, data.dim_w, data.dim_w, 0, 0, data.dim_w, data.dim_w],
            z: [0, 0, 0, 0, data.dim_h, data.dim_h, data.dim_h, data.dim_h],
            i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
            j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
            k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
            color: 'rgba(200,200,200,0.1)',
            opacity: 0.1,
            flatshading: true,
            hoverinfo: 'skip'
        });

        // Wireframe lines
        const cx = [0, data.dim_l, data.dim_l, 0, 0, null, 0, 0, null, data.dim_l, data.dim_l, null, data.dim_l, data.dim_l, null, 0, 0, data.dim_l, data.dim_l, 0, 0];
        const cy = [0, 0, data.dim_w, data.dim_w, 0, null, 0, 0, null, 0, 0, null, data.dim_w, data.dim_w, null, data.dim_w, data.dim_w, 0, 0, data.dim_w, data.dim_w];
        const cz = [0, 0, 0, 0, 0, null, 0, data.dim_h, null, 0, data.dim_h, null, 0, data.dim_h, null, 0, data.dim_h, data.dim_h, data.dim_h, data.dim_h, data.dim_h];

        traces.push({
            type: 'scatter3d',
            x: cx, y: cy, z: cz,
            mode: 'lines',
            line: { color: '#ccc', width: 2 },
            hoverinfo: 'skip'
        });

        // 2. Placed Items
        placements.forEach((p, i) => {
            const isLatest = i === placements.length - 1;

            traces.push({
                type: 'mesh3d',
                x: [p.x, p.x + p.l, p.x + p.l, p.x, p.x, p.x + p.l, p.x + p.l, p.x],
                y: [p.y, p.y, p.y + p.w, p.y + p.w, p.y, p.y, p.y + p.w, p.y + p.w],
                z: [p.z, p.z, p.z, p.z, p.z + p.h, p.z + p.h, p.z + p.h, p.z + p.h],
                i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
                j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
                k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
                color: p.color,
                opacity: 1.0,
                flatshading: true,
                name: `Item ${p.id}`,
                hovertemplate: `<b>${type === 'CONTAINER' ? 'Bundle' : 'Item'} #${p.id}</b><br>Size: ${p.l}x${p.w}x${p.h}<br>Pos: (${p.x}, ${p.y}, ${p.z})<extra></extra>`
            });

            if (isLatest) {
                const lx = [p.x, p.x + p.l, p.x + p.l, p.x, p.x, null, p.x, p.x, null, p.x + p.l, p.x + p.l, null, p.x + p.l, p.x + p.l, null, p.x, p.x, p.x + p.l, p.x + p.l, p.x, p.x];
                const ly = [p.y, p.y, p.y + p.w, p.y + p.w, p.y, null, p.y, p.y, null, p.y, p.y, null, p.y + p.w, p.y + p.w, null, p.y + p.w, p.y + p.w, p.y, p.y, p.y + p.w, p.y + p.w];
                const lz = [p.z, p.z, p.z, p.z, p.z, null, p.z, p.z + p.h, null, p.z, p.z + p.h, null, p.z, p.z + p.h, null, p.z, p.z + p.h, p.z + p.h, p.z + p.h, p.z + p.h, p.z + p.h];

                traces.push({
                    type: 'scatter3d',
                    x: lx, y: ly, z: lz,
                    mode: 'lines',
                    line: { color: '#00ff88', width: 5 },
                    hoverinfo: 'skip'
                });
            }
        });

        const layout = {
            scene: {
                xaxis: { title: 'L', range: [0, data.dim_l] },
                yaxis: { title: 'W', range: [0, data.dim_w] },
                zaxis: { title: 'H', range: [0, data.dim_h] },
                aspectmode: 'data',
                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } }
            },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            height: embedded ? undefined : 450, // Let height be responsive in embedded mode
            autosize: true
        };

        window.Plotly.react(chartRef.current, traces, layout, { responsive: true, displayModeBar: false });
    };

    const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setIsPlaying(false);
        setCurrentStep(val);
    };

    const handleCompleteAll = () => {
        setIsPlaying(false);
        const total = data.placements.length;
        setCurrentStep(total);
        onStepChange?.(total);
        // Debug button: notify parent to mark bundles as done
        onCompleteAll?.();
    };



    const handleStepBack = () => {
        setIsPlaying(false);
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleStepForward = () => {
        setIsPlaying(false);
        if (currentStep < data.placements.length) {
            setCurrentStep(c => c + 1);
        }
    };

    if (!isOpen && !embedded) return null;

    const Container = embedded ? 'div' : 'div';
    const containerClasses = embedded
        ? "w-full h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm"
        : "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";

    const contentClasses = embedded
        ? "w-full h-full flex flex-col overflow-hidden"
        : "bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]";

    return (
        <Container className={containerClasses}>
            <div className={contentClasses}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {title || (type === 'CONTAINER' ? 'Container Packing Plan' : `Packing Bundle #${data.id}`)}
                        </h2>
                        <div className="text-sm text-gray-500 mt-1 flex gap-4">
                            <span>{type === 'CONTAINER' ? 'Bundles' : 'Items'}: {currentStep} / {data.items}</span>
                            <span>Size: {data.dim_l}x{data.dim_w}x{data.dim_h}</span>
                            <span>Fill: {data.fill_rate}</span>
                        </div>
                        {currentStep >= data.placements.length ? (
                            <div className="text-sm font-bold text-green-600 mt-1">
                                ✓ All Items Packed
                            </div>
                        ) : (
                            <div className="text-sm font-semibold text-blue-600 mt-1">
                                {type === 'CONTAINER' ? 'Next Bundle' : 'Next Package'}: {data.placements[currentStep]?.id ? '#' + data.placements[currentStep].id : 'Processing...'}
                            </div>
                        )}
                    </div>
                    {!embedded && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* 3D Viewport */}
                <div className="flex-1 bg-gray-100 p-4 min-h-[300px] relative">
                    <div ref={chartRef} className="w-full h-full rounded-lg bg-white/50 border border-gray-200 shadow-inner" />
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 min-w-[60px]">
                            {currentStep}/{data.placements.length}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max={data.placements.length}
                            value={currentStep}
                            onChange={handleStepChange}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-y-2">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 font-medium uppercase">Speed</label>
                            <select
                                value={speed}
                                onChange={(e) => setSpeed(parseInt(e.target.value))}
                                className="text-sm bg-gray-100 border-none rounded-md py-1 pl-2 pr-6 cursor-pointer focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="1000">Slow</option>
                                <option value="500">Normal</option>
                                <option value="200">Fast</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleStepBack}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                            >
                                Previous
                            </button>

                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`px-6 py-1.5 text-sm font-bold text-white rounded-lg transition-all shadow-sm ${isPlaying
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isPlaying ? 'Pause ⏸' : 'Play ▶'}
                            </button>

                            <button
                                onClick={handleStepForward}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                            >
                                Next
                            </button>



                            {type === 'CONTAINER' && (
                                <>
                                    <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block" />

                                    <button
                                        onClick={handleCompleteAll}
                                        className="px-4 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                        title="Mark all bundles as packed and ready to load"
                                    >
                                        Mark All Bundles Ready
                                    </button>
                                </>
                            )}
                        </div>

                        {onConfirm && (
                            <button
                                onClick={onConfirm}
                                disabled={currentStep < data.placements.length}
                                className="ml-4 px-6 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {type === 'CONTAINER' ? 'Complete Packing' : 'Finish'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
}
