import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import InViewServerRow from '@/components/dashboard/InViewServerRow';
import { StatCardsSkeleton, ServerCardsSkeleton } from '@/components/dashboard/DashboardSkeleton';
import CSContactButton from '@/components/dashboard/CSContactButton';
import {
    Server as ServerIcon,
    HardDrive,
    Layers,
    Cpu,
    ArrowRight,
    Activity,
    CheckCircle2,
    SlidersHorizontal,
} from 'lucide-react';

type Timer = ReturnType<typeof setInterval>;

interface OverviewLiveStats {
    [uuid: string]: ServerStats;
}

export default () => {
    const user = useStoreState((state: ApplicationStore) => state.user.data!);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data?.rootAdmin);

    const { data: serversData, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers/overview'],
        () => getServers({ page: 1 })
    );

    const [liveStats, setLiveStats] = useState<OverviewLiveStats>({});
    const servers = serversData?.items || [];
    const totalServers = serversData?.pagination.total || servers.length;

    // Realtime Resource Polling across overview servers
    useEffect(() => {
        if (!servers || servers.length === 0) return;

        let activeInterval: Timer | null = null;

        const pollAllServers = () => {
            servers.forEach((server) => {
                if (server.status !== 'suspended' && !server.isNodeUnderMaintenance) {
                    getServerResourceUsage(server.uuid)
                        .then((stats) => {
                            setLiveStats((prev) => ({ ...prev, [server.uuid]: stats }));
                        })
                        .catch(() => null);
                }
            });
        };

        const startPolling = () => {
            pollAllServers();
            if (!activeInterval) {
                activeInterval = setInterval(pollAllServers, 2500);
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
    }, [serversData]);

    // Aggregate Metrics
    let runningServersCount = 0;
    let totalDiskUsed = 0;
    let totalDiskLimit = 0;
    let hasUnlimitedDisk = false;

    let totalMemoryUsed = 0;
    let totalMemoryLimit = 0;
    let hasUnlimitedMemory = false;

    let totalCpuUsed = 0;
    let totalCpuLimit = 0;
    let hasUnlimitedCpu = false;

    servers.forEach((s) => {
        const stats = liveStats[s.uuid];
        const isRunning = stats?.status === 'running' || stats?.status === 'starting';
        if (isRunning) runningServersCount++;

        // Disk
        if (stats) totalDiskUsed += stats.diskUsageInBytes;
        if (s.limits.disk === 0) {
            hasUnlimitedDisk = true;
        } else {
            totalDiskLimit += mbToBytes(s.limits.disk);
        }

        // Memory
        if (stats) totalMemoryUsed += stats.memoryUsageInBytes;
        if (s.limits.memory === 0) {
            hasUnlimitedMemory = true;
        } else {
            totalMemoryLimit += mbToBytes(s.limits.memory);
        }

        // CPU
        if (stats) totalCpuUsed += stats.cpuUsagePercent;
        if (s.limits.cpu === 0) {
            hasUnlimitedCpu = true;
        } else {
            totalCpuLimit += s.limits.cpu;
        }
    });

    const diskPercent = totalDiskLimit > 0 ? Math.min(100, (totalDiskUsed / totalDiskLimit) * 100) : 0;
    const memPercent = totalMemoryLimit > 0 ? Math.min(100, (totalMemoryUsed / totalMemoryLimit) * 100) : 0;
    const cpuPercent = totalCpuLimit > 0 ? Math.min(100, (totalCpuUsed / totalCpuLimit) * 100) : 0;
    const onlinePercent = totalServers > 0 ? (runningServersCount / totalServers) * 100 : 0;

    const isLoading = !serversData && !error;

    return (
        <PageContentBlock title={'Dashboard Overview'}>
            {/* ── Top Hero Header ─────────────────────────────────────── */}
            <div className={'mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 rounded-3xl shadow-lg relative overflow-hidden'}>
                {/* Background decorative glow */}
                <div className={'absolute top-0 right-0 w-80 h-full bg-primary-500/5 blur-3xl pointer-events-none'} />

                <div className={'relative z-10 min-w-0'}>
                    <div className={'flex items-center gap-2 mb-1.5'}>
                        <span className={'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}>
                            <span className={'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'} />
                            Sistem Realtime Aktif
                        </span>
                    </div>
                    <h1 className={'text-xl sm:text-2xl font-black text-white tracking-tight'}>
                        Hai, {user.username}!
                    </h1>
                    <p className={'text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl'}>
                        Pantau performa komputasi, pemakaian storage, dan status instans server Anda secara terpusat.
                    </p>
                </div>

                <div className={'relative z-10 flex items-center gap-2.5 shrink-0'}>
                    <Link
                        to={'/server'}
                        className={'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-600/30 transition-all hover:scale-102 active:scale-98 no-underline'}
                    >
                        <ServerIcon size={16} />
                        <span>Kelola Semua Server</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* ── 4 Overview Live Stat Cards ──────────────────────────── */}
            {isLoading ? (
                <StatCardsSkeleton />
            ) : (
                <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8'}>
                    {/* Card 1: Server Status */}
                    <div className={'p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm group'}>
                        <div className={'flex items-center justify-between'}>
                            <span className={'text-xs font-bold uppercase tracking-wider text-neutral-400'}>
                                Status Server
                            </span>
                            <div className={'w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform'}>
                                <ServerIcon size={20} />
                            </div>
                        </div>

                        <div className={'my-3'}>
                            <div className={'flex items-baseline gap-2'}>
                                <span className={'text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight'}>
                                    {runningServersCount}
                                </span>
                                <span className={'text-sm font-semibold text-neutral-400'}>
                                    / {totalServers} Aktif
                                </span>
                            </div>
                            <p className={'text-[11px] text-neutral-400 mt-1 flex items-center gap-1 truncate'}>
                                <CheckCircle2 size={12} className={'text-emerald-400 shrink-0'} />
                                {runningServersCount === totalServers && totalServers > 0
                                    ? 'Semua server beroperasi online'
                                    : `${totalServers - runningServersCount} server offline/standby`}
                            </p>
                        </div>

                        <div className={'w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden'}>
                            <div
                                className={'h-full bg-emerald-500 rounded-full transition-all duration-300'}
                                style={{ width: `${Math.max(onlinePercent, totalServers > 0 ? 8 : 0)}%` }}
                            />
                        </div>
                    </div>

                    {/* Card 2: Disk Storage */}
                    <div className={'p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm group'}>
                        <div className={'flex items-center justify-between'}>
                            <span className={'text-xs font-bold uppercase tracking-wider text-neutral-400'}>
                                Total Storage (Disk)
                            </span>
                            <div className={'w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform'}>
                                <HardDrive size={20} />
                            </div>
                        </div>

                        <div className={'my-3'}>
                            <div className={'flex items-baseline gap-1.5'}>
                                <span className={'text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight'}>
                                    {bytesToString(totalDiskUsed)}
                                </span>
                                <span className={'text-xs font-semibold text-neutral-400 truncate'}>
                                    {hasUnlimitedDisk ? 'Terpakai' : `/ ${bytesToString(totalDiskLimit)}`}
                                </span>
                            </div>
                            <p className={'text-[11px] text-neutral-400 mt-1 truncate'}>
                                {hasUnlimitedDisk ? '✦ Termasuk alokasi Unlimited' : `${diskPercent.toFixed(1)}% dari total kuota storage`}
                            </p>
                        </div>

                        <div className={'w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden'}>
                            <div
                                className={'h-full bg-violet-500 rounded-full transition-all duration-300'}
                                style={{ width: `${hasUnlimitedDisk ? 40 : Math.max(diskPercent, 6)}%` }}
                            />
                        </div>
                    </div>

                    {/* Card 3: Memory (RAM) */}
                    <div className={'p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm group'}>
                        <div className={'flex items-center justify-between'}>
                            <span className={'text-xs font-bold uppercase tracking-wider text-neutral-400'}>
                                Pemakaian RAM
                            </span>
                            <div className={'w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform'}>
                                <Layers size={20} />
                            </div>
                        </div>

                        <div className={'my-3'}>
                            <div className={'flex items-baseline gap-1.5'}>
                                <span className={'text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight'}>
                                    {bytesToString(totalMemoryUsed)}
                                </span>
                                <span className={'text-xs font-semibold text-neutral-400 truncate'}>
                                    {hasUnlimitedMemory ? 'Terpakai' : `/ ${bytesToString(totalMemoryLimit)}`}
                                </span>
                            </div>
                            <p className={'text-[11px] text-neutral-400 mt-1 truncate'}>
                                {hasUnlimitedMemory ? '✦ Bebas batas kuota RAM' : `${memPercent.toFixed(1)}% kapasitas terpakai`}
                            </p>
                        </div>

                        <div className={'w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden'}>
                            <div
                                className={'h-full bg-cyan-500 rounded-full transition-all duration-300'}
                                style={{ width: `${hasUnlimitedMemory ? 35 : Math.max(memPercent, 6)}%` }}
                            />
                        </div>
                    </div>

                    {/* Card 4: CPU Load */}
                    <div className={'p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm group'}>
                        <div className={'flex items-center justify-between'}>
                            <span className={'text-xs font-bold uppercase tracking-wider text-neutral-400'}>
                                Beban CPU
                            </span>
                            <div className={'w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform'}>
                                <Cpu size={20} />
                            </div>
                        </div>

                        <div className={'my-3'}>
                            <div className={'flex items-baseline gap-1.5'}>
                                <span className={'text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight'}>
                                    {totalCpuUsed.toFixed(1)}%
                                </span>
                                <span className={'text-xs font-semibold text-neutral-400 truncate'}>
                                    {hasUnlimitedCpu ? 'Total' : `/ ${totalCpuLimit}%`}
                                </span>
                            </div>
                            <p className={'text-[11px] text-neutral-400 mt-1 flex items-center gap-1 truncate'}>
                                <Activity size={12} className={'text-amber-400 shrink-0'} />
                                Rata-rata: {(servers.length > 0 ? totalCpuUsed / servers.length : 0).toFixed(1)}% / server
                            </p>
                        </div>

                        <div className={'w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden'}>
                            <div
                                className={'h-full bg-amber-500 rounded-full transition-all duration-300'}
                                style={{ width: `${hasUnlimitedCpu ? Math.min(100, totalCpuUsed / 2) : Math.max(cpuPercent, 6)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Server Overview Section ─────────────────────────────── */}
            <div className={'mb-4 flex items-center justify-between'}>
                <div>
                    <h2 className={'text-base sm:text-lg font-bold text-white tracking-tight'}>
                        Ringkasan Instans Server
                    </h2>
                    <p className={'text-xs text-neutral-400 mt-0.5'}>
                        Status realtime dan metrik komputasi instans server Anda.
                    </p>
                </div>

                <Link
                    to={'/server'}
                    className={'inline-flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 no-underline transition-colors'}
                >
                    <span>Lihat Semua Server</span>
                    <ArrowRight size={13} />
                </Link>
            </div>

            {isLoading ? (
                <ServerCardsSkeleton count={4} />
            ) : servers.length > 0 ? (
                <div className={'grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'}>
                    {servers.map((server) => (
                        <InViewServerRow key={server.uuid} server={server} />
                    ))}
                </div>
            ) : (
                <div className={'p-8 sm:p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800'}>
                    <ServerIcon size={36} className={'mx-auto text-neutral-600 mb-3'} />
                    <h3 className={'text-base font-bold text-neutral-200'}>Tidak Ada Server</h3>
                    <p className={'text-xs text-neutral-400 mt-1 max-w-sm mx-auto'}>
                        Saat ini belum ada server yang terhubung dengan akun Anda.
                    </p>
                </div>
            )}

            {/* ── Floating CS Contact Button (Main Page) ──────────────── */}
            <CSContactButton />
        </PageContentBlock>
    );
};
