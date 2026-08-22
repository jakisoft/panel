import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
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
                className={`btn btn-red flex items-center justify-center space-x-2 py-2 px-3 sm:px-4 rounded text-sm font-header font-medium transition-all shadow-sm bg-red-600 hover:bg-red-500 text-white ${className || ''}`}
                title={'Recycle Bin (Tong Sampah)'}
            >
                <FontAwesomeIcon icon={faTrashAlt} className={'w-4 h-4'} />
                <span>Recycle Bin</span>
            </button>
        </>
    );
};
