import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import {
    TrashItem,
    getTrashItems,
    emptyTrash,
    formatDaysRemaining,
} from '@/api/server/files/recycleBin';
import loadDirectory, { FileObject } from '@/api/server/files/loadDirectory';
import { bytesToString } from '@/lib/formatters';
import { Trash2, Filter, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolder } from '@fortawesome/free-solid-svg-icons';
import Spinner from '@/components/elements/Spinner';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import { format } from 'date-fns';
import RecycleBinDropdownMenu from '@/components/server/files/RecycleBinDropdownMenu';
import RecycleBinMassActionsBar from '@/components/server/files/RecycleBinMassActionsBar';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { encodePathSegments, hashToPath } from '@/helpers';
import { join } from 'pathe';
import tw from 'twin.macro';
import styles from './style.module.css';

const getCleanTrashName = (name: string): string => {
    const match = name.match(/^\d+_[a-z0-9]+_(.+)$/i);
    return match ? match[1] : name;
};

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const { hash } = useLocation();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<TrashItem[]>([]);
    const [subFiles, setSubFiles] = useState<FileObject[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
    const [spinnerMessage, setSpinnerMessage] = useState('');

    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currentSubPath = hashToPath(hash);
    const isRootTrash = currentSubPath === '/' || currentSubPath === '';

    const loadData = () => {
        setLoading(true);
        setSelectedIds([]);
        clearFlashes('files');

        if (isRootTrash) {
            getTrashItems(uuid)
                .then((data) => setItems(data))
                .catch((error) => clearAndAddHttpError({ key: 'files', error }))
                .finally(() => setLoading(false));
        } else {
            loadDirectory(uuid, join('/.trash', currentSubPath))
                .then((data) => {
                    const sorted = data
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
                    setSubFiles(sorted);
                })
                .catch((error) => clearAndAddHttpError({ key: 'files', error }))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        loadData();
        setIsSearching(false);
        setSearchQuery('');
    }, [uuid, hash]);

    const handleEmptyTrash = () => {
        setLoading(true);
        setShowEmptyConfirm(false);
        setSpinnerMessage('Mengosongkan Tong Sampah...');
        clearFlashes('files');

        emptyTrash(uuid, items)
            .then(() => {
                setItems([]);
                setSubFiles([]);
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

    // Filter displayed items based on search query
    const displayedRootItems = isRootTrash
        ? searchQuery.trim()
            ? items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
            : items
        : [];

    const displayedSubFiles = !isRootTrash
        ? searchQuery.trim()
            ? subFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
            : subFiles
        : [];

    const currentTotalCount = isRootTrash ? displayedRootItems.length : displayedSubFiles.length;

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isRootTrash) {
            setSelectedIds(e.currentTarget.checked ? displayedRootItems.map((i) => i.id) : []);
        } else {
            setSelectedIds(e.currentTarget.checked ? displayedSubFiles.map((f) => f.name) : []);
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectedTrashItems = items.filter((i) => selectedIds.includes(i.id));

    // Build breadcrumbs for subfolder navigation in trash
    const pathSegments = currentSubPath
        .split('/')
        .filter((dir) => !!dir);

    return (
        <ServerContentBlock title={'Sampah'} showFlashKey={'files'}>
            <SpinnerOverlay visible={loading && !items.length && !subFiles.length && !!spinnerMessage} size={'large'} fixed>
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

            {/* Breadcrumb & Search Bar */}
            <div className={'flex items-center justify-between gap-3 mb-4'}>
                <div className={'flex items-center flex-1 min-w-0 overflow-hidden'}>
                    <FileActionCheckbox
                        type={'checkbox'}
                        css={tw`mx-4`}
                        checked={selectedIds.length === (currentTotalCount === 0 ? -1 : currentTotalCount)}
                        onChange={onSelectAllClick}
                    />
                    <button
                        type={'button'}
                        onClick={() => {
                            setIsSearching((prev) => !prev);
                            setSearchQuery('');
                        }}
                        className={'p-1.5 mr-3 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none shrink-0'}
                        title={isSearching ? 'Tutup Filter' : 'Filter / Cari File & Folder'}
                        aria-label={isSearching ? 'Tutup Filter' : 'Filter / Cari File & Folder'}
                    >
                        {isSearching ? <X size={16} /> : <Filter size={16} />}
                    </button>

                    {isSearching ? (
                        <div className={'flex-1 min-w-0 mr-4'}>
                            <input
                                type={'text'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setIsSearching(false);
                                        setSearchQuery('');
                                    }
                                }}
                                placeholder={'Cari file atau folder di sampah...'}
                                autoFocus
                                className={'w-full max-w-sm px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 rounded-xl focus:outline-none focus:border-rose-500 transition-colors shadow-inner'}
                            />
                        </div>
                    ) : (
                        <div css={tw`flex flex-grow-0 items-center text-sm text-neutral-500 overflow-x-hidden`}>
                            /<span css={tw`px-1 text-neutral-300`}>home</span>/
                            <NavLink to={`/server/${match.params.id}/files`} css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}>
                                container
                            </NavLink>
                            /
                            <NavLink to={`/server/${match.params.id}/files/trash`} css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}>
                                .trash
                            </NavLink>
                            {pathSegments.map((segment, idx) => {
                                const subLink = pathSegments.slice(0, idx + 1).join('/');
                                const isLast = idx === pathSegments.length - 1;
                                return (
                                    <React.Fragment key={idx}>
                                        /
                                        {isLast ? (
                                            <span css={tw`px-1 text-neutral-300`}>{getCleanTrashName(segment)}</span>
                                        ) : (
                                            <NavLink
                                                to={`/server/${match.params.id}/files/trash#/${encodePathSegments(subLink)}`}
                                                css={tw`px-1 text-neutral-200 no-underline hover:text-neutral-100`}
                                            >
                                                {getCleanTrashName(segment)}
                                            </NavLink>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={'flex items-center gap-2 pr-2'}>
                    {(items.length > 0 || subFiles.length > 0) && (
                        <button
                            type={'button'}
                            onClick={() => setShowEmptyConfirm(true)}
                            className={'p-2 rounded-xl text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm focus:outline-none flex items-center justify-center shrink-0'}
                            title={'Kosongkan Tong Sampah'}
                            aria-label={'Kosongkan Tong Sampah'}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content List */}
            {loading && !items.length && !subFiles.length ? (
                <Spinner size={'large'} centered />
            ) : isRootTrash ? (
                /* Root Trash Items */
                !displayedRootItems.length ? (
                    <p css={tw`text-sm text-neutral-400 text-center py-8`}>
                        {searchQuery.trim()
                            ? `Tidak ada file atau folder yang cocok dengan "${searchQuery}".`
                            : 'Sampah kosong.'}
                    </p>
                ) : (
                    <div>
                        {displayedRootItems.map((item) => (
                            <div key={item.id} className={styles.file_row}>
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
                                            ? `/server/${match.params.id}/files/edit#${encodePathSegments(join('/.trash', item.id))}`
                                            : `/server/${match.params.id}/files/trash#/${encodePathSegments(item.id)}`
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
                )
            ) : (
                /* Subfolder Items within Trash */
                !displayedSubFiles.length ? (
                    <p css={tw`text-sm text-neutral-400 text-center py-8`}>
                        {searchQuery.trim()
                            ? `Tidak ada file atau folder yang cocok dengan "${searchQuery}".`
                            : 'Folder sampah ini kosong.'}
                    </p>
                ) : (
                    <div>
                        {displayedSubFiles.map((file) => (
                            <div key={file.key} className={styles.file_row}>
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    css={tw`mx-4`}
                                    checked={selectedIds.includes(file.name)}
                                    onChange={() => toggleSelectItem(file.name)}
                                />
                                <NavLink
                                    className={styles.details}
                                    to={
                                        file.isFile
                                            ? `/server/${match.params.id}/files/edit#${encodePathSegments(join('/.trash', currentSubPath, file.name))}`
                                            : `/server/${match.params.id}/files/trash#/${encodePathSegments(join(currentSubPath, file.name))}`
                                    }
                                >
                                    <div css={tw`flex-none text-neutral-400 ml-2 mr-4 text-lg pl-3`}>
                                        <FontAwesomeIcon icon={file.isFile ? faFileAlt : faFolder} />
                                    </div>
                                    <div css={tw`flex-1 truncate`}>
                                        <span className={'text-neutral-200 font-medium hover:text-white'}>{file.name}</span>
                                    </div>
                                    {file.isFile && <div css={tw`w-1/6 text-right mr-4 hidden sm:block text-neutral-400 text-xs`}>{bytesToString(file.size)}</div>}
                                    <div css={tw`w-1/5 text-right mr-4 hidden md:block text-xs text-neutral-400`}>
                                        {format(new Date(file.modifiedAt), 'dd MMM yyyy HH:mm')}
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>
                )
            )}
        </ServerContentBlock>
    );
};
