import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import RecycleBinModal from '@/components/server/files/RecycleBinModal';
import { WithClassname } from '@/components/types';

export default ({ className }: WithClassname) => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <RecycleBinModal visible={visible} onDismissed={() => setVisible(false)} />
            <button
                type={'button'}
                onClick={() => setVisible(true)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm bg-rose-600 hover:bg-rose-500 text-white ${className || ''}`}
                title={'Recycle Bin (Tong Sampah)'}
            >
                <Trash2 size={16} />
                <span>Recycle Bin</span>
            </button>
        </>
    );
};
