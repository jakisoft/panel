import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Shield,
    User,
    Key,
    Terminal,
    Activity,
    LogOut,
    ChevronDown,
    X,
} from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { useSidebar } from '@/components/SidebarContext';
import LogoutConfirmDialog from '@/components/navigation/LogoutConfirmDialog';
import jksoftLogo from '@/assets/images/jksoft-logo.svg';

export default () => {
    const location = useLocation();
    const { isOpen, close } = useSidebar();
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo) || jksoftLogo;
    const logoDisplay = useStoreState((state: ApplicationStore) => state.settings.data?.logo_display || 'both');
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data?.rootAdmin);

    const showLogo = logoDisplay === 'both' || logoDisplay === 'logo_only';
    const showText = logoDisplay === 'text_only';

    // Auto-open Account accordion if currently on /account*
    const isAccountActive = location.pathname.startsWith('/account');
    const [accountOpen, setAccountOpen] = useState(isAccountActive);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/account')) {
            setAccountOpen(true);
        }
    }, [location.pathname]);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            close();
        }
    }, [location.pathname]);

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
                {/* Sidebar Header */}
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
                        className={'p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden'}
                        title={'Tutup Sidebar'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Menu Links */}
                <nav className={'flex-1 overflow-y-auto px-3 py-3 space-y-1'}>
                    {/* Dashboard */}
                    <NavLink
                        to={'/'}
                        exact
                        className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                        activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold border border-neutral-700/60 shadow-sm'}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>

                    {/* Admin Panel (If Root Admin) */}
                    {rootAdmin && (
                        <a
                            href={'/admin'}
                            rel={'noreferrer'}
                            className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                        >
                            <Shield size={18} className={'text-neutral-400'} />
                            <span>Menu Admin</span>
                        </a>
                    )}

                    {/* Account Accordion Section */}
                    <div className={'pt-2'}>
                        <div className={'px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500'}>
                            Pengaturan
                        </div>
                        <button
                            type={'button'}
                            onClick={() => setAccountOpen((prev) => !prev)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors ${
                                isAccountActive ? 'text-neutral-100 font-semibold' : ''
                            }`}
                        >
                            <div className={'flex items-center gap-3'}>
                                <User size={18} />
                                <span>Akun Saya</span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-neutral-400 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Sub-menu items (Accordion) */}
                        {accountOpen && (
                            <div className={'mt-1 ml-4 pl-3 border-l border-neutral-800 space-y-1 animate-fadeIn'}>
                                <NavLink
                                    to={'/account'}
                                    exact
                                    className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                                    activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold'}
                                >
                                    <User size={15} />
                                    <span>Profil & Akun</span>
                                </NavLink>
                                <NavLink
                                    to={'/account/api'}
                                    exact
                                    className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                                    activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold'}
                                >
                                    <Key size={15} />
                                    <span>API Credentials</span>
                                </NavLink>
                                <NavLink
                                    to={'/account/ssh'}
                                    exact
                                    className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                                    activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold'}
                                >
                                    <Terminal size={15} />
                                    <span>SSH Keys</span>
                                </NavLink>
                                <NavLink
                                    to={'/account/activity'}
                                    exact
                                    className={'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors'}
                                    activeClassName={'!bg-neutral-800 !text-neutral-100 !font-semibold'}
                                >
                                    <Activity size={15} />
                                    <span>Log Aktivitas</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Sidebar Footer */}
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
