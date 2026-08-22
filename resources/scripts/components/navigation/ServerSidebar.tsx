import React, { useState, useEffect } from 'react';
import { NavLink, Link, useRouteMatch, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    X,
    Search,
    ExternalLink,
} from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { useSidebar } from '@/components/SidebarContext';
import routes from '@/routers/routes';
import Can from '@/components/elements/Can';
import LogoutConfirmDialog from '@/components/navigation/LogoutConfirmDialog';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();
    const { isOpen, close } = useSidebar();
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data?.rootAdmin);
    const serverName = ServerContext.useStoreState((state) => state.server.data?.name);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const serverNode = ServerContext.useStoreState((state) => state.server.data?.node);

    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            close();
        }
    }, [location.pathname]);

    const to = (value: string) => {
        if (value === '/') {
            return match.url;
        }
        return `${match.url.replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    const handleSearchClick = () => {
        const searchBtn = document.querySelector('button[aria-label="Search"]') as HTMLButtonElement | null;
        if (searchBtn) {
            searchBtn.click();
        }
    };

    return (
        <>
            <LogoutConfirmDialog open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />

            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className={'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300'}
                    onClick={close}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Fixed Top Header (Non-scrolling) */}
                <div className={'h-14 flex items-center justify-between px-4 border-b border-neutral-800 shrink-0'}>
                    <div className={'min-w-0 flex-1 pr-2'}>
                        <h2 className={'text-sm font-bold text-neutral-100 truncate'}>
                            {serverName || 'Memuat Server...'}
                        </h2>
                        {serverNode && (
                            <p className={'text-[11px] text-neutral-400 truncate'}>
                                Node: <span className={'text-cyan-400'}>{serverNode}</span>
                            </p>
                        )}
                    </div>
                    <button
                        type={'button'}
                        onClick={close}
                        className={'p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden shrink-0'}
                        title={'Tutup Sidebar'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Fixed Search & Dashboard Link (Non-scrolling) */}
                <div className={'p-3 border-b border-neutral-800/80 shrink-0 space-y-2'}>
                    <div
                        onClick={handleSearchClick}
                        className={'flex items-center gap-2 px-3 py-2 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 rounded-xl text-neutral-400 text-xs cursor-pointer transition-colors'}
                    >
                        <Search size={14} className={'text-neutral-400'} />
                        <span>Cari server...</span>
                        <kbd className={'ml-auto text-[10px] bg-neutral-700/60 text-neutral-400 px-1.5 py-0.5 rounded'}>Ctrl+K</kbd>
                    </div>

                    <Link
                        to={'/'}
                        className={'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'}
                    >
                        <LayoutDashboard size={16} className={'text-cyan-400'} />
                        <span>Kembali ke Dashboard</span>
                    </Link>
                </div>

                {/* Scrollable Server Navigation Menu */}
                <nav className={'flex-1 overflow-y-auto px-3 py-3 space-y-1'}>
                    <div className={'px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500'}>
                        Menu Server
                    </div>

                    {routes.server
                        .filter((route) => !!route.name)
                        .map((route) => {
                            const Icon = route.icon;
                            return route.permission ? (
                                <Can key={route.path} action={route.permission} matchAny>
                                    <NavLink
                                        to={to(route.path)}
                                        exact={route.exact}
                                        className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'}
                                        activeClassName={'!bg-cyan-600/20 !text-cyan-400 !font-semibold border border-cyan-500/30'}
                                    >
                                        {Icon && <Icon size={18} />}
                                        <span>{route.name}</span>
                                    </NavLink>
                                </Can>
                            ) : (
                                <NavLink
                                    key={route.path}
                                    to={to(route.path)}
                                    exact={route.exact}
                                    className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'}
                                    activeClassName={'!bg-cyan-600/20 !text-cyan-400 !font-semibold border border-cyan-500/30'}
                                >
                                    {Icon && <Icon size={18} />}
                                    <span>{route.name}</span>
                                </NavLink>
                            );
                        })}

                    {rootAdmin && serverId && (
                        <a
                            href={`/admin/servers/view/${serverId}`}
                            target={'_blank'}
                            rel={'noreferrer'}
                            className={'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors mt-2 border border-dashed border-neutral-800'}
                        >
                            <span>Lihat di Admin</span>
                            <ExternalLink size={14} />
                        </a>
                    )}
                </nav>

                {/* Fixed Footer (Non-scrolling) */}
                <div className={'p-3 border-t border-neutral-800 shrink-0'}>
                    <button
                        type={'button'}
                        onClick={() => setLogoutModalOpen(true)}
                        className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors'}
                    >
                        <LogOut size={18} />
                        <span>Keluar Akun</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
