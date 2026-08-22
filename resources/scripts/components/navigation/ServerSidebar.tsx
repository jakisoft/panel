import React, { useState, useEffect } from 'react';
import { NavLink, Link, useRouteMatch, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    X,
    Shield,
} from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { useSidebar } from '@/components/SidebarContext';
import routes from '@/routers/routes';
import Can from '@/components/elements/Can';
import LogoutConfirmDialog from '@/components/navigation/LogoutConfirmDialog';
import jksoftLogo from '@/assets/images/jksoft-logo.svg';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();
    const { isOpen, close } = useSidebar();
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo) || jksoftLogo;
    const logoDisplay = useStoreState((state: ApplicationStore) => state.settings.data?.logo_display || 'both');
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data?.rootAdmin);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);

    const showLogo = logoDisplay === 'both' || logoDisplay === 'logo_only';
    const showText = logoDisplay === 'text_only';

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
                {/* Fixed Top Header: Logo and App Name */}
                <div className={'h-16 flex items-center justify-between px-4 border-b border-neutral-800 shrink-0'}>
                    <Link to={'/'} className={'flex items-center gap-2.5 no-underline text-neutral-100 min-w-0 pr-2'}>
                        {showLogo && (
                            <img src={logo} alt={name} className={'h-8 max-w-[170px] object-contain shrink-0'} />
                        )}
                        {showText && (
                            <span className={'font-bold text-sm text-neutral-100 tracking-tight truncate'}>{name}</span>
                        )}
                    </Link>
                    <button
                        type={'button'}
                        onClick={close}
                        className={'p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden shrink-0'}
                        title={'Tutup Sidebar'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Server Navigation Menu */}
                <nav className={'flex-1 overflow-y-auto px-3 py-3 space-y-1'}>
                    <Link
                        to={'/'}
                        className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors mb-2 border-b border-neutral-800/80 pb-2.5'}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard Utama</span>
                    </Link>

                    <div className={'px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500'}>
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
                                        className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                                        activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold border border-neutral-700/60 shadow-sm'}
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
                                    className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                                    activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold border border-neutral-700/60 shadow-sm'}
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
                            className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                        >
                            <Shield size={18} className={'text-neutral-400'} />
                            <span>Lihat di Admin</span>
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
