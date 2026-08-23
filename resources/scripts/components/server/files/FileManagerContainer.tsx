import { Filter, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import loadDirectory, { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import RecycleBinButton from '@/components/server/files/RecycleBinButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import SelectFileCheckbox, { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { encodePathSegments, hashToPath } from '@/helpers';
import { join } from 'pathe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileArchive, faFileImport, faFolder } from '@fortawesome/free-solid-svg-icons';
import { bytesToString } from '@/lib/formatters';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import styles from './style.module.css';

interface DeepSearchResult {
    key: string;
    name: string;
    directory: string;
    relativePath: string;
    isFile: boolean;
    size: number;
    modifiedAt: Date;
    fileObject: FileObject;
}

const sortFiles = (files: FileObject[]): FileObject[] => {
    const filteredFiles = files.filter((file) => file.name !== '.trash' && file.name !== '.recycle_bin');
    return filteredFiles.sort((a, b) => {
        if (a.isFile === b.isFile) {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.isFile ? 1 : -1;
    });
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const history = useHistory();
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFiles = ServerContext.useStoreState((state) => state.files.selectedFiles);
    const selectedFilesLength = selectedFiles.length;

    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deepResults, setDeepResults] = useState<DeepSearchResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const searchAbortRef = useRef(0);

    useEffect(() => {
        const currentPath = hashToPath(hash);
        if (currentPath.startsWith('/.trash')) {
            history.replace(`/server/${id}/files/trash`);
            return;
        }
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(currentPath);
        setIsSearching(false);
        setSearchQuery('');
        setDeepResults([]);
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    // Recursive search across folders when searching
    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!isSearching || !query || !files) {
            setDeepResults([]);
            setIsScanning(false);
            return;
        }

        const searchId = ++searchAbortRef.current;
        setIsScanning(true);

        // Immediate direct matches
        const directList = sortFiles(files);
        const directMatches: DeepSearchResult[] = [];
        const subfolderQueue: string[] = [];

        for (const f of directList) {
            if (f.name.toLowerCase().includes(query)) {
                directMatches.push({
                    key: f.key,
                    name: f.name,
                    directory,
                    relativePath: f.name,
                    isFile: f.isFile,
                    size: f.size,
                    modifiedAt: f.modifiedAt,
                    fileObject: f,
                });
            }
            if (!f.isFile && f.name !== '.trash' && f.name !== '.recycle_bin') {
                subfolderQueue.push(join(directory, f.name));
            }
        }

        setDeepResults(directMatches);

        // Async BFS recursive scanner for subfolders
        const scanSubfolders = async () => {
            const results = [...directMatches];
            const maxDirs = 35;
            let dirsScanned = 0;

            while (subfolderQueue.length > 0 && dirsScanned < maxDirs) {
                if (searchAbortRef.current !== searchId) return;

                const currentDir = subfolderQueue.shift()!;
                dirsScanned++;

                try {
                    const subItems = await loadDirectory(uuid, currentDir);
                    for (const item of subItems) {
                        if (item.name === '.trash' || item.name === '.recycle_bin') continue;

                        const cleanSub = currentDir.replace(new RegExp(`^${directory}/?`), '');
                        const relPath = cleanSub ? `${cleanSub}/${item.name}` : item.name;

                        if (item.name.toLowerCase().includes(query) || relPath.toLowerCase().includes(query)) {
                            results.push({
                                key: item.key,
                                name: item.name,
                                directory: currentDir,
                                relativePath: relPath,
                                isFile: item.isFile,
                                size: item.size,
                                modifiedAt: item.modifiedAt,
                                fileObject: item,
                            });
                        }

                        if (!item.isFile && subfolderQueue.length < maxDirs) {
                            subfolderQueue.push(join(currentDir, item.name));
                        }
                    }
                } catch {
                    // Ignore folder read error
                }

                if (searchAbortRef.current === searchId) {
                    setDeepResults([...results]);
                }
            }

            if (searchAbortRef.current === searchId) {
                setIsScanning(false);
            }
        };

        const timeout = setTimeout(() => {
            scanSubfolders();
        }, 150);

        return () => {
            clearTimeout(timeout);
            searchAbortRef.current++;
        };
    }, [searchQuery, isSearching, files, directory, uuid]);

    const visibleDirectFiles = files ? sortFiles(files) : [];
    const isSearchActive = isSearching && searchQuery.trim().length > 0;
    const displayedCount = isSearchActive ? deepResults.length : visibleDirectFiles.length;

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isSearchActive) {
            setSelectedFiles(e.currentTarget.checked ? deepResults.map((r) => r.name) : []);
        } else {
            setSelectedFiles(e.currentTarget.checked ? visibleDirectFiles.map((file) => file.name) : []);
        }
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                <div className={'flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 mb-4'}>
                    {/* Left: Checkbox + Filter Button + Breadcrumbs / Search Bar */}
                    <div className={'flex items-center flex-1 min-w-0 mr-3 overflow-hidden'}>
                        <FileActionCheckbox
                            type={'checkbox'}
                            className={'mx-4 shrink-0'}
                            checked={selectedFilesLength === (displayedCount === 0 ? -1 : displayedCount)}
                            onChange={onSelectAllClick}
                        />
                        <button
                            type={'button'}
                            onClick={() => {
                                setIsSearching((prev) => !prev);
                                setSearchQuery('');
                                setDeepResults([]);
                            }}
                            className={'p-1.5 mr-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none shrink-0'}
                            title={isSearching ? 'Close Search' : 'Filter / Search Files & Folders'}
                            aria-label={isSearching ? 'Close Search' : 'Filter / Search Files & Folders'}
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
                                            setDeepResults([]);
                                        }
                                    }}
                                    placeholder={'Search files and folders recursively...'}
                                    autoFocus
                                    className={'w-full max-w-md px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors shadow-inner'}
                                />
                            </div>
                        ) : (
                            <FileManagerBreadcrumbs />
                        )}
                    </div>

                    {/* Right: Original Clean Action Buttons */}
                    <Can action={'file.create'}>
                        <div className={'w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2 md:flex-nowrap md:shrink-0'}>
                            <FileManagerStatus />
                            <NewDirectoryButton className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0'} />
                            <div className={'grid grid-cols-2 md:flex md:items-center md:flex-nowrap gap-2 w-full md:w-auto shrink-0'}>
                                <UploadButton className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0'} />
                                <NavLink to={`/server/${id}/files/new${window.location.hash}`} className={'w-full md:w-auto shrink-0'}>
                                    <Button className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap'}>New File</Button>
                                </NavLink>
                                <RecycleBinButton className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0'} />
                            </div>
                        </div>
                    </Can>
                </div>
            </ErrorBoundary>

            {!files ? (
                <Spinner size={'large'} centered />
            ) : isSearchActive ? (
                /* Deep Recursive Search Results */
                isScanning && !deepResults.length ? (
                    <Spinner size={'large'} centered />
                ) : !deepResults.length ? (
                    <p css={tw`text-sm text-neutral-400 text-center py-8`}>
                        {`No files or folders matched "${searchQuery}".`}
                    </p>
                ) : (
                    <div>
                        {deepResults.map((result) => {
                            const isDeep = result.directory !== directory;
                            return (
                                <div
                                    key={result.key}
                                    className={styles.file_row}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        window.dispatchEvent(
                                            new CustomEvent(`pterodactyl:files:ctx:${result.fileObject.key}`, { detail: e.clientX })
                                        );
                                    }}
                                >
                                    <SelectFileCheckbox name={result.name} />
                                    <NavLink
                                        className={styles.details}
                                        to={
                                            result.isFile
                                                ? `/server/${id}/files/edit#${encodePathSegments(join(result.directory, result.name))}`
                                                : `/server/${id}/files#${encodePathSegments(join(result.directory, result.name))}`
                                        }
                                    >
                                        <div css={tw`flex-none text-neutral-400 ml-6 mr-4 text-lg pl-3`}>
                                            <FontAwesomeIcon
                                                icon={
                                                    result.isFile
                                                        ? result.fileObject.isSymlink
                                                            ? faFileImport
                                                            : result.fileObject.isArchiveType()
                                                            ? faFileArchive
                                                            : faFileAlt
                                                        : faFolder
                                                }
                                            />
                                        </div>
                                        <div css={tw`flex-1 truncate`}>
                                            <span className={'text-neutral-200 font-medium hover:text-white'}>{result.name}</span>
                                            {isDeep && (
                                                <span className={'text-xs text-neutral-500 font-mono ml-2.5 hidden sm:inline'}>
                                                    in {result.directory.replace(/^\//, '')}
                                                </span>
                                            )}
                                        </div>
                                        {result.isFile && (
                                            <div css={tw`w-1/6 text-right mr-4 hidden sm:block text-neutral-400 text-xs`}>
                                                {bytesToString(result.size)}
                                            </div>
                                        )}
                                        <div css={tw`w-1/5 text-right mr-4 hidden md:block text-xs text-neutral-400`}>
                                            {Math.abs(differenceInHours(result.modifiedAt, new Date())) > 48
                                                ? format(result.modifiedAt, 'MMM do, yyyy h:mma')
                                                : formatDistanceToNow(result.modifiedAt, { addSuffix: true })}
                                        </div>
                                    </NavLink>
                                    <FileDropdownMenu file={result.fileObject} />
                                </div>
                            );
                        })}
                        <MassActionsBar />
                    </div>
                )
            ) : (
                /* Regular Directory View */
                <>
                    {!visibleDirectFiles.length ? (
                        <p css={tw`text-sm text-neutral-400 text-center py-8`}>This directory seems to be empty.</p>
                    ) : (
                        <CSSTransition classNames={'fade'} timeout={150} appear in>
                            <div>
                                {visibleDirectFiles.length > 250 && (
                                    <div css={tw`rounded bg-yellow-400 mb-px p-3`}>
                                        <p css={tw`text-yellow-900 text-sm text-center`}>
                                            This directory is too large to display in the browser, limiting the output
                                             to the first 250 files.
                                        </p>
                                    </div>
                                )}
                                {visibleDirectFiles.slice(0, 250).map((file) => (
                                    <FileObjectRow key={file.key} file={file} />
                                ))}
                                <MassActionsBar />
                            </div>
                        </CSSTransition>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};
