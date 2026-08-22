import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Avatar from '@/components/Avatar';
import LogoutConfirmDialog from '@/components/navigation/LogoutConfirmDialog';

export default () => {
    const user = useStoreState((state: ApplicationStore) => state.user.data);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const displayName = (user.nameFirst && user.nameLast)
        ? `${user.nameFirst} ${user.nameLast}`
        : user.username;

    return (
        <div className={'relative'} ref={dropdownRef}>
            <LogoutConfirmDialog open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />

            <button
                type={'button'}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-neutral-800/80 transition-colors focus:outline-none'}
            >
                <div className={'w-8 h-8 rounded-lg overflow-hidden ring-2 ring-neutral-700/80 shadow'}>
                    <Avatar.User />
                </div>
                <div className={'hidden sm:flex flex-col text-left'}>
                    <span className={'text-xs font-semibold text-neutral-200 leading-tight truncate max-w-[120px]'}>
                        {displayName}
                    </span>
                    <span className={'text-[11px] text-neutral-400 leading-tight'}>
                        {user.rootAdmin ? 'Administrator' : 'User'}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
                <div className={'absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl z-50 py-2 divide-y divide-neutral-800'}>
                    {/* User profile header */}
                    <div className={'px-4 py-3 flex items-center gap-3'}>
                        <div className={'w-10 h-10 rounded-xl overflow-hidden ring-2 ring-cyan-500/50 shrink-0'}>
                            <Avatar.User />
                        </div>
                        <div className={'min-w-0 flex-1 flex flex-col justify-center'}>
                            <p className={'text-sm font-bold text-neutral-100 truncate leading-snug'}>
                                {displayName}
                            </p>
                            <p className={'text-xs text-neutral-400 truncate mt-0.5 leading-snug'}>
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Navigation links */}
                    <div className={'py-1.5'}>
                        <Link
                            to={'/account'}
                            onClick={() => setDropdownOpen(false)}
                            className={'flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors'}
                        >
                            <Settings size={16} className={'text-neutral-400'} />
                            <span>Pengaturan Akun</span>
                        </Link>
                        {user.rootAdmin && (
                            <a
                                href={'/admin'}
                                rel={'noreferrer'}
                                className={'flex items-center gap-2.5 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors'}
                            >
                                <Shield size={16} />
                                <span>Admin Panel</span>
                            </a>
                        )}
                    </div>

                    {/* Sign out */}
                    <div className={'py-1.5'}>
                        <button
                            type={'button'}
                            onClick={() => {
                                setDropdownOpen(false);
                                setLogoutModalOpen(true);
                            }}
                            className={'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left'}
                        >
                            <LogOut size={16} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
