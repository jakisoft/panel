import React, { useEffect, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';
import {
    TrashItem,
    getTrashItems,
    restoreTrashItem,
    restoreAllTrashItems,
    deleteTrashItemPermanently,
    emptyTrash,
    formatDaysRemaining,
} from '@/api/server/files/recycleBin';
import { bytesToString } from '@/lib/formatters';
import {
    Trash2,
    RotateCcw,
    Folder,
    FileText,
    Clock,
    Search,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/elements/button/index';
import Spinner from '@/components/elements/Spinner';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import { format } from 'date-fns';

export default ({ visible, onDismissed }: RequiredModalProps) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<TrashItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingItem, setProcessingItem] = useState<string | null>(null);
    const [spinnerMessage, setSpinnerMessage] = useState('');
    const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<TrashItem | null>(null);

    const loadItems = () => {
        setLoading(true);
        getTrashItems(uuid)
            .then((data) => setItems(data))
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (visible) {
            loadItems();
            setSearchQuery('');
        }
    }, [visible]);

    const handleRestore = (item: TrashItem) => {
        setProcessingItem(item.id);
        setSpinnerMessage(`Memulihkan ${item.name}...`);
        clearFlashes('files');

        restoreTrashItem(uuid, item)
            .then(() => {
                setItems((prev) => prev.filter((i) => i.id !== item.id));
                mutate();
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => {
                setProcessingItem(null);
                setSpinnerMessage('');
            });
    };

    const handleRestoreAll = () => {
        if (!items.length) return;
        setLoading(true);
        setSpinnerMessage('Memulihkan semua item...');
        clearFlashes('files');

        restoreAllTrashItems(uuid, items)
            .then(() => {
                setItems([]);
                mutate();
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => {
                setLoading(false);
                setSpinnerMessage('');
            });
    };

    const handleDeletePermanently = (item: TrashItem) => {
        setProcessingItem(item.id);
        setSpinnerMessage(`Menghapus ${item.name} permanen...`);
        clearFlashes('files');

        deleteTrashItemPermanently(uuid, item)
            .then(() => {
                setItems((prev) => prev.filter((i) => i.id !== item.id));
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => {
                setProcessingItem(null);
                setSpinnerMessage('');
                setItemToDelete(null);
            });
    };

    const handleEmptyTrash = () => {
        setLoading(true);
        setShowEmptyConfirm(false);
        setSpinnerMessage('Mengosongkan Recycle Bin...');
        clearFlashes('files');

        emptyTrash(uuid, items)
            .then(() => {
                setItems([]);
                mutate();
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => {
                setLoading(false);
                setSpinnerMessage('');
            });
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.originalDirectory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Dialog.Confirm
                open={showEmptyConfirm}
                onClose={() => setShowEmptyConfirm(false)}
                title={'Kosongkan Recycle Bin'}
                confirm={'Hapus Semua Permanen'}
                onConfirmed={handleEmptyTrash}
            >
                Apakah Anda yakin ingin menghapus semua file di Recycle Bin secara permanen? Tindakan ini tidak dapat dibatalkan.
            </Dialog.Confirm>

            <Dialog.Confirm
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title={'Hapus Permanen'}
                confirm={'Hapus'}
                onConfirmed={() => itemToDelete && handleDeletePermanently(itemToDelete)}
            >
                Apakah Anda yakin ingin menghapus <span className={'font-bold text-white'}>{itemToDelete?.name}</span> secara permanen?
            </Dialog.Confirm>

            <Modal visible={visible} onDismissed={onDismissed} showSpinnerOverlay={false}>
                <SpinnerOverlay visible={!!processingItem || (loading && !!spinnerMessage)} size={'large'} fixed>
                    {spinnerMessage}
                </SpinnerOverlay>

                <div className={'p-6'}>
                    <div className={'flex flex-wrap items-center justify-between pb-4 border-b border-neutral-800 gap-3'}>
                        <div className={'flex items-center space-x-3'}>
                            <div className={'p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20'}>
                                <Trash2 size={22} />
                            </div>
                            <div>
                                <h2 className={'text-lg font-bold text-neutral-100 flex items-center gap-2'}>
                                    Recycle Bin (Tong Sampah)
                                    <span className={'text-xs font-semibold px-2.5 py-0.5 bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-full'}>
                                        {items.length} item
                                    </span>
                                </h2>
                                <p className={'text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5'}>
                                    <Clock size={13} className={'text-neutral-500'} />
                                    File akan dihapus permanen secara otomatis setelah 7 hari.
                                </p>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <div className={'flex items-center space-x-2'}>
                                <Button
                                    variant={Button.Variants.Secondary}
                                    onClick={handleRestoreAll}
                                    className={'!py-1.5 !px-3 text-xs flex items-center gap-1.5'}
                                >
                                    <RotateCcw size={14} />
                                    Pulihkan Semua
                                </Button>
                                <Button.Danger
                                    onClick={() => setShowEmptyConfirm(true)}
                                    className={'!py-1.5 !px-3 text-xs flex items-center gap-1.5'}
                                >
                                    <Trash2 size={14} />
                                    Kosongkan Sampah
                                </Button.Danger>
                            </div>
                        )}
                    </div>

                    {items.length > 3 && (
                        <div className={'mt-4 relative'}>
                            <Search size={15} className={'absolute left-3 top-3 text-neutral-400'} />
                            <input
                                type={'text'}
                                placeholder={'Cari file di recycle bin...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={'w-full pl-9 pr-4 py-2 bg-neutral-800/80 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-rose-500 transition-colors'}
                            />
                        </div>
                    )}

                    <div className={'mt-4 max-h-[50vh] overflow-y-auto pr-1 space-y-2'}>
                        {loading && !items.length ? (
                            <div className={'py-12 flex justify-center'}>
                                <Spinner size={'large'} />
                            </div>
                        ) : !items.length ? (
                            <div className={'py-16 text-center'}>
                                <div className={'w-16 h-16 bg-neutral-800/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-500 border border-neutral-700/50'}>
                                    <Trash2 size={28} className={'text-neutral-500'} />
                                </div>
                                <h3 className={'text-neutral-200 font-semibold text-base'}>Recycle Bin Kosong</h3>
                                <p className={'text-xs text-neutral-400 mt-1 max-w-sm mx-auto'}>
                                    Belum ada file atau folder yang dihapus. Saat Anda menghapus file, file tersebut akan masuk ke sini sebelum dihapus permanen.
                                </p>
                            </div>
                        ) : !filteredItems.length ? (
                            <div className={'py-8 text-center text-neutral-400 text-sm'}>
                                Tidak ada file yang sesuai dengan pencarian "{searchQuery}".
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={'flex items-center justify-between p-3.5 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 hover:border-neutral-600 rounded-xl transition-colors'}
                                >
                                    <div className={'flex items-center space-x-3 min-w-0 pr-4'}>
                                        <div className={`p-2.5 rounded-xl ${item.isFile ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                            {item.isFile ? <FileText size={18} /> : <Folder size={18} />}
                                        </div>
                                        <div className={'min-w-0'}>
                                            <p className={'text-sm font-semibold text-neutral-100 truncate'}>
                                                {item.name}
                                            </p>
                                            <div className={'flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-400 mt-0.5'}>
                                                <span>Lokasi: <span className={'text-neutral-300 font-mono'}>{item.originalDirectory}</span></span>
                                                {item.isFile && <span>• {bytesToString(item.size)}</span>}
                                                <span>• {format(new Date(item.deletedAt), 'dd MMM yyyy HH:mm')}</span>
                                                <span className={'text-amber-400 font-medium'}>({formatDaysRemaining(item.deletedAt)})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={'flex items-center space-x-2 shrink-0'}>
                                        <Button
                                            onClick={() => handleRestore(item)}
                                            className={'!py-1.5 !px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 font-medium'}
                                            title={'Pulihkan ke lokasi asal'}
                                        >
                                            <RotateCcw size={14} />
                                            Pulihkan
                                        </Button>
                                        <Button.Danger
                                            onClick={() => setItemToDelete(item)}
                                            className={'!py-1.5 !px-2.5 text-xs'}
                                            title={'Hapus permanen'}
                                        >
                                            <Trash2 size={14} />
                                        </Button.Danger>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={'mt-6 pt-4 border-t border-neutral-800 flex justify-end'}>
                        <Button variant={Button.Variants.Secondary} onClick={onDismissed}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
