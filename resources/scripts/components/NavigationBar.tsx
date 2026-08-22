import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Shield, User, LogOut } from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-400 px-4 sm:px-5 cursor-pointer transition-all duration-200`};

        &:active,
        &:hover {
            ${tw`text-white bg-neutral-800/80`};
        }

        &:active,
        &:hover,
        &.active {
            ${tw`text-cyan-400`};
            box-shadow: inset 0 -2px ${theme`colors.cyan.500`.toString()};
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={'w-full bg-neutral-900/95 backdrop-blur border-b border-neutral-800 shadow-lg sticky top-0 z-40'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-14 max-w-[1200px] px-2 sm:px-4'}>
                <div id={'logo'} className={'flex-1 flex items-center'}>
                    <Link
                        to={'/'}
                        className={
                            'flex items-center space-x-2.5 text-xl font-header font-semibold no-underline text-neutral-100 hover:text-white transition-colors duration-150'
                        }
                    >
                        {logo && logo !== '/assets/svgs/pterodactyl.svg' ? (
                            <img src={logo} alt={name} className={'h-8 max-w-[160px] object-contain'} />
                        ) : (
                            <div className={'flex items-center gap-2'}>
                                <div className={'w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20'}>
                                    <span className={'text-white font-bold text-sm'}>JK</span>
                                </div>
                                <span className={'tracking-tight'}>{name}</span>
                            </div>
                        )}
                    </Link>
                </div>
                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard Server'}>
                        <NavLink to={'/'} exact className={'flex items-center gap-2 text-sm font-medium'}>
                            <LayoutDashboard size={18} />
                            <span className={'hidden md:inline'}>Dashboard</span>
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin Panel'}>
                            <a href={'/admin'} rel={'noreferrer'} className={'flex items-center gap-2 text-sm font-medium'}>
                                <Shield size={18} />
                                <span className={'hidden md:inline'}>Admin</span>
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Pengaturan Akun'}>
                        <NavLink to={'/account'} className={'flex items-center gap-2 text-sm font-medium'}>
                            <span className={'flex items-center w-5 h-5 rounded-full overflow-hidden ring-1 ring-neutral-700'}>
                                <Avatar.User />
                            </span>
                            <span className={'hidden md:inline'}>Account</span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Keluar / Logout'}>
                        <button onClick={onTriggerLogout} className={'flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300'}>
                            <LogOut size={18} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
