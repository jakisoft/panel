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
        setLoadingMessage(`Restoring ${selectedItems.length} items...`);
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
        setLoadingMessage(`Permanently deleting ${selectedItems.length} items...`);
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
                title={'Delete Permanently'}
                open={showDeleteConfirm}
                confirm={'Delete Permanently'}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirmed={onDeleteSelectedPermanently}
            >
                <p className={'mb-2'}>
                    Are you sure you want to permanently delete the selected items from the Trash? This action cannot be undone.
                </p>
                <ul className={'list-disc pl-5 text-sm text-neutral-300 max-h-40 overflow-y-auto'}>
                    {selectedItems.slice(0, 15).map((item) => (
                        <li key={item.id}>{item.name}</li>
                    ))}
                    {selectedItems.length > 15 && <li>and more...</li>}
                </ul>
            </Dialog.Confirm>

            <Portal>
                <div className={'pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50'}>
                    <Fade timeout={75} in={selectedItems.length > 0} unmountOnExit>
                        <div className={'flex items-center gap-2 pointer-events-auto rounded-xl p-2 bg-neutral-900/95 border border-neutral-700 shadow-2xl backdrop-blur-md'}>
                            <Button
                                onClick={onRestoreSelected}
                                className={'!py-2 !px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 font-medium'}
                            >
                                <RotateCcw size={14} />
                                Restore Selected
                            </Button>
                            <Button.Danger
                                onClick={() => setShowDeleteConfirm(true)}
                                className={'!py-2 !px-3 text-xs flex items-center gap-1.5'}
                            >
                                <Trash2 size={14} />
                                Delete Permanently
                            </Button.Danger>
                        </div>
                    </Fade>
                </div>
            </Portal>
        </>
    );
};
