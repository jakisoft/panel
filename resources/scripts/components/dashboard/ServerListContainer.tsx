import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation, Link } from 'react-router-dom';
import InViewServerRow from '@/components/dashboard/InViewServerRow';
import { ServerCardsSkeleton } from '@/components/dashboard/DashboardSkeleton';
import CSContactButton from '@/components/dashboard/CSContactButton';
import { Server as ServerIcon, LayoutDashboard, Search } from 'lucide-react';

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

    return (
        <PageContentBlock title={'Daftar Server'} showFlashKey={'servers'}>
            {/* ── Page Header & Admin Switch ──────────────────────────── */}
            <div className={'mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'}>
                <div>
                    <div className={'flex items-center gap-2 mb-1'}>
                        <Link
                            to={'/'}
                            className={'inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white no-underline transition-colors'}
                        >
                            <LayoutDashboard size={13} />
                            <span>Dashboard</span>
                        </Link>
                        <span className={'text-neutral-600 text-xs'}>/</span>
                        <span className={'text-xs text-primary-400 font-semibold'}>Daftar Server</span>
                    </div>
                    <h1 className={'text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5'}>
                        <ServerIcon size={22} className={'text-primary-400'} />
                        <span>Daftar Server</span>
                    </h1>
                </div>

                {rootAdmin && (
                    <div className={'flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl self-start sm:self-auto'}>
                        <p className={'uppercase text-xs font-semibold text-neutral-400'}>
                            {showOnlyAdmin ? 'Semua Server (Admin)' : 'Server Saya Saja'}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                )}
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
                            <div className={'py-16 text-center rounded-3xl bg-neutral-900 border border-neutral-800 p-8'}>
                                <ServerIcon size={40} className={'mx-auto text-neutral-600 mb-3'} />
                                <h3 className={'text-base font-bold text-neutral-200'}>
                                    {showOnlyAdmin ? 'Tidak Ada Server Lain' : 'Belum Ada Server'}
                                </h3>
                                <p className={'text-xs text-neutral-400 mt-1 max-w-sm mx-auto'}>
                                    {showOnlyAdmin
                                        ? 'Tidak ada server lain yang dapat ditampilkan.'
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
