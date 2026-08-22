import React, { useState } from 'react';
import { Search } from 'lucide-react';
import useEventListener from '@/plugins/useEventListener';
import SearchModal from '@/components/dashboard/search/SearchModal';
import Tooltip from '@/components/elements/tooltip/Tooltip';

export default () => {
    const [visible, setVisible] = useState(false);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (['input', 'textarea'].indexOf(((e.target as HTMLElement).tagName || 'input').toLowerCase()) < 0) {
            if (!visible && (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key === '/')) {
                setVisible(true);
            }
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <Tooltip placement={'bottom'} content={'Cari Server (Ctrl+K)'}>
                <button
                    type={'button'}
                    aria-label={'Search'}
                    className={'w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all shadow-sm focus:outline-none cursor-pointer'}
                    onClick={() => setVisible(true)}
                >
                    <Search size={18} />
                </button>
            </Tooltip>
        </>
    );
};
