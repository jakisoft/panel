import React, { useState } from 'react';
import { Button } from '@/components/elements/button/index';
import Fade from '@/components/elements/Fade';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import { TrashItem, restoreTrashItem, deleteTrashItemPermanently } from '@/api/server/files/recycleBin';
import Portal from '@/components/elements/Portal';
import { Dialog } from '@/components/elements/dialog';
import { RotateCcw, Trash2 } from 'lucide-react';

interface Props {
    selectedItems: TrashItem[];
    onActionCompleted: (ids: string[]) => void;
}

export default ({ selectedItems, onActionCompleted }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const onRestoreSelected = async () => {
        if (!selectedItems.length) return;
        setLoading(true);
        setLoadingMessage(`Memulihkan ${selectedItems.length} item...`);
        clearFlashes('files');

        const successIds: string[] = [];
        for (const item of selectedItems) {
            try {
                await restoreTrashItem(uuid, item);
                successIds.push(item.id);
            } catch (error) {
                clearAndAddHttpError({ key: 'files', error });
            }
        }

        setLoading(false);
        if (successIds.length > 0) {
            onActionCompleted(successIds);
        }
    };

    const onDeleteSelectedPermanently = async () => {
        if (!selectedItems.length) return;
        setLoading(true);
        setShowDeleteConfirm(false);
        setLoadingMessage(`Menghapus permanen ${selectedItems.length} item...`);
        clearFlashes('files');

        const successIds: string[] = [];
        for (const item of selectedItems) {
            try {
                await deleteTrashItemPermanently(uuid, item);
                successIds.push(item.id);
            } catch (error) {
                clearAndAddHttpError({ key: 'files', error });
            }
        }

        setLoading(false);
        if (successIds.length > 0) {
            onActionCompleted(successIds);
        }
    };

    return (
        <>
            <SpinnerOverlay visible={loading} size={'large'} fixed>
                {loadingMessage}
            </SpinnerOverlay>

            <Dialog.Confirm
                title={'Hapus Permanen Terpilih'}
                open={showDeleteConfirm}
                confirm={'Hapus Permanen'}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirmed={onDeleteSelectedPermanently}
            >
                <p className={'mb-2'}>
                    Apakah Anda yakin ingin menghapus&nbsp;
                    <span className={'font-bold text-white'}>{selectedItems.length} item</span> secara permanen dari Recycle Bin?
                    Tindakan ini tidak dapat dibatalkan.
                </p>
                <ul className={'list-disc pl-5 text-sm text-neutral-300 max-h-40 overflow-y-auto'}>
                    {selectedItems.slice(0, 15).map((item) => (
                        <li key={item.id}>{item.name}</li>
                    ))}
                    {selectedItems.length > 15 && <li>dan {selectedItems.length - 15} item lainnya</li>}
                </ul>
            </Dialog.Confirm>

            <Portal>
                <div className={'pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50'}>
                    <Fade timeout={75} in={selectedItems.length > 0} unmountOnExit>
                        <div className={'flex items-center gap-2 pointer-events-auto rounded-xl p-2.5 bg-neutral-900/95 border border-neutral-700 shadow-2xl backdrop-blur-md'}>
                            <div className={'px-3 py-1 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg'}>
                                {selectedItems.length} dipilih
                            </div>
                            <Button
                                onClick={onRestoreSelected}
                                className={'!py-2 !px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 font-medium'}
                            >
                                <RotateCcw size={14} />
                                Pulihkan Terpilih
                            </Button>
                            <Button.Danger
                                onClick={() => setShowDeleteConfirm(true)}
                                className={'!py-2 !px-3 text-xs flex items-center gap-1.5'}
                            >
                                <Trash2 size={14} />
                                Hapus Permanen
                            </Button.Danger>
                        </div>
                    </Fade>
                </div>
            </Portal>
        </>
    );
};
