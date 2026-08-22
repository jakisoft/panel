import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlignLeft } from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import { useSidebar } from '@/components/SidebarContext';
import UserDropdown from '@/components/navigation/UserDropdown';

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo);
    const { toggle } = useSidebar();

    return (
        <header className={'w-full bg-neutral-900/95 backdrop-blur border-b border-neutral-800 shadow-md sticky top-0 z-30'}>
            <div className={'w-full flex items-center justify-between h-14 px-3 sm:px-6'}>
                {/* Left: Sidebar Toggle & Logo */}
                <div className={'flex items-center gap-3'}>
                    <button
                        type={'button'}
                        onClick={toggle}
                        className={'p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none'}
                        title={'Buka / Tutup Sidebar'}
                        aria-label={'Toggle Sidebar'}
                    >
                        <AlignLeft size={20} />
                    </button>

                    <Link
                        to={'/'}
                        className={'flex items-center gap-2.5 no-underline text-neutral-100 hover:text-white transition-colors'}
                    >
                        {logo && logo !== '/assets/svgs/pterodactyl.svg' ? (
                            <img src={logo} alt={name} className={'h-7 max-w-[150px] object-contain'} />
                        ) : (
                            <div className={'flex items-center gap-2'}>
                                <img src={'/assets/svgs/pterodactyl.svg'} alt={name} className={'h-7 w-7'} />
                                <span className={'font-bold text-sm sm:text-base text-neutral-100 tracking-tight'}>{name}</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Right: Search & User Avatar Dropdown */}
                <div className={'flex items-center gap-2 sm:gap-4'}>
                    <SearchContainer />
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
};
