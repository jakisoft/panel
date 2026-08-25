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
import { StatCardsSkeleton, ShimmerBlock } from '@/components/dashboard/DashboardSkeleton';
import RealtimeLineChart, { ChartSeries } from '@/components/dashboard/charts/RealtimeLineChart';
import CSContactButton from '@/components/dashboard/CSContactButton';
import {
    Server as ServerIcon,
    HardDrive,
    Layers,
    Cpu,
    ArrowRight,
    Activity,
    CheckCircle2,
    BarChart3,
    PieChart,
} from 'lucide-react';

type Timer = ReturnType<typeof setInterval>;

interface OverviewLiveStats {
    [uuid: string]: ServerStats;
}

const MAX_HISTORY_POINTS = 20;

export default () => {
    const user = useStoreState((state: ApplicationStore) => state.user.data!);

    const { data: serversData, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers/overview'],
        () => getServers({ page: 1 })
    );

    const [liveStats, setLiveStats] = useState<OverviewLiveStats>({});
    const [storageTab, setStorageTab] = useState<'combined' | 'memory' | 'disk'>('combined');

    // Historical streaming series for realtime wave charts (20 points each)
    const [cpuHistory, setCpuHistory] = useState<number[]>(() => Array(MAX_HISTORY_POINTS).fill(0));
    const [memoryHistory, setMemoryHistory] = useState<number[]>(() => Array(MAX_HISTORY_POINTS).fill(0));
    const [diskHistory, setDiskHistory] = useState<number[]>(() => Array(MAX_HISTORY_POINTS).fill(0));

    const servers = serversData?.items || [];
    const totalServers = serversData?.pagination.total || servers.length;

    // Realtime Resource Polling across overview servers
    useEffect(() => {
        if (!servers || servers.length === 0) return;

        let activeInterval: Timer | null = null;

        const pollAllServers = () => {
            const promises = servers
                .filter((s) => s.status !== 'suspended' && !s.isNodeUnderMaintenance)
                .map((server) =>
                    getServerResourceUsage(server.uuid)
                        .then((stats) => ({ uuid: server.uuid, stats }))
                        .catch(() => null)
                );

            Promise.all(promises).then((results) => {
                const nextStats: OverviewLiveStats = {};
                let currentCpuSum = 0;
                let currentMemUsed = 0;
                let currentMemLimit = 0;
                let currentDiskUsed = 0;
                let currentDiskLimit = 0;

                results.forEach((res) => {
                    if (res && res.stats) {
                        nextStats[res.uuid] = res.stats;
                    }
                });

                setLiveStats((prev) => ({ ...prev, ...nextStats }));

                servers.forEach((s) => {
                    const stats = nextStats[s.uuid] || liveStats[s.uuid];
                    if (stats) {
                        currentCpuSum += stats.cpuUsagePercent;
                        currentMemUsed += stats.memoryUsageInBytes;
                        currentDiskUsed += stats.diskUsageInBytes;
                    }
                    if (s.limits.memory > 0) currentMemLimit += mbToBytes(s.limits.memory);
                    if (s.limits.disk > 0) currentDiskLimit += mbToBytes(s.limits.disk);
                });

                // Calculate current percentages for charts
                const ramPct = currentMemLimit > 0 ? (currentMemUsed / currentMemLimit) * 100 : Math.min(100, currentMemUsed / (1024 * 1024 * 1024 * 4) * 100);
                const diskPct = currentDiskLimit > 0 ? (currentDiskUsed / currentDiskLimit) * 100 : Math.min(100, currentDiskUsed / (1024 * 1024 * 1024 * 20) * 100);
                const avgCpu = servers.length > 0 ? currentCpuSum / servers.length : currentCpuSum;

                // Push new points and roll history to the left
                setCpuHistory((prev) => [...prev.slice(1), Math.max(0, avgCpu)]);
                setMemoryHistory((prev) => [...prev.slice(1), Math.max(0, ramPct)]);
                setDiskHistory((prev) => [...prev.slice(1), Math.max(0, diskPct)]);
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

    // Aggregate Current Realtime Metrics
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

    // Series construction for Chart 1 (Storage & Memory)
    const chart1Series: ChartSeries[] = [];
    if (storageTab === 'combined' || storageTab === 'memory') {
        chart1Series.push({
            id: 'ram',
            name: 'Memory (RAM)',
            color: '#38bdf8', // Cyan
            fillColor: '#38bdf8',
            data: memoryHistory,
            currentLabel: `${bytesToString(totalMemoryUsed)} (${memPercent.toFixed(1)}%)`,
            unit: '%',
        });
    }
    if (storageTab === 'combined' || storageTab === 'disk') {
        chart1Series.push({
            id: 'disk',
            name: 'Storage (Disk)',
            color: '#a855f7', // Violet
            fillColor: '#a855f7',
            data: diskHistory,
            currentLabel: `${bytesToString(totalDiskUsed)} (${diskPercent.toFixed(1)}%)`,
            unit: '%',
        });
    }

    // Series construction for Chart 2 (CPU Load)
    const chart2Series: ChartSeries[] = [
        {
            id: 'cpu',
            name: 'Beban CPU',
            color: '#f59e0b', // Amber/Gold
            fillColor: '#f59e0b',
            data: cpuHistory,
            currentLabel: `${totalCpuUsed.toFixed(1)}% (Rata-rata ${(servers.length > 0 ? totalCpuUsed / servers.length : 0).toFixed(1)}%)`,
            unit: '%',
        },
    ];

    return (
        <PageContentBlock title={'Dashboard Overview'}>
            {/* ── Top Hero Header ─────────────────────────────────────── */}
            <div className={'mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 rounded-3xl shadow-lg relative overflow-hidden'}>
                {/* Decorative background glow */}
                <div className={'absolute top-0 right-0 w-80 h-full bg-primary-500/5 blur-3xl pointer-events-none'} />

                <div className={'relative z-10 min-w-0'}>
                    <div className={'flex items-center gap-2 mb-1.5'}>
                        <span className={'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}>
                            <span className={'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'} />
                            Streaming Realtime Aktif
                        </span>
                    </div>
                    <h1 className={'text-xl sm:text-2xl font-black text-white tracking-tight'}>
                        Hai, {user.username}!
                    </h1>
                    <p className={'text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl'}>
                        Pantau analitik beban komputasi, pemakaian memori, dan storage secara realtime di diagram bawah.
                    </p>
                </div>

                <div className={'relative z-10 flex items-center gap-2.5 shrink-0'}>
                    <Link
                        to={'/server'}
                        className={'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-600/30 transition-all hover:scale-102 active:scale-98 no-underline'}
                    >
                        <ServerIcon size={16} />
                        <span>Buka Daftar Server</span>
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
                                {hasUnlimitedDisk ? '✦ Termasuk alokasi Unlimited' : `${diskPercent.toFixed(1)}% dari kuota storage`}
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

            {/* ── 2 Realtime Wave Line Charts ─────────────────────────── */}
            {isLoading ? (
                <div className={'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                    <div className={'p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4'}>
                        <ShimmerBlock className={'w-48 h-6'} />
                        <ShimmerBlock className={'w-full h-48 rounded-2xl'} />
                    </div>
                    <div className={'p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4'}>
                        <ShimmerBlock className={'w-48 h-6'} />
                        <ShimmerBlock className={'w-full h-48 rounded-2xl'} />
                    </div>
                </div>
            ) : (
                <div className={'grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6'}>
                    {/* Chart 1: Storage & Memory Wave Line Chart with 3 Tabs */}
                    <RealtimeLineChart
                        title={'Analisis Storage & Memori'}
                        subtitle={'Fluktuasi live pemakaian alokasi disk dan RAM'}
                        icon={<PieChart size={20} />}
                        series={chart1Series}
                        yMax={100}
                        yLeftFormatter={(val) => `${Math.round(val)}%`}
                        yRightFormatter={(val) => (val >= 90 ? 'Maks' : val >= 50 ? 'Med' : val >= 25 ? 'Low' : '0%')}
                        tabs={[
                            { id: 'combined', label: 'Gabungan', icon: <BarChart3 size={13} /> },
                            { id: 'memory', label: 'Memory (RAM)', icon: <Layers size={13} /> },
                            { id: 'disk', label: 'Storage (Disk)', icon: <HardDrive size={13} /> },
                        ]}
                        activeTab={storageTab}
                        onTabChange={(tabId) => setStorageTab(tabId as any)}
                        badge={
                            <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'}>
                                <span className={'w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse'} />
                                Live Wave
                            </span>
                        }
                    />

                    {/* Chart 2: Realtime CPU Load Wave Line Chart */}
                    <RealtimeLineChart
                        title={'Analisis Beban CPU'}
                        subtitle={'Aktivitas live komputasi seluruh instans server'}
                        icon={<Activity size={20} />}
                        series={chart2Series}
                        yMax={100}
                        yLeftFormatter={(val) => `${Math.round(val)}%`}
                        yRightFormatter={(val) => `${Math.round(val)}%`}
                        badge={
                            <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20'}>
                                <span className={'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'} />
                                Core Load
                            </span>
                        }
                    />
                </div>
            )}

            {/* ── Floating CS Contact Button ──────────────────────────── */}
            <CSContactButton />
        </PageContentBlock>
    );
};
