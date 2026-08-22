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
import { Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolder } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/elements/button/index';
import Spinner from '@/components/elements/Spinner';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import { format } from 'date-fns';
import RecycleBinDropdownMenu from '@/components/server/files/RecycleBinDropdownMenu';
import RecycleBinMassActionsBar from '@/components/server/files/RecycleBinMassActionsBar';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { encodePathSegments } from '@/helpers';
import { join } from 'pathe';
import tw from 'twin.macro';
import styles from './style.module.css';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<TrashItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.currentTarget.checked ? items.map((i) => i.id) : []);
    };

    const toggleSelectItem = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectedTrashItems = items.filter((i) => selectedIds.includes(i.id));

    return (
        <ServerContentBlock title={'Recycle Bin'} showFlashKey={'files'}>
            <SpinnerOverlay visible={loading && !items.length && !!spinnerMessage} size={'large'} fixed>
                {spinnerMessage}
            </SpinnerOverlay>

            <Dialog.Confirm
                open={showEmptyConfirm}
                onClose={() => setShowEmptyConfirm(false)}
                title={'Kosongkan Tong Sampah'}
                confirm={'Hapus Semua'}
                onConfirmed={handleEmptyTrash}
            >
                Apakah Anda yakin ingin menghapus semua file di Tong Sampah secara permanen? Tindakan ini tidak dapat dibatalkan.
            </Dialog.Confirm>

            {/* Breadcrumb Bar identical to File Manager */}
            <div className={'flex flex-wrap-reverse md:flex-nowrap items-center justify-between gap-3 mb-4'}>
                <div css={tw`flex flex-grow-0 items-center text-sm text-neutral-500 overflow-x-hidden`}>
                    <FileActionCheckbox
                        type={'checkbox'}
                        css={tw`mx-4`}
                        checked={selectedIds.length === (items.length === 0 ? -1 : items.length)}
                        onChange={onSelectAllClick}
                    />
                    /<span css={tw`px-1 text-neutral-300`}>home</span>/
                    <NavLink to={`/server/${match.params.id}/files`} css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}>
                        container
                    </NavLink>
                    /
                    <span css={tw`px-1 text-neutral-300`}>recycle-bin</span>
                </div>

                <div className={'flex items-center gap-2'}>
                    <NavLink
                        to={`/server/${match.params.id}/files`}
                        className={'px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors no-underline'}
                    >
                        Back to Files
                    </NavLink>
                    {items.length > 0 && (
                        <Button.Danger
                            onClick={() => setShowEmptyConfirm(true)}
                            className={'!py-2 !px-3 text-xs flex items-center gap-1.5 font-medium'}
                        >
                            <Trash2 size={14} />
                            Empty Trash
                        </Button.Danger>
                    )}
                </div>
            </div>

            {/* Content List identical to File Manager */}
            {loading && !items.length ? (
                <Spinner size={'large'} centered />
            ) : !items.length ? (
                <p css={tw`text-sm text-neutral-400 text-center py-8`}>Recycle bin is empty.</p>
            ) : (
                <div>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={styles.file_row}
                        >
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-4`}
                                checked={selectedIds.includes(item.id)}
                                onChange={() => toggleSelectItem(item.id)}
                            />
                            <NavLink
                                className={styles.details}
                                to={
                                    item.isFile
                                        ? `/server/${match.params.id}/files/edit#${encodePathSegments(join(item.originalDirectory || '/', item.name))}`
                                        : `/server/${match.params.id}/files#${encodePathSegments(item.originalDirectory || '/')}`
                                }
                            >
                                <div css={tw`flex-none text-neutral-400 ml-2 mr-4 text-lg pl-3`}>
                                    <FontAwesomeIcon icon={item.isFile ? faFileAlt : faFolder} />
                                </div>
                                <div css={tw`flex-1 truncate`}>
                                    <span className={'text-neutral-200 font-medium hover:text-white'}>{item.name}</span>
                                    <span css={tw`text-xs text-neutral-500 ml-2 font-mono hidden sm:inline`}>({item.originalDirectory})</span>
                                </div>
                                {item.isFile && <div css={tw`w-1/6 text-right mr-4 hidden sm:block text-neutral-400 text-xs`}>{bytesToString(item.size)}</div>}
                                <div css={tw`w-1/5 text-right mr-4 hidden md:block text-xs text-neutral-400`} title={format(new Date(item.deletedAt), 'dd MMM yyyy HH:mm')}>
                                    {formatDaysRemaining(item.deletedAt)}
                                </div>
                            </NavLink>
                            <RecycleBinDropdownMenu item={item} onItemRemoved={onItemRemoved} />
                        </div>
                    ))}
                    <RecycleBinMassActionsBar
                        selectedItems={selectedTrashItems}
                        onActionCompleted={onMassActionCompleted}
                    />
                </div>
            )}
        </ServerContentBlock>
    );
};
