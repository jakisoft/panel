import React, { useEffect, useState } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import {
    TrashItem,
    getTrashItems,
    emptyTrash,
    formatDaysRemaining,
} from '@/api/server/files/recycleBin';
import { bytesToString } from '@/lib/formatters';
import {
    Trash2,
    Folder,
    FileText,
    Clock,
    Search,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/elements/button/index';
import Spinner from '@/components/elements/Spinner';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import { format } from 'date-fns';
import RecycleBinDropdownMenu from '@/components/server/files/RecycleBinDropdownMenu';
import RecycleBinMassActionsBar from '@/components/server/files/RecycleBinMassActionsBar';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import tw from 'twin.macro';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<TrashItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
    const [spinnerMessage, setSpinnerMessage] = useState('');

    const loadItems = () => {
        setLoading(true);
        getTrashItems(uuid)
            .then((data) => setItems(data))
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadItems();
        setSelectedIds([]);
    }, [uuid]);

    const handleEmptyTrash = () => {
        setLoading(true);
        setShowEmptyConfirm(false);
        setSpinnerMessage('Mengosongkan Tong Sampah...');
        clearFlashes('files');

        emptyTrash(uuid, items)
            .then(() => {
                setItems([]);
                setSelectedIds([]);
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => {
                setLoading(false);
                setSpinnerMessage('');
            });
    };

    const onItemRemoved = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
    };

    const onMassActionCompleted = (ids: string[]) => {
        setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
        setSelectedIds((prev) => prev.filter((i) => !ids.includes(i)));
    };

    const filteredItems = items.filter(
        (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.originalDirectory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onSelectAllClick = () => {
        if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map((i) => i.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectedTrashItems = items.filter((i) => selectedIds.includes(i.id));

    return (
        <ServerContentBlock title={'Tong Sampah (Recycle Bin)'} showFlashKey={'files'}>
            <SpinnerOverlay visible={loading && !!spinnerMessage} size={'large'} fixed>
                {spinnerMessage}
            </SpinnerOverlay>

            <Dialog.Confirm
                open={showEmptyConfirm}
                onClose={() => setShowEmptyConfirm(false)}
                title={'Kosongkan Tong Sampah'}
                confirm={'Hapus Semua Permanen'}
                onConfirmed={handleEmptyTrash}
            >
                Apakah Anda yakin ingin menghapus semua file di Tong Sampah secara permanen? Tindakan ini tidak dapat dibatalkan.
            </Dialog.Confirm>

            {/* Header / Breadcrumb Bar */}
            <div className={'flex flex-wrap items-center justify-between gap-3 mb-4'}>
                <div className={'flex items-center space-x-3'}>
                    <FileActionCheckbox
                        type={'checkbox'}
                        css={tw`mx-2`}
                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                        onChange={onSelectAllClick}
                    />
                    <NavLink
                        to={`/server/${match.params.id}/files`}
                        className={'flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors'}
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali ke File Manager</span>
                    </NavLink>
                    <span className={'text-neutral-500 text-sm'}>/</span>
                    <h2 className={'text-sm font-bold text-neutral-200 flex items-center gap-2'}>
                        <Trash2 size={16} className={'text-rose-400'} />
                        <span>Tong Sampah</span>
                        <span className={'text-xs font-semibold px-2 py-0.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full'}>
                            {items.length} item
                        </span>
                    </h2>
                </div>

                <div className={'flex items-center gap-2'}>
                    {items.length > 0 && (
                        <Button.Danger
                            onClick={() => setShowEmptyConfirm(true)}
                            className={'!py-2 !px-3.5 text-xs flex items-center gap-1.5 font-medium'}
                        >
                            <Trash2 size={14} />
                            Kosongkan Sampah
                        </Button.Danger>
                    )}
                </div>
            </div>

            {/* Search filter if items exist */}
            {items.length > 3 && (
                <div className={'mb-4 relative'}>
                    <Search size={15} className={'absolute left-3.5 top-3 text-neutral-400'} />
                    <input
                        type={'text'}
                        placeholder={'Cari nama file atau folder di tong sampah...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={'w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-rose-500 transition-colors'}
                    />
                </div>
            )}

            {/* Content List */}
            {loading && !items.length ? (
                <Spinner size={'large'} centered />
            ) : !items.length ? (
                <div className={'py-16 text-center bg-neutral-900 border border-neutral-800/80 rounded-2xl'}>
                    <div className={'w-16 h-16 bg-neutral-800/60 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-500 border border-neutral-700/50'}>
                        <Trash2 size={28} className={'text-neutral-500'} />
                    </div>
                    <h3 className={'text-neutral-200 font-semibold text-base'}>Tong Sampah Kosong</h3>
                    <p className={'text-xs text-neutral-400 mt-1 max-w-sm mx-auto'}>
                        Belum ada file atau folder yang dihapus. Saat Anda menghapus file, file tersebut akan masuk ke sini dan tersimpan selama 7 hari sebelum dibersihkan otomatis.
                    </p>
                </div>
            ) : !filteredItems.length ? (
                <div className={'py-12 text-center text-neutral-400 text-sm bg-neutral-900 border border-neutral-800 rounded-xl'}>
                    Tidak ada file yang sesuai dengan pencarian "{searchQuery}".
                </div>
            ) : (
                <div className={'space-y-1.5'}>
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                selectedIds.includes(item.id)
                                    ? 'bg-neutral-800/90 border-rose-500/50'
                                    : 'bg-neutral-900 hover:bg-neutral-800/70 border-neutral-800'
                            }`}
                        >
                            <div className={'flex items-center space-x-3 min-w-0 pr-4'}>
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    css={tw`mx-2`}
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleSelectItem(item.id)}
                                />
                                <div className={`p-2.5 rounded-xl shrink-0 ${item.isFile ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                    {item.isFile ? <FileText size={18} /> : <Folder size={18} />}
                                </div>
                                <div className={'min-w-0'}>
                                    <p className={'text-sm font-semibold text-neutral-100 truncate'}>
                                        {item.name}
                                    </p>
                                    <div className={'flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-400 mt-0.5'}>
                                        <span>Lokasi Asal: <span className={'text-neutral-300 font-mono'}>{item.originalDirectory}</span></span>
                                        {item.isFile && <span>• {bytesToString(item.size)}</span>}
                                        <span>• Dihapus: {format(new Date(item.deletedAt), 'dd MMM yyyy HH:mm')}</span>
                                        <span className={'text-amber-400 font-medium flex items-center gap-1'}>
                                            <Clock size={11} />
                                            {formatDaysRemaining(item.deletedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={'flex items-center space-x-2 shrink-0'}>
                                <RecycleBinDropdownMenu item={item} onItemRemoved={onItemRemoved} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Mass Actions Bar */}
            <RecycleBinMassActionsBar
                selectedItems={selectedTrashItems}
                onActionCompleted={onMassActionCompleted}
            />
        </ServerContentBlock>
    );
};
