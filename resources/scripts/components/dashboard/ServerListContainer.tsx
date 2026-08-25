import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation, Link } from 'react-router-dom';
import InViewServerRow from '@/components/dashboard/InViewServerRow';
import { ServerCardsSkeleton } from '@/components/dashboard/DashboardSkeleton';
import CSContactButton from '@/components/dashboard/CSContactButton';
import {
    Server as ServerIcon,
    LayoutDashboard,
    Shield,
    ChevronRight,
} from 'lucide-react';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        window.history.replaceState(null, document.title, `/server${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'servers', error });
        if (!error) clearFlashes('servers');
    }, [error]);

    const isLoading = !servers && !error;
    const totalServers = servers?.pagination.total ?? 0;

    return (
        <PageContentBlock title={'Daftar Server'} showFlashKey={'servers'}>
            {/* ── Page Header Section (Responsive for Mobile & Desktop) ─ */}
            <div className={'mb-6 sm:mb-8 space-y-3'}>
                {/* Breadcrumbs */}
                <div className={'flex items-center gap-1.5 text-xs text-neutral-400'}>
                    <Link
                        to={'/'}
                        className={'inline-flex items-center gap-1 hover:text-white transition-colors no-underline text-neutral-400'}
                    >
                        <LayoutDashboard size={13} />
                        <span>Dashboard</span>
                    </Link>
                    <ChevronRight size={12} className={'text-neutral-600'} />
                    <span className={'text-neutral-200 font-semibold'}>Daftar Server</span>
                </div>

                {/* Title & Admin Switcher */}
                <div className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'}>
                    <div className={'min-w-0'}>
                        <div className={'flex items-center gap-2.5 flex-wrap'}>
                            <h1 className={'text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2'}>
                                <ServerIcon size={22} className={'text-primary-400 shrink-0'} />
                                <span>Daftar Server</span>
                            </h1>
                            {totalServers > 0 && (
                                <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60'}>
                                    {totalServers} Instans
                                </span>
                            )}
                        </div>
                        <p className={'text-xs sm:text-sm text-neutral-400 mt-1'}>
                            Akses dan kelola seluruh instans server game dan cloud Anda.
                        </p>
                    </div>

                    {/* Root Admin Filter Switcher */}
                    {rootAdmin && (
                        <div className={'w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-neutral-900 border border-neutral-800 p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-sm'}>
                            <div className={'flex items-center gap-2 min-w-0'}>
                                <Shield size={16} className={'text-amber-400 shrink-0'} />
                                <span className={'text-xs font-semibold text-neutral-300 truncate'}>
                                    {showOnlyAdmin ? 'Semua Server (Admin)' : 'Server Milik Saya'}
                                </span>
                            </div>
                            <Switch
                                name={'show_all_servers'}
                                defaultChecked={showOnlyAdmin}
                                onChange={() => setShowOnlyAdmin((s) => !s)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Server Cards Grid with AOS In-View Windowing ─────────── */}
            {isLoading ? (
                <ServerCardsSkeleton count={6} />
            ) : !servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            <div className={'grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'}>
                                {items.map((server) => (
                                    <InViewServerRow key={server.uuid} server={server} />
                                ))}
                            </div>
                        ) : (
                            <div className={'py-16 px-6 text-center rounded-3xl bg-neutral-900 border border-neutral-800 max-w-lg mx-auto'}>
                                <div className={'w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-500 mx-auto mb-3'}>
                                    <ServerIcon size={26} />
                                </div>
                                <h3 className={'text-base font-bold text-neutral-200'}>
                                    {showOnlyAdmin ? 'Tidak Ada Server Lain' : 'Belum Ada Server'}
                                </h3>
                                <p className={'text-xs text-neutral-400 mt-1 max-w-xs mx-auto'}>
                                    {showOnlyAdmin
                                        ? 'Tidak ada server lain yang dapat ditampilkan dalam filter ini.'
                                        : 'Belum ada instans server yang dikaitkan dengan akun Anda.'}
                                </p>
                            </div>
                        )
                    }
                </Pagination>
            )}

            {/* ── Floating CS Contact Button ──────────────────────────── */}
            <CSContactButton />
        </PageContentBlock>
    );
};
