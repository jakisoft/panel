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
    const [deepTrashResults, setDeepTrashResults] = useState<
        { key: string; name: string; path: string; isFile: boolean; size: number; deletedAt: number; isSubItem?: boolean }[]
    >([]);
    const [isScanningTrash, setIsScanningTrash] = useState(false);

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
                        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
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
        setDeepTrashResults([]);
    }, [uuid, hash]);

    // Recursive search across trash items and inside deleted folders
    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!isSearching || !query) {
            setDeepTrashResults([]);
            setIsScanningTrash(false);
            return;
        }

        setIsScanningTrash(true);

        if (isRootTrash) {
            const directMatches: { key: string; name: string; path: string; isFile: boolean; size: number; deletedAt: number; isSubItem?: boolean }[] = [];
            const folderScanQueue: TrashItem[] = [];

            for (const item of items) {
                if (item.name.toLowerCase().includes(query)) {
                    directMatches.push({
                        key: item.id,
                        name: item.name,
                        path: item.id,
                        isFile: item.isFile,
                        size: item.size,
                        deletedAt: item.deletedAt,
                    });
                }
                if (!item.isFile) {
                    folderScanQueue.push(item);
                }
            }

            setDeepTrashResults(directMatches);

            // Scan inside deleted folders
            (async () => {
                const results = [...directMatches];
                for (const folder of folderScanQueue) {
                    try {
                        const subFolderFiles = await loadDirectory(uuid, join('/.trash', folder.id));
                        for (const sub of subFolderFiles) {
                            if (sub.name === '.trash' || sub.name === '.recycle_bin') continue;
                            const cleanFolder = getCleanTrashName(folder.name);
                            const displayRel = `${cleanFolder}/${sub.name}`;
                            if (sub.name.toLowerCase().includes(query) || displayRel.toLowerCase().includes(query)) {
                                results.push({
                                    key: `${folder.id}_${sub.name}`,
                                    name: displayRel,
                                    path: join(folder.id, sub.name),
                                    isFile: sub.isFile,
                                    size: sub.size,
                                    deletedAt: folder.deletedAt,
                                    isSubItem: true,
                                });
                            }
                        }
                    } catch {
                        // ignore folder read error
                    }
                }
                setDeepTrashResults(results);
                setIsScanningTrash(false);
            })();
        } else {
            const matches = subFiles
                .filter((f) => f.name.toLowerCase().includes(query))
                .map((f) => ({
                    key: f.key,
                    name: f.name,
                    path: join(currentSubPath, f.name),
                    isFile: f.isFile,
                    size: f.size,
                    deletedAt: Date.now(),
                }));
            setDeepTrashResults(matches);
            setIsScanningTrash(false);
        }
    }, [searchQuery, isSearching, items, subFiles, isRootTrash, currentSubPath, uuid]);

    const handleEmptyTrash = () => {
        setLoading(true);
        setShowEmptyConfirm(false);
        setSpinnerMessage('Emptying Trash...');
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

    const isSearchActive = isSearching && searchQuery.trim().length > 0;
    const currentTotalCount = isSearchActive
        ? deepTrashResults.length
        : isRootTrash
        ? items.length
        : subFiles.length;

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isSearchActive) {
            setSelectedIds(e.currentTarget.checked ? deepTrashResults.map((r) => r.key) : []);
        } else if (isRootTrash) {
            setSelectedIds(e.currentTarget.checked ? items.map((i) => i.id) : []);
        } else {
            setSelectedIds(e.currentTarget.checked ? subFiles.map((f) => f.name) : []);
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
        <ServerContentBlock title={'Trash'} showFlashKey={'files'}>
            <SpinnerOverlay visible={loading && !items.length && !subFiles.length && !!spinnerMessage} size={'large'} fixed>
                {spinnerMessage}
            </SpinnerOverlay>

            <Dialog.Confirm
                open={showEmptyConfirm}
                onClose={() => setShowEmptyConfirm(false)}
                title={'Empty Trash'}
                confirm={'Empty Trash'}
                onConfirmed={handleEmptyTrash}
            >
                Are you sure you want to permanently delete all items in the Trash? This action cannot be undone.
            </Dialog.Confirm>

            {/* Breadcrumb & Action Bar */}
            <div className={'flex items-center justify-between gap-3 mb-4'}>
                <div className={'flex items-center flex-1 min-w-0 overflow-hidden'}>
                    <FileActionCheckbox
                        type={'checkbox'}
                        className={'mx-4 shrink-0'}
                        checked={selectedIds.length === (currentTotalCount === 0 ? -1 : currentTotalCount)}
                        onChange={onSelectAllClick}
                    />

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
                                placeholder={'Search files and folders in trash...'}
                                autoFocus
                                className={'w-full max-w-md px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 rounded-xl focus:outline-none focus:border-rose-500 transition-colors shadow-inner'}
                            />
                        </div>
                    ) : (
                        <div
                            className={'flex items-center text-sm text-neutral-500 overflow-x-auto whitespace-nowrap py-1'}
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <span className={'shrink-0'}>/</span>
                            <span className={'px-1 text-neutral-300 shrink-0'}>home</span>
                            <span className={'shrink-0'}>/</span>
                            <NavLink to={`/server/${match.params.id}/files`} className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}>
                                container
                            </NavLink>
                            <span className={'shrink-0'}>/</span>
                            <NavLink to={`/server/${match.params.id}/files/trash`} className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}>
                                .trash
                            </NavLink>
                            {pathSegments.map((segment, idx) => {
                                const subLink = pathSegments.slice(0, idx + 1).join('/');
                                const isLast = idx === pathSegments.length - 1;
                                return (
                                    <React.Fragment key={idx}>
                                        <span className={'shrink-0'}>/</span>
                                        {isLast ? (
                                            <span className={'px-1 text-neutral-300 shrink-0'}>{getCleanTrashName(segment)}</span>
                                        ) : (
                                            <NavLink
                                                to={`/server/${match.params.id}/files/trash#/${encodePathSegments(subLink)}`}
                                                className={'px-1 text-neutral-200 no-underline hover:text-neutral-100 shrink-0'}
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

                {/* Right Action Buttons: Filter toggle on the left of red Trash button */}
                <div className={'flex items-center gap-2 pr-2 shrink-0'}>
                    <button
                        type={'button'}
                        onClick={() => {
                            setIsSearching((prev) => !prev);
                            setSearchQuery('');
                        }}
                        className={`p-2 rounded-xl transition-all focus:outline-none flex items-center justify-center shrink-0 ${
                            isSearching
                                ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                        title={isSearching ? 'Close Search' : 'Filter / Search Trash'}
                        aria-label={isSearching ? 'Close Search' : 'Filter / Search Trash'}
                    >
                        {isSearching ? <X size={16} /> : <Filter size={16} />}
                    </button>
                    {(items.length > 0 || subFiles.length > 0) && (
                        <button
                            type={'button'}
                            onClick={() => setShowEmptyConfirm(true)}
                            className={'p-2 rounded-xl text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm focus:outline-none flex items-center justify-center shrink-0'}
                            title={'Empty Trash'}
                            aria-label={'Empty Trash'}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content List */}
            {loading && !items.length && !subFiles.length ? (
                <Spinner size={'large'} centered />
            ) : isSearchActive ? (
                /* Deep Recursive Trash Search Results */
                !deepTrashResults.length ? (
                    <p css={tw`text-sm text-neutral-400 text-center py-8`}>
                        {isScanningTrash ? 'Searching inside trash folders...' : `No files or folders matched "${searchQuery}".`}
                    </p>
                ) : (
                    <div>
                        {deepTrashResults.map((result) => (
                            <div key={result.key} className={styles.file_row}>
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    className={'mx-4 shrink-0'}
                                    checked={selectedIds.includes(result.key)}
                                    onChange={() => toggleSelectItem(result.key)}
                                />
                                <NavLink
                                    className={styles.details}
                                    to={
                                        result.isFile
                                            ? `/server/${match.params.id}/files/edit#${encodePathSegments(join('/.trash', result.path))}`
                                            : `/server/${match.params.id}/files/trash#/${encodePathSegments(result.path)}`
                                    }
                                >
                                    <div css={tw`flex-none text-neutral-400 ml-2 mr-4 text-lg pl-3`}>
                                        <FontAwesomeIcon icon={result.isFile ? faFileAlt : faFolder} />
                                    </div>
                                    <div css={tw`flex-1 truncate`}>
                                        <span className={'text-neutral-200 font-medium hover:text-white'}>{result.name}</span>
                                    </div>
                                    {result.isFile && (
                                        <div css={tw`w-1/6 text-right mr-4 hidden sm:block text-neutral-400 text-xs`}>
                                            {bytesToString(result.size)}
                                        </div>
                                    )}
                                    <div css={tw`w-1/5 text-right mr-4 hidden md:block text-xs text-neutral-400`} title={format(new Date(result.deletedAt), 'dd MMM yyyy HH:mm')}>
                                        {formatDaysRemaining(result.deletedAt)}
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>
                )
            ) : isRootTrash ? (
                /* Root Trash Items */
                !items.length ? (
                    <p css={tw`text-sm text-neutral-400 text-center py-8`}>Trash is empty.</p>
                ) : (
                    <div>
                        {items.map((item) => (
                            <div key={item.id} className={styles.file_row}>
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    className={'mx-4 shrink-0'}
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
                !subFiles.length ? (
                    <p css={tw`text-sm text-neutral-400 text-center py-8`}>This trash folder is empty.</p>
                ) : (
                    <div>
                        {subFiles.map((file) => (
                            <div key={file.key} className={styles.file_row}>
                                <FileActionCheckbox
                                    type={'checkbox'}
                                    className={'mx-4 shrink-0'}
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
