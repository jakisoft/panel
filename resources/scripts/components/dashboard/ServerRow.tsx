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
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-950/40 text-rose-400 border border-rose-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-rose-400'} />
                    Suspended
                </span>
            );
        }
        if (server.isNodeUnderMaintenance) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-amber-400'} />
                    Maintenance
                </span>
            );
        }
        if (server.isTransferring) {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-950/40 text-blue-400 border border-blue-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse'} />
                    Transferring
                </span>
            );
        }
        if (server.status === 'installing') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'} />
                    Installing
                </span>
            );
        }
        if (server.status === 'restoring_backup') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950/40 text-indigo-400 border border-indigo-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse'} />
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
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'} />
                    Running
                </span>
            );
        }
        if (stats.status === 'starting') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'} />
                    Starting
                </span>
            );
        }
        if (stats.status === 'stopping') {
            return (
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/40'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-amber-400'} />
                    Stopping
                </span>
            );
        }
        return (
            <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700/60'}>
                <span className={'w-1.5 h-1.5 rounded-full bg-neutral-500'} />
                Offline
            </span>
        );
    };

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';

    return (
        <Link
            to={`/server/${server.id}`}
            className={`group block p-4 sm:p-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl transition-all duration-200 no-underline text-neutral-200 shadow-md hover:shadow-xl shadow-black/30 ${
                className || ''
            }`}
        >
            <div className={'flex flex-col lg:flex-row lg:items-center justify-between gap-4'}>
                {/* Left Side: Server Icon, Name, Address & Description */}
                <div className={'flex items-center gap-3.5 min-w-0 flex-1'}>
                    <div className={'w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700/60 text-neutral-300 flex items-center justify-center shrink-0 group-hover:text-white group-hover:bg-neutral-750 transition-colors shadow-inner'}>
                        <ServerIcon size={20} />
                    </div>
                    <div className={'min-w-0 flex-1'}>
                        <div className={'flex items-center gap-2 flex-wrap'}>
                            <h3 className={'text-sm sm:text-base font-bold text-neutral-100 group-hover:text-white transition-colors truncate'}>
                                {server.name}
                            </h3>
                            {allocationString && (
                                <span className={'inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-800/80 border border-neutral-700/50 px-2 py-0.5 rounded-md'}>
                                    <Globe size={11} className={'text-neutral-500'} />
                                    {allocationString}
                                </span>
                            )}
                            <div className={'lg:hidden ml-auto'}>
                                {getStatusBadge()}
                            </div>
                        </div>
                        {server.description && (
                            <p className={'text-xs text-neutral-400 truncate mt-1'}>
                                {server.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Side: Resource Stats Capsules & Status Badge */}
                <div className={'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0'}>
                    {stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                        <div className={'grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto'}>
                            {/* CPU */}
                            <div className={'bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-1.5 min-w-[90px] text-center sm:text-left'}>
                                <div className={'flex items-center justify-center sm:justify-start gap-1 text-[10px] uppercase font-bold text-neutral-400'}>
                                    <Cpu size={12} className={alarms.cpu ? 'text-rose-400' : 'text-neutral-400'} />
                                    <span>CPU</span>
                                </div>
                                <p className={`text-xs font-bold mt-0.5 truncate ${alarms.cpu ? 'text-rose-400' : 'text-neutral-100'}`}>
                                    {stats.cpuUsagePercent.toFixed(1)}%
                                </p>
                                <p className={'text-[9px] text-neutral-500 truncate leading-none mt-0.5'}>/ {cpuLimit}</p>
                            </div>

                            {/* RAM */}
                            <div className={'bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-1.5 min-w-[100px] text-center sm:text-left'}>
                                <div className={'flex items-center justify-center sm:justify-start gap-1 text-[10px] uppercase font-bold text-neutral-400'}>
                                    <Layers size={12} className={alarms.memory ? 'text-rose-400' : 'text-neutral-400'} />
                                    <span>RAM</span>
                                </div>
                                <p className={`text-xs font-bold mt-0.5 truncate ${alarms.memory ? 'text-rose-400' : 'text-neutral-100'}`}>
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </p>
                                <p className={'text-[9px] text-neutral-500 truncate leading-none mt-0.5'}>/ {memoryLimit}</p>
                            </div>

                            {/* DISK */}
                            <div className={'bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-1.5 min-w-[100px] text-center sm:text-left'}>
                                <div className={'flex items-center justify-center sm:justify-start gap-1 text-[10px] uppercase font-bold text-neutral-400'}>
                                    <HardDrive size={12} className={alarms.disk ? 'text-rose-400' : 'text-neutral-400'} />
                                    <span>DISK</span>
                                </div>
                                <p className={`text-xs font-bold mt-0.5 truncate ${alarms.disk ? 'text-rose-400' : 'text-neutral-100'}`}>
                                    {bytesToString(stats.diskUsageInBytes)}
                                </p>
                                <p className={'text-[9px] text-neutral-500 truncate leading-none mt-0.5'}>/ {diskLimit}</p>
                            </div>
                        </div>
                    ) : (
                        <div className={'text-xs text-neutral-500 italic py-1'}>
                            {isSuspended ? 'Server ditangguhkan' : server.isNodeUnderMaintenance ? 'Node dalam pemeliharaan' : 'Menghubungkan ke node...'}
                        </div>
                    )}

                    {/* Status Badge (Desktop) */}
                    <div className={'hidden lg:flex items-center justify-end min-w-[100px]'}>
                        {getStatusBadge()}
                    </div>
                </div>
            </div>
        </Link>
    );
};
