import React, { useEffect } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
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
    const sortedFiles: FileObject[] = filteredFiles
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const visibleFiles = files ? sortFiles(files) : [];
        setSelectedFiles(e.currentTarget.checked ? visibleFiles.map((file) => file.name) : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                <div className={'flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 mb-4'}>
                    <FileManagerBreadcrumbs
                        renderLeft={
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-4`}
                                checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                onChange={onSelectAllClick}
                            />
                        }
                    />
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
            ) : (
                <>
                    {!files.length ? (
                        <p css={tw`text-sm text-neutral-400 text-center`}>This directory seems to be empty.</p>
                    ) : (
                        <CSSTransition classNames={'fade'} timeout={150} appear in>
                            <div>
                                {files.length > 250 && (
                                    <div css={tw`rounded bg-yellow-400 mb-px p-3`}>
                                        <p css={tw`text-yellow-900 text-sm text-center`}>
                                            This directory is too large to display in the browser, limiting the output
                                            to the first 250 files.
                                        </p>
                                    </div>
                                )}
                                {sortFiles(files.slice(0, 250)).map((file) => (
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
