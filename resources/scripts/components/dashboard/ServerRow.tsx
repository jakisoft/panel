import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import Spinner from '@/components/elements/Spinner';
import { Server as ServerIcon, Cpu, HardDrive, Globe, Layers } from 'lucide-react';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

type Timer = ReturnType<typeof setInterval>;

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

    const getStatusBadge = () => {
        if (isSuspended) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20'}>
                    <span className={'w-2 h-2 rounded-full bg-rose-500'} />
                    Suspended
                </span>
            );
        }
        if (server.isNodeUnderMaintenance) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20'}>
                    <span className={'w-2 h-2 rounded-full bg-amber-500'} />
                    Maintenance
                </span>
            );
        }
        if (server.isTransferring) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20'}>
                    <span className={'w-2 h-2 rounded-full bg-blue-500 animate-pulse'} />
                    Transferring
                </span>
            );
        }
        if (server.status === 'installing') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20'}>
                    <span className={'w-2 h-2 rounded-full bg-amber-500 animate-pulse'} />
                    Installing
                </span>
            );
        }
        if (server.status === 'restoring_backup') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}>
                    <span className={'w-2 h-2 rounded-full bg-indigo-500 animate-pulse'} />
                    Restoring
                </span>
            );
        }
        if (!stats) {
            return (
                <div className={'flex items-center gap-1.5'}>
                    <Spinner size={'small'} />
                </div>
            );
        }
        if (stats.status === 'running') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'}>
                    <span className={'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />
                    Running
                </span>
            );
        }
        if (stats.status === 'starting') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30'}>
                    <span className={'w-2 h-2 rounded-full bg-amber-400 animate-pulse'} />
                    Starting
                </span>
            );
        }
        if (stats.status === 'stopping') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30'}>
                    <span className={'w-2 h-2 rounded-full bg-amber-400'} />
                    Stopping
                </span>
            );
        }
        return (
            <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20'}>
                <span className={'w-2 h-2 rounded-full bg-rose-500'} />
                Offline
            </span>
        );
    };

    return (
        <Link
            to={`/server/${server.id}`}
            className={`group block p-4 sm:p-5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-cyan-500/40 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-cyan-950/20 no-underline text-neutral-200 ${
                className || ''
            }`}
        >
            <div className={'flex flex-col md:flex-row md:items-center justify-between gap-4'}>
                {/* Left: Icon & Server details */}
                <div className={'flex items-start sm:items-center gap-3.5 min-w-0 flex-1'}>
                    <div className={'w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all'}>
                        <ServerIcon size={22} />
                    </div>
                    <div className={'min-w-0 flex-1'}>
                        <div className={'flex items-center gap-2 flex-wrap'}>
                            <h3 className={'text-base sm:text-lg font-bold text-neutral-100 group-hover:text-cyan-400 transition-colors truncate'}>
                                {server.name}
                            </h3>
                            <div className={'md:hidden'}>
                                {getStatusBadge()}
                            </div>
                        </div>
                        {server.description && (
                            <p className={'text-xs sm:text-sm text-neutral-400 truncate mt-0.5'}>
                                {server.description}
                            </p>
                        )}
                        {allocationString && (
                            <div className={'flex items-center gap-1.5 mt-1.5 text-xs text-neutral-400 font-mono'}>
                                <Globe size={13} className={'text-cyan-400 shrink-0'} />
                                <span className={'bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/60'}>
                                    {allocationString}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Stats & Status */}
                <div className={'flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0'}>
                    {stats && !isSuspended && !server.isNodeUnderMaintenance && (
                        <div className={'grid grid-cols-3 gap-2 sm:gap-3'}>
                            {/* CPU Stat */}
                            <div className={`p-2 sm:px-3 sm:py-2 rounded-xl border ${alarms.cpu ? 'bg-rose-500/10 border-rose-500/30' : 'bg-neutral-800/60 border-neutral-700/50'}`}>
                                <div className={'flex items-center gap-1.5 text-xs text-neutral-400'}>
                                    <Cpu size={14} className={alarms.cpu ? 'text-rose-400' : 'text-cyan-400'} />
                                    <span className={'hidden sm:inline'}>CPU</span>
                                </div>
                                <p className={`text-xs sm:text-sm font-bold mt-0.5 ${alarms.cpu ? 'text-rose-300' : 'text-neutral-100'}`}>
                                    {stats.cpuUsagePercent.toFixed(1)}%
                                </p>
                            </div>

                            {/* RAM Stat */}
                            <div className={`p-2 sm:px-3 sm:py-2 rounded-xl border ${alarms.memory ? 'bg-rose-500/10 border-rose-500/30' : 'bg-neutral-800/60 border-neutral-700/50'}`}>
                                <div className={'flex items-center gap-1.5 text-xs text-neutral-400'}>
                                    <Layers size={14} className={alarms.memory ? 'text-rose-400' : 'text-cyan-400'} />
                                    <span className={'hidden sm:inline'}>RAM</span>
                                </div>
                                <p className={`text-xs sm:text-sm font-bold mt-0.5 ${alarms.memory ? 'text-rose-300' : 'text-neutral-100'}`}>
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </p>
                            </div>

                            {/* Disk Stat */}
                            <div className={`p-2 sm:px-3 sm:py-2 rounded-xl border ${alarms.disk ? 'bg-rose-500/10 border-rose-500/30' : 'bg-neutral-800/60 border-neutral-700/50'}`}>
                                <div className={'flex items-center gap-1.5 text-xs text-neutral-400'}>
                                    <HardDrive size={14} className={alarms.disk ? 'text-rose-400' : 'text-cyan-400'} />
                                    <span className={'hidden sm:inline'}>DISK</span>
                                </div>
                                <p className={`text-xs sm:text-sm font-bold mt-0.5 ${alarms.disk ? 'text-rose-300' : 'text-neutral-100'}`}>
                                    {bytesToString(stats.diskUsageInBytes)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={'hidden md:block'}>
                        {getStatusBadge()}
                    </div>
                </div>
            </div>
        </Link>
    );
};
