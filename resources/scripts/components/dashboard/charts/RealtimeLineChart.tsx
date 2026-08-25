import React, { useState } from 'react';

export interface ChartSeries {
    id: string;
    name: string;
    color: string;
    fillColor: string;
    data: number[]; // Array of numeric values (e.g. 0 to 100 or bytes)
    currentLabel?: string;
    unit?: string;
}

interface Props {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    series: ChartSeries[];
    yMax?: number;
    yLeftFormatter?: (val: number) => string;
    yRightFormatter?: (val: number) => string;
    timeLabels?: string[];
    tabs?: { id: string; label: string; icon?: React.ReactNode }[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    badge?: React.ReactNode;
}

export default ({
    title,
    subtitle,
    icon,
    series,
    yMax = 100,
    yLeftFormatter = (v) => `${Math.round(v)}%`,
    yRightFormatter = (v) => `${Math.round(v)}%`,
    timeLabels = ['-60s', '-45s', '-30s', '-15s', 'Live'],
    tabs,
    activeTab,
    onTabChange,
    badge,
}: Props) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Chart dimensions inside SVG viewBox
    const width = 620;
    const height = 230;
    const paddingLeft = 48;
    const paddingRight = 48;
    const paddingTop = 24;
    const paddingBottom = 32;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calculate max value for scaling (ensure min 1 to avoid / 0)
    const effectiveMax = Math.max(yMax, 1);

    // Helper to calculate X, Y coordinates for a series data array
    const getCoordinates = (data: number[]) => {
        if (!data || data.length === 0) return [];
        const count = data.length;
        return data.map((val, idx) => {
            const x = count === 1 ? paddingLeft + chartWidth / 2 : paddingLeft + (idx / (count - 1)) * chartWidth;
            const clampedVal = Math.max(0, Math.min(val, effectiveMax * 1.05));
            const y = paddingTop + chartHeight - (clampedVal / effectiveMax) * chartHeight;
            return { x, y, val };
        });
    };

    // Helper to generate smooth cubic bezier SVG path
    const generateBezierPath = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const controlPointX = (p0.x + p1.x) / 2;
            path += ` C ${controlPointX} ${p0.y}, ${controlPointX} ${p1.y}, ${p1.x} ${p1.y}`;
        }
        return path;
    };

    // Horizontal Y grid ticks (0%, 25%, 50%, 75%, 100%)
    const yTicks = [
        { ratio: 1.0, y: paddingTop, val: effectiveMax },
        { ratio: 0.75, y: paddingTop + chartHeight * 0.25, val: effectiveMax * 0.75 },
        { ratio: 0.5, y: paddingTop + chartHeight * 0.5, val: effectiveMax * 0.5 },
        { ratio: 0.25, y: paddingTop + chartHeight * 0.75, val: effectiveMax * 0.25 },
        { ratio: 0.0, y: paddingTop + chartHeight, val: 0 },
    ];

    // Vertical X grid lines
    const xGridPositions = [0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => ({
        x: paddingLeft + chartWidth * ratio,
        label: timeLabels[idx] || '',
    }));

    return (
        <div className={'p-4 sm:p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-lg flex flex-col justify-between select-none relative overflow-hidden group'}>
            {/* ── Header: Title, Tabs & Live Indicators ────────────── */}
            <div className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-800'}>
                <div className={'flex items-center gap-3 min-w-0'}>
                    {icon && (
                        <div className={'w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-primary-400 shrink-0 shadow-inner'}>
                            {icon}
                        </div>
                    )}
                    <div className={'min-w-0'}>
                        <div className={'flex items-center gap-2'}>
                            <h3 className={'text-sm sm:text-base font-bold text-white tracking-tight truncate'}>
                                {title}
                            </h3>
                            {badge}
                        </div>
                        {subtitle && <p className={'text-[11px] text-neutral-400 truncate mt-0.5'}>{subtitle}</p>}
                    </div>
                </div>

                {/* Optional Tabs Header */}
                {tabs && tabs.length > 0 && onTabChange && (
                    <div className={'flex items-center gap-1 bg-neutral-950/80 border border-neutral-800 p-1 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full'}>
                        {tabs.map((tab) => {
                            const isTabActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type={'button'}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                        isTabActive
                                            ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/80'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Series Live Legend (Current Values) ───────────────── */}
            <div className={'flex items-center gap-4 flex-wrap my-3 text-xs'}>
                {series.map((s) => (
                    <div key={s.id} className={'flex items-center gap-2'}>
                        <span className={'w-2.5 h-2.5 rounded-full shrink-0'} style={{ backgroundColor: s.color }} />
                        <span className={'text-neutral-400 font-medium'}>{s.name}:</span>
                        <span className={'font-bold text-neutral-100 tabular-nums'}>
                            {s.currentLabel || (s.data.length > 0 ? `${s.data[s.data.length - 1].toFixed(1)}${s.unit || ''}` : '0')}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── SVG Realtime Wave Line Chart ────────────────────────── */}
            <div className={'w-full relative'}>
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className={'w-full h-44 sm:h-52 overflow-visible'}
                    onMouseLeave={() => setHoverIndex(null)}
                >
                    <defs>
                        {series.map((s) => (
                            <linearGradient key={`grad-${s.id}`} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={s.fillColor} stopOpacity="0.45" />
                                <stop offset="50%" stopColor={s.fillColor} stopOpacity="0.15" />
                                <stop offset="100%" stopColor={s.fillColor} stopOpacity="0.0" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Horizontal Dashed Grid Lines & Left/Right Labels */}
                    {yTicks.map((tick, idx) => (
                        <g key={`y-grid-${idx}`}>
                            <line
                                x1={paddingLeft}
                                y1={tick.y}
                                x2={width - paddingRight}
                                y2={tick.y}
                                stroke="rgba(255, 255, 255, 0.07)"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                            />
                            {/* Left Y-Axis Label */}
                            <text
                                x={paddingLeft - 8}
                                y={tick.y + 3.5}
                                textAnchor="end"
                                className={'fill-neutral-500 text-[9px] font-mono'}
                            >
                                {yLeftFormatter(tick.val)}
                            </text>
                            {/* Right Y-Axis Label */}
                            <text
                                x={width - paddingRight + 8}
                                y={tick.y + 3.5}
                                textAnchor="start"
                                className={'fill-neutral-500 text-[9px] font-mono'}
                            >
                                {yRightFormatter(tick.val)}
                            </text>
                        </g>
                    ))}

                    {/* Vertical Dashed Grid Lines & Bottom X-Axis Time Labels */}
                    {xGridPositions.map((grid, idx) => (
                        <g key={`x-grid-${idx}`}>
                            <line
                                x1={grid.x}
                                y1={paddingTop}
                                x2={grid.x}
                                y2={paddingTop + chartHeight}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                            />
                            {/* Bottom X Time Label */}
                            <text
                                x={grid.x}
                                y={height - 10}
                                textAnchor={idx === 0 ? 'start' : idx === xGridPositions.length - 1 ? 'end' : 'middle'}
                                className={`text-[10px] font-mono ${idx === xGridPositions.length - 1 ? 'fill-emerald-400 font-bold' : 'fill-neutral-500'}`}
                            >
                                {grid.label}
                            </text>
                        </g>
                    ))}

                    {/* Render Series (Wave Gradient Area + Stroke Line + Live Pulse Point) */}
                    {series.map((s) => {
                        const points = getCoordinates(s.data);
                        if (points.length === 0) return null;

                        const linePath = generateBezierPath(points);
                        const lastPoint = points[points.length - 1];

                        // Area path for gradient under the wave
                        const firstPoint = points[0];
                        const areaPath = `${linePath} L ${lastPoint.x} ${paddingTop + chartHeight} L ${firstPoint.x} ${paddingTop + chartHeight} Z`;

                        return (
                            <g key={`series-group-${s.id}`}>
                                {/* Gradient Fill Area */}
                                <path d={areaPath} fill={`url(#grad-${s.id})`} className={'transition-all duration-300'} />

                                {/* Smooth Bezier Stroke Line */}
                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke={s.color}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={'transition-all duration-300'}
                                />

                                {/* Live Pulse Point on the latest data coordinate */}
                                {lastPoint && (
                                    <g>
                                        <circle
                                            cx={lastPoint.x}
                                            cy={lastPoint.y}
                                            r="4"
                                            fill={s.color}
                                            stroke="#0f172a"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx={lastPoint.x}
                                            cy={lastPoint.y}
                                            r="8"
                                            fill={s.color}
                                            opacity="0.4"
                                            className={'animate-ping'}
                                        />
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* ── Footer Info Note ─────────────────────────────────────── */}
            <div className={'mt-2 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500'}>
                <span className={'flex items-center gap-1.5'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'} />
                    Streaming metrik realtime per 2.5 detik
                </span>
                <span className={'font-mono'}>Rentang: 60 Detik Terakhir</span>
            </div>
        </div>
    );
};
