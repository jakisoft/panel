import { Filter, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
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
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import style from './style.module.css';

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
    const history = useHistory();
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (directory.startsWith('/.trash')) {
            history.replace(`/server/${id}/files/trash`);
        }
    }, [directory, id]);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
        setIsSearching(false);
        setSearchQuery('');
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const visibleFiles = files ? sortFiles(files) : [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const displayedFiles = normalizedQuery
        ? visibleFiles.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
        : visibleFiles;

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? displayedFiles.map((file) => file.name) : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                <div className={'flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 mb-4'}>
                    <div className={'flex items-center flex-1 min-w-0 overflow-hidden'}>
                        <FileActionCheckbox
                            type={'checkbox'}
                            css={tw`mx-4 shrink-0`}
                            checked={selectedFilesLength === (displayedFiles.length === 0 ? -1 : displayedFiles.length)}
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
                                    placeholder={'Search files and folders in this directory...'}
                                    autoFocus
                                    className={'w-full max-w-md px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors shadow-inner'}
                                />
                            </div>
                        ) : (
                            <FileManagerBreadcrumbs />
                        )}
                    </div>

                    <Can action={'file.create'}>
                        <div className={'w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2 md:flex-nowrap md:shrink-0'}>
                            <FileManagerStatus />
                            <NewDirectoryButton className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0'} />
                            <div className={'grid grid-cols-2 md:flex md:items-center md:flex-nowrap gap-2 w-full md:w-auto shrink-0'}>
                                <UploadButton className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0'} />
                                <NavLink to={`/server/${id}/files/new${window.location.hash}`} className={'w-full md:w-auto shrink-0'}>
                                    <Button className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap'}>New File</Button>
                                </NavLink>
                                <button
                                    type={'button'}
                                    onClick={() => {
                                        setIsSearching((prev) => !prev);
                                        setSearchQuery('');
                                    }}
                                    className={`p-2 rounded-lg transition-all focus:outline-none flex items-center justify-center shrink-0 ${
                                        isSearching
                                            ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }`}
                                    title={isSearching ? 'Close Search' : 'Filter / Search Files'}
                                    aria-label={isSearching ? 'Close Search' : 'Filter / Search Files'}
                                >
                                    {isSearching ? <X size={16} /> : <Filter size={16} />}
                                </button>
                                <RecycleBinButton className={'w-full md:w-auto !py-2 !px-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0'} />
                            </div>
                        </div>
                    </Can>
                </div>
            </ErrorBoundary>
            {!files ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    {!displayedFiles.length ? (
                        <p css={tw`text-sm text-neutral-400 text-center py-8`}>
                            {searchQuery.trim()
                                ? `No files or folders matched "${searchQuery}".`
                                : 'This directory seems to be empty.'}
                        </p>
                    ) : (
                        <CSSTransition classNames={'fade'} timeout={150} appear in>
                            <div>
                                {displayedFiles.length > 250 && (
                                    <div css={tw`rounded bg-yellow-400 mb-px p-3`}>
                                        <p css={tw`text-yellow-900 text-sm text-center`}>
                                            This directory is too large to display in the browser, limiting the output
                                            to the first 250 files.
                                        </p>
                                    </div>
                                )}
                                {displayedFiles.slice(0, 250).map((file) => (
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
