import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import { Server as ServerIcon, Cpu, HardDrive, Globe, Layers, ChevronRight } from 'lucide-react';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

/* ─── Vertically Aligned Metric Capsule ───────────────────────────────── */
const MetricCapsule = ({
    icon: Icon,
    label,
    value,
    limit,
    percent,
    alarm,
    barColor,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    limit: string;
    percent: number;
    alarm: boolean;
    barColor: string;
}) => (
    <div
        className={
            'flex-1 min-w-[90px] sm:min-w-[110px] bg-neutral-800/50 border border-neutral-700/40 rounded-xl px-3 py-2 flex flex-col justify-between transition-colors'
        }
    >
        {/* Row 1: Icon + Label on left, Limit on right — perfectly aligned */}
        <div className={'flex items-center justify-between gap-1 text-[10px] uppercase font-semibold text-neutral-400'}>
            <div className={'flex items-center gap-1.5 shrink-0'}>
                <Icon size={13} className={alarm ? 'text-rose-400' : 'text-neutral-400'} />
                <span className={'tracking-wider'}>{label}</span>
            </div>
            <span className={'text-[9px] font-normal text-neutral-500 truncate text-right'}>{limit}</span>
        </div>

        {/* Row 2: Live Metric Value */}
        <div className={'my-1'}>
            <p
                className={`text-xs sm:text-sm font-bold tabular-nums tracking-tight truncate ${
                    alarm ? 'text-rose-400' : 'text-neutral-100'
                }`}
            >
                {value}
            </p>
        </div>

        {/* Row 3: Progress Bar */}
        <div className={'w-full h-1 bg-neutral-700/50 rounded-full overflow-hidden'}>
            <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                    alarm ? 'bg-rose-500' : barColor
                }`}
                style={{ width: `${Math.max(percent, 0)}%` }}
            />
        </div>
    </div>
);

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    /* ── Real-time Auto-Update Polling (2.5s interval with visibility detection) ── */
    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;

        let activeInterval: Timer | null = null;

        const startPolling = () => {
            getStats();
            if (!activeInterval) {
                // Poll every 2.5 seconds for realtime movement like console
                activeInterval = setInterval(() => getStats(), 2500);
            }
        };

        const stopPolling = () => {
            if (activeInterval) {
                clearInterval(activeInterval);
                activeInterval = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startPolling();
            } else {
                stopPolling();
            }
        };

        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const defaultAllocation = server.allocations.find((alloc) => alloc.isDefault);
    const allocationString = defaultAllocation
        ? `${defaultAllocation.alias || ip(defaultAllocation.ip)}:${defaultAllocation.port}`
        : null;

    const getStatusTheme = () => {
        if (isSuspended) return { bar: 'before:bg-rose-500/70', icon: 'text-rose-400 group-hover:text-rose-300' };
        if (server.isNodeUnderMaintenance) return { bar: 'before:bg-purple-500/70', icon: 'text-purple-400 group-hover:text-purple-300' };
        if (server.isTransferring) return { bar: 'before:bg-sky-500/70', icon: 'text-sky-400 group-hover:text-sky-300' };
        if (server.status === 'installing' || server.status === 'restoring_backup') return { bar: 'before:bg-amber-500/70', icon: 'text-amber-400 group-hover:text-amber-300' };
        if (stats?.status === 'running' || stats?.status === 'starting') return { bar: 'before:bg-emerald-500/70 group-hover:before:bg-emerald-400', icon: 'text-emerald-400 group-hover:text-emerald-300' };
        if (stats?.status === 'stopping') return { bar: 'before:bg-rose-500/70', icon: 'text-rose-400 group-hover:text-rose-300' };
        return { bar: 'before:bg-rose-500/40', icon: 'text-rose-400/80 group-hover:text-rose-300' };
    };

    const getStatusBadge = () => {
        if (isSuspended) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-rose-400'} />
                    Suspended
                </span>
            );
        }
        if (server.isNodeUnderMaintenance) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-purple-400'} />
                    Maintenance
                </span>
            );
        }
        if (server.isTransferring) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-40'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400'} /></span>
                    Transferring
                </span>
            );
        }
        if (server.status === 'installing') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400'} /></span>
                    Installing
                </span>
            );
        }
        if (server.status === 'restoring_backup') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400'} /></span>
                    Restoring
                </span>
            );
        }
        if (!stats) {
            return (
                <div className={'flex items-center gap-1.5 py-1'}>
                    <Spinner size={'small'} />
                </div>
            );
        }
        if (stats.status === 'running') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400'} /></span>
                    Running
                </span>
            );
        }
        if (stats.status === 'starting') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400'} /></span>
                    Starting
                </span>
            );
        }
        if (stats.status === 'stopping') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-40'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400'} /></span>
                    Stopping
                </span>
            );
        }
        return (
            <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20'}>
                <span className={'w-1.5 h-1.5 rounded-full bg-rose-400'} />
                Offline
            </span>
        );
    };

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';

    const cpuPercent = stats && server.limits.cpu > 0 ? Math.min(100, (stats.cpuUsagePercent / server.limits.cpu) * 100) : 0;
    const memPercent = stats && server.limits.memory > 0 ? Math.min(100, (stats.memoryUsageInBytes / (server.limits.memory * 1024 * 1024)) * 100) : 0;
    const diskPercent = stats && server.limits.disk > 0 ? Math.min(100, (stats.diskUsageInBytes / (server.limits.disk * 1024 * 1024)) * 100) : 0;

    const theme = getStatusTheme();

    return (
        <Link
            to={`/server/${server.id}`}
            className={`group relative block p-4 sm:p-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-2xl transition-all duration-200 no-underline text-neutral-200 shadow-sm hover:shadow-lg hover:shadow-black/30 overflow-hidden before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-full ${theme.bar} before:transition-all ${
                className || ''
            }`}
        >
            <div className={'flex flex-col lg:flex-row lg:items-center justify-between gap-4'}>
                {/* ── Left Side: Server Icon, Name, IP:Port, Description ──── */}
                <div className={'flex items-center gap-3.5 min-w-0 flex-1 pl-1'}>
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center shrink-0 group-hover:bg-neutral-750 transition-all duration-200 shadow-inner ${theme.icon}`}>
                        <ServerIcon size={22} />
                    </div>
                    <div className={'min-w-0 flex-1 flex flex-col justify-center gap-1'}>
                        <div className={'flex items-center justify-between gap-2'}>
                            <h3 className={'text-sm sm:text-base font-semibold text-neutral-100 group-hover:text-white tracking-tight transition-colors truncate'}>
                                {server.name}
                            </h3>
                            <div className={'lg:hidden shrink-0'}>
                                {getStatusBadge()}
                            </div>
                        </div>
                        <div className={'flex items-center gap-2 flex-wrap min-w-0'}>
                            {allocationString && (
                                <span className={'inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-800/80 border border-neutral-700/50 px-2 py-0.5 rounded-md shrink-0'}>
                                    <Globe size={11} className={'text-neutral-500'} />
                                    {allocationString}
                                </span>
                            )}
                            {server.description && (
                                <span className={'text-xs text-neutral-400 truncate max-w-xs'}>
                                    {server.description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right Side: Vertically Aligned Metrics + Status Badge ── */}
                <div className={'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0'}>
                    {stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                        <div className={'grid grid-cols-3 sm:flex items-stretch gap-2.5 w-full sm:w-auto'}>
                            {/* CPU Metric Capsule */}
                            <MetricCapsule
                                icon={Cpu}
                                label={'CPU'}
                                value={`${stats.cpuUsagePercent.toFixed(1)}%`}
                                limit={cpuLimit}
                                percent={cpuPercent}
                                alarm={alarms.cpu}
                                barColor={'bg-cyan-500'}
                            />

                            {/* RAM Metric Capsule */}
                            <MetricCapsule
                                icon={Layers}
                                label={'RAM'}
                                value={bytesToString(stats.memoryUsageInBytes)}
                                limit={memoryLimit}
                                percent={memPercent}
                                alarm={alarms.memory}
                                barColor={'bg-emerald-500'}
                            />

                            {/* DISK Metric Capsule */}
                            <MetricCapsule
                                icon={HardDrive}
                                label={'Disk'}
                                value={bytesToString(stats.diskUsageInBytes)}
                                limit={diskLimit}
                                percent={diskPercent}
                                alarm={alarms.disk}
                                barColor={'bg-violet-500'}
                            />
                        </div>
                    ) : (
                        <div className={'text-xs text-neutral-500 italic py-1'}>
                            {isSuspended ? 'Server ditangguhkan' : server.isNodeUnderMaintenance ? 'Node dalam pemeliharaan' : 'Menghubungkan ke node...'}
                        </div>
                    )}

                    {/* Status Badge & Arrow (Desktop) */}
                    <div className={'hidden lg:flex items-center gap-3 justify-end min-w-[120px]'}>
                        {getStatusBadge()}
                        <ChevronRight size={16} className={'text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all'} />
                    </div>
                </div>
            </div>
        </Link>
    );
};
