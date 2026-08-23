import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import { Server as ServerIcon, Cpu, HardDrive, Globe, Layers, ChevronRight } from 'lucide-react';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

/* ─── Reusable resource stat cell ─────────────────────────────────────── */
const ResourceStat = ({
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
    <div className={'flex-1 px-3 py-2.5 min-w-[80px] sm:min-w-[100px]'}>
        <div className={'flex items-center justify-between gap-1 mb-1'}>
            <div className={'flex items-center gap-1.5'}>
                <Icon size={12} className={alarm ? 'text-rose-400' : 'text-neutral-500'} />
                <span className={'text-[10px] uppercase font-semibold tracking-wider text-neutral-500'}>{label}</span>
            </div>
            <span className={'text-[9px] text-neutral-500/80 font-normal hidden sm:inline'}>{limit}</span>
        </div>
        <p className={`text-[13px] font-bold tabular-nums leading-tight ${alarm ? 'text-rose-300' : 'text-neutral-200'}`}>
            {value}
        </p>
        {percent >= 0 && (
            <div className={'w-full h-[3px] bg-neutral-700/25 rounded-full overflow-hidden mt-1.5'}>
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${alarm ? 'bg-gradient-to-r from-rose-500 to-rose-400/50' : barColor}`}
                    style={{ width: `${Math.max(percent, 1)}%` }}
                />
            </div>
        )}
    </div>
);

/* ─── Status theme definitions ────────────────────────────────────────── */
interface StatusTheme {
    accent: string;
    dot: string;
    dotPing: string;
    glow: string;
    icon: string;
}

const THEME_SUSPENDED: StatusTheme = {
    accent: 'from-rose-500 via-rose-500/30 to-transparent',
    dot: 'bg-rose-400',
    dotPing: '',
    glow: 'bg-rose-500/[0.04]',
    icon: 'text-rose-400 group-hover:text-rose-300',
};
const THEME_MAINTENANCE: StatusTheme = {
    accent: 'from-purple-500 via-purple-500/30 to-transparent',
    dot: 'bg-purple-400',
    dotPing: '',
    glow: 'bg-purple-500/[0.04]',
    icon: 'text-purple-400 group-hover:text-purple-300',
};
const THEME_TRANSFERRING: StatusTheme = {
    accent: 'from-sky-500 via-sky-500/30 to-transparent',
    dot: 'bg-sky-400',
    dotPing: 'bg-sky-400',
    glow: 'bg-sky-500/[0.04]',
    icon: 'text-sky-400 group-hover:text-sky-300',
};
const THEME_INSTALLING: StatusTheme = {
    accent: 'from-amber-500 via-amber-500/30 to-transparent',
    dot: 'bg-amber-400',
    dotPing: 'bg-amber-400',
    glow: 'bg-amber-500/[0.04]',
    icon: 'text-amber-400 group-hover:text-amber-300',
};
const THEME_RUNNING: StatusTheme = {
    accent: 'from-emerald-500 via-emerald-500/30 to-transparent',
    dot: 'bg-emerald-400',
    dotPing: 'bg-emerald-400',
    glow: 'bg-emerald-500/[0.04]',
    icon: 'text-emerald-400 group-hover:text-emerald-300',
};
const THEME_STOPPING: StatusTheme = {
    accent: 'from-rose-500 via-rose-500/30 to-transparent',
    dot: 'bg-rose-400',
    dotPing: 'bg-rose-400',
    glow: 'bg-rose-500/[0.04]',
    icon: 'text-rose-400 group-hover:text-rose-300',
};
const THEME_OFFLINE: StatusTheme = {
    accent: 'from-rose-500/60 via-rose-500/20 to-transparent',
    dot: 'bg-rose-400/70',
    dotPing: '',
    glow: 'bg-rose-500/[0.02]',
    icon: 'text-rose-400/70 group-hover:text-rose-300',
};

/* ─── Main component ──────────────────────────────────────────────────── */
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

    /* ── Status theme resolver ────────────────────────────────────────── */
    const getStatusTheme = (): StatusTheme => {
        if (isSuspended) return THEME_SUSPENDED;
        if (server.isNodeUnderMaintenance) return THEME_MAINTENANCE;
        if (server.isTransferring) return THEME_TRANSFERRING;
        if (server.status === 'installing' || server.status === 'restoring_backup') return THEME_INSTALLING;
        if (stats?.status === 'running' || stats?.status === 'starting') return THEME_RUNNING;
        if (stats?.status === 'stopping') return THEME_STOPPING;
        return THEME_OFFLINE;
    };

    /* ── Status badge renderer ────────────────────────────────────────── */
    const getStatusBadge = () => {
        if (isSuspended) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-rose-500/10 text-rose-300 border border-rose-500/15 shadow-sm shadow-rose-500/5'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-rose-400'} />
                    Suspended
                </span>
            );
        }
        if (server.isNodeUnderMaintenance) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-purple-500/10 text-purple-300 border border-purple-500/15 shadow-sm shadow-purple-500/5'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-purple-400'} />
                    Maintenance
                </span>
            );
        }
        if (server.isTransferring) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-sky-500/10 text-sky-300 border border-sky-500/15 shadow-sm shadow-sky-500/5'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400'} /></span>
                    Transferring
                </span>
            );
        }
        if (server.status === 'installing') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-amber-500/10 text-amber-300 border border-amber-500/15 shadow-sm shadow-amber-500/5'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400'} /></span>
                    Installing
                </span>
            );
        }
        if (server.status === 'restoring_backup') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-amber-500/10 text-amber-300 border border-amber-500/15 shadow-sm shadow-amber-500/5'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400'} /></span>
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
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/15 shadow-sm shadow-emerald-500/5'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400'} /></span>
                    Running
                </span>
            );
        }
        if (stats.status === 'starting') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/15 shadow-sm shadow-emerald-500/5'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400'} /></span>
                    Starting
                </span>
            );
        }
        if (stats.status === 'stopping') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-rose-500/10 text-rose-300 border border-rose-500/15 shadow-sm shadow-rose-500/5'}>
                    <span className={'relative flex h-1.5 w-1.5'}><span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-30'} /><span className={'relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400'} /></span>
                    Stopping
                </span>
            );
        }

        return (
            <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm bg-rose-500/10 text-rose-300 border border-rose-500/15 shadow-sm shadow-rose-500/5'}>
                <span className={'w-1.5 h-1.5 rounded-full bg-rose-400 opacity-70'} />
                Offline
            </span>
        );
    };

    /* ── Resource limits ──────────────────────────────────────────────── */
    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';

    const cpuPercent = stats && server.limits.cpu > 0 ? Math.min(100, (stats.cpuUsagePercent / server.limits.cpu) * 100) : -1;
    const memPercent = stats && server.limits.memory > 0 ? Math.min(100, (stats.memoryUsageInBytes / (server.limits.memory * 1024 * 1024)) * 100) : -1;
    const diskPercent = stats && server.limits.disk > 0 ? Math.min(100, (stats.diskUsageInBytes / (server.limits.disk * 1024 * 1024)) * 100) : -1;

    const theme = getStatusTheme();

    /* ── Render ────────────────────────────────────────────────────────── */
    return (
        <Link
            to={`/server/${server.id}`}
            className={`group relative block rounded-2xl bg-gradient-to-br from-neutral-900/95 via-neutral-900/80 to-neutral-850/60 backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/60 transition-all duration-300 ease-out no-underline text-neutral-200 hover:-translate-y-[1px] hover:shadow-2xl hover:shadow-black/30 overflow-hidden ${
                className || ''
            }`}
        >
            {/* Gradient accent bar */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b ${theme.accent} transition-opacity duration-300`}
            />

            {/* Subtle background glow on hover */}
            <div
                className={`absolute -left-12 -top-12 w-36 h-36 rounded-full ${theme.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            />

            <div className={'relative flex flex-col lg:flex-row lg:items-center gap-4 p-4 sm:p-5 pl-5 sm:pl-6'}>
                {/* ── Left: Icon + Server Info ─────────────────────────── */}
                <div className={'flex items-center gap-4 min-w-0 flex-1'}>
                    {/* Server icon with status dot indicator */}
                    <div className={'relative shrink-0'}>
                        <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-800/70 border border-neutral-700/30 flex items-center justify-center group-hover:bg-neutral-800 group-hover:border-neutral-600/40 transition-all duration-300 ${theme.icon}`}
                        >
                            <ServerIcon size={20} />
                        </div>
                        {/* Status dot overlay */}
                        <span className={'absolute -bottom-0.5 -right-0.5 flex h-3 w-3'}>
                            {theme.dotPing && (
                                <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.dotPing} opacity-25`}
                                />
                            )}
                            <span
                                className={`relative inline-flex w-3 h-3 rounded-full border-[2px] border-neutral-900 ${theme.dot} shadow-sm`}
                            />
                        </span>
                    </div>

                    {/* Server name + meta info */}
                    <div className={'min-w-0 flex-1'}>
                        <div className={'flex items-center justify-between gap-2'}>
                            <h3
                                className={
                                    'text-[15px] font-semibold text-neutral-100 group-hover:text-white tracking-tight transition-colors duration-200 truncate'
                                }
                            >
                                {server.name}
                            </h3>
                            {/* Mobile status badge */}
                            <div className={'lg:hidden shrink-0'}>{getStatusBadge()}</div>
                        </div>
                        <div className={'flex items-center gap-2 mt-1 flex-wrap min-w-0'}>
                            {allocationString && (
                                <span
                                    className={
                                        'inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-800/50 border border-neutral-700/25 px-2 py-0.5 rounded-md shrink-0'
                                    }
                                >
                                    <Globe size={10} className={'text-neutral-500'} />
                                    {allocationString}
                                </span>
                            )}
                            {server.description && (
                                <span className={'text-xs text-neutral-500 truncate max-w-[220px]'}>
                                    {server.description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right: Resource Stats + Status ──────────────────── */}
                <div className={'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0'}>
                    {stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                        <div
                            className={
                                'flex items-stretch bg-neutral-800/20 border border-neutral-700/15 rounded-xl overflow-hidden divide-x divide-neutral-700/15 w-full sm:w-auto'
                            }
                        >
                            <ResourceStat
                                icon={Cpu}
                                label={'CPU'}
                                value={`${stats.cpuUsagePercent.toFixed(1)}%`}
                                limit={cpuLimit}
                                percent={cpuPercent}
                                alarm={alarms.cpu}
                                barColor={'bg-gradient-to-r from-cyan-500/70 to-cyan-400/25'}
                            />
                            <ResourceStat
                                icon={Layers}
                                label={'RAM'}
                                value={bytesToString(stats.memoryUsageInBytes)}
                                limit={memoryLimit}
                                percent={memPercent}
                                alarm={alarms.memory}
                                barColor={'bg-gradient-to-r from-emerald-500/70 to-emerald-400/25'}
                            />
                            <ResourceStat
                                icon={HardDrive}
                                label={'Disk'}
                                value={bytesToString(stats.diskUsageInBytes)}
                                limit={diskLimit}
                                percent={diskPercent}
                                alarm={alarms.disk}
                                barColor={'bg-gradient-to-r from-violet-500/70 to-violet-400/25'}
                            />
                        </div>
                    ) : (
                        <div
                            className={
                                'text-xs text-neutral-500 italic py-2 px-3 bg-neutral-800/20 border border-neutral-700/15 rounded-xl'
                            }
                        >
                            {isSuspended
                                ? 'Server ditangguhkan'
                                : server.isNodeUnderMaintenance
                                ? 'Node dalam pemeliharaan'
                                : 'Menghubungkan ke node...'}
                        </div>
                    )}

                    {/* Status Badge & Arrow (Desktop only) */}
                    <div className={'hidden lg:flex items-center gap-3 justify-end min-w-[120px]'}>
                        {getStatusBadge()}
                        <ChevronRight
                            size={16}
                            className={
                                'text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all duration-300'
                            }
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
};
