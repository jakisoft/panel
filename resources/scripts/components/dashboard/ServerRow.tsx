import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import { Server as ServerIcon, Cpu, HardDrive, Globe, Layers, ChevronRight } from 'lucide-react';

const isAlarmState = (current: number, limit: number): boolean =>
    limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

/* ── Compact stat cell ───────────────────────────────────────────────── */
const StatCell = ({
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
    <div className={'min-w-[70px]'}>
        <div className={'flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-wide'}>
            <div className={'flex items-center gap-1'}>
                <Icon size={11} className={alarm ? 'text-red-400' : ''} />
                <span>{label}</span>
            </div>
            <span className={'text-[9px] text-neutral-600'}>{limit}</span>
        </div>
        <p className={`text-xs font-medium mt-0.5 tabular-nums ${alarm ? 'text-red-400' : 'text-neutral-200'}`}>
            {value}
        </p>
        {percent >= 0 && (
            <div className={'h-[2px] bg-neutral-800 rounded-full mt-1 overflow-hidden'}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${alarm ? 'bg-red-400' : barColor}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        )}
    </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
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

    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
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

    /* ── Accent bar color ─────────────────────────────────────────────── */
    const getAccentColor = () => {
        if (isSuspended) return 'bg-red-500';
        if (server.isNodeUnderMaintenance) return 'bg-purple-500';
        if (server.isTransferring) return 'bg-sky-500';
        if (server.status === 'installing' || server.status === 'restoring_backup') return 'bg-amber-500';
        if (stats?.status === 'running' || stats?.status === 'starting') return 'bg-emerald-500';
        if (stats?.status === 'stopping') return 'bg-red-500';
        return 'bg-neutral-600';
    };

    /* ── Icon color ───────────────────────────────────────────────────── */
    const getIconColor = () => {
        if (isSuspended) return 'text-red-400';
        if (server.isNodeUnderMaintenance) return 'text-purple-400';
        if (server.isTransferring) return 'text-sky-400';
        if (server.status === 'installing' || server.status === 'restoring_backup') return 'text-amber-400';
        if (stats?.status === 'running' || stats?.status === 'starting') return 'text-emerald-400';
        if (stats?.status === 'stopping') return 'text-red-400';
        return 'text-neutral-500';
    };

    /* ── Status badge ─────────────────────────────────────────────────── */
    const getStatusBadge = () => {
        if (isSuspended) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current'} />
                    Suspended
                </span>
            );
        }
        if (server.isNodeUnderMaintenance) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current'} />
                    Maintenance
                </span>
            );
        }
        if (server.isTransferring) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current animate-pulse'} />
                    Transferring
                </span>
            );
        }
        if (server.status === 'installing') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current animate-pulse'} />
                    Installing
                </span>
            );
        }
        if (server.status === 'restoring_backup') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current animate-pulse'} />
                    Restoring
                </span>
            );
        }
        if (!stats) {
            return (
                <div className={'flex items-center py-0.5'}>
                    <Spinner size={'small'} />
                </div>
            );
        }
        if (stats.status === 'running') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current animate-pulse'} />
                    Running
                </span>
            );
        }
        if (stats.status === 'starting') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current animate-pulse'} />
                    Starting
                </span>
            );
        }
        if (stats.status === 'stopping') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-current animate-pulse'} />
                    Stopping
                </span>
            );
        }
        return (
            <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-500/10 text-neutral-400'}>
                <span className={'w-1.5 h-1.5 rounded-full bg-current'} />
                Offline
            </span>
        );
    };

    /* ── Resource limits ──────────────────────────────────────────────── */
    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : '∞';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : '∞';
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : '∞';

    const cpuPercent =
        stats && server.limits.cpu > 0 ? Math.min(100, (stats.cpuUsagePercent / server.limits.cpu) * 100) : -1;
    const memPercent =
        stats && server.limits.memory > 0
            ? Math.min(100, (stats.memoryUsageInBytes / (server.limits.memory * 1024 * 1024)) * 100)
            : -1;
    const diskPercent =
        stats && server.limits.disk > 0
            ? Math.min(100, (stats.diskUsageInBytes / (server.limits.disk * 1024 * 1024)) * 100)
            : -1;

    /* ── Render ────────────────────────────────────────────────────────── */
    return (
        <Link
            to={`/server/${server.id}`}
            className={`group relative block p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors duration-150 no-underline text-neutral-200 ${
                className || ''
            }`}
        >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-full ${getAccentColor()}`} />

            <div className={'flex items-start gap-3 pl-2.5'}>
                {/* Server icon */}
                <div
                    className={`w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 ${getIconColor()}`}
                >
                    <ServerIcon size={18} />
                </div>

                {/* Content: stacks vertically on mobile, horizontal on lg */}
                <div className={'flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4'}>
                    {/* Name + allocation */}
                    <div className={'min-w-0 flex-1'}>
                        <div className={'flex items-center gap-2'}>
                            <span className={'text-sm font-medium text-neutral-100 truncate'}>{server.name}</span>
                            <div className={'lg:hidden shrink-0'}>{getStatusBadge()}</div>
                        </div>
                        <div className={'flex items-center gap-1.5 mt-0.5'}>
                            {allocationString && (
                                <>
                                    <Globe size={10} className={'text-neutral-600 shrink-0'} />
                                    <span className={'text-[11px] font-mono text-neutral-500'}>{allocationString}</span>
                                </>
                            )}
                            {server.description && allocationString && (
                                <span className={'text-neutral-700'}>·</span>
                            )}
                            {server.description && (
                                <span className={'text-[11px] text-neutral-500 truncate max-w-[200px]'}>
                                    {server.description}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Resource stats */}
                    <div className={'flex items-center gap-3 shrink-0'}>
                        {stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                            <>
                                {/* Mobile: compact text-only */}
                                <div className={'flex sm:hidden items-center gap-2.5 text-[11px]'}>
                                    <span
                                        className={`tabular-nums ${alarms.cpu ? 'text-red-400' : 'text-neutral-400'}`}
                                    >
                                        CPU {stats.cpuUsagePercent.toFixed(1)}%
                                    </span>
                                    <span className={'text-neutral-700'}>·</span>
                                    <span
                                        className={`tabular-nums ${alarms.memory ? 'text-red-400' : 'text-neutral-400'}`}
                                    >
                                        {bytesToString(stats.memoryUsageInBytes)}
                                    </span>
                                    <span className={'text-neutral-700'}>·</span>
                                    <span
                                        className={`tabular-nums ${alarms.disk ? 'text-red-400' : 'text-neutral-400'}`}
                                    >
                                        {bytesToString(stats.diskUsageInBytes)}
                                    </span>
                                </div>
                                {/* Desktop: detailed with progress bars */}
                                <div className={'hidden sm:flex items-center gap-5'}>
                                    <StatCell
                                        icon={Cpu}
                                        label={'CPU'}
                                        value={`${stats.cpuUsagePercent.toFixed(1)}%`}
                                        limit={cpuLimit}
                                        percent={cpuPercent}
                                        alarm={alarms.cpu}
                                        barColor={'bg-cyan-500'}
                                    />
                                    <StatCell
                                        icon={Layers}
                                        label={'RAM'}
                                        value={bytesToString(stats.memoryUsageInBytes)}
                                        limit={memoryLimit}
                                        percent={memPercent}
                                        alarm={alarms.memory}
                                        barColor={'bg-emerald-500'}
                                    />
                                    <StatCell
                                        icon={HardDrive}
                                        label={'Disk'}
                                        value={bytesToString(stats.diskUsageInBytes)}
                                        limit={diskLimit}
                                        percent={diskPercent}
                                        alarm={alarms.disk}
                                        barColor={'bg-violet-500'}
                                    />
                                </div>
                            </>
                        ) : (
                            <span className={'text-[11px] text-neutral-600 italic'}>
                                {isSuspended
                                    ? 'Server ditangguhkan'
                                    : server.isNodeUnderMaintenance
                                    ? 'Node dalam pemeliharaan'
                                    : 'Menghubungkan ke node...'}
                            </span>
                        )}

                        {/* Status badge + arrow (desktop) */}
                        <div className={'hidden lg:flex items-center gap-2 shrink-0 ml-1'}>
                            {getStatusBadge()}
                            <ChevronRight
                                size={14}
                                className={'text-neutral-700 group-hover:text-neutral-500 transition-colors'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
