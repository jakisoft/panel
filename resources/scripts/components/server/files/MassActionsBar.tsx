import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import Fade from '@/components/elements/Fade';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';
import compressFiles from '@/api/server/files/compressFiles';
import { ServerContext } from '@/state/server';
import deleteFiles from '@/api/server/files/deleteFiles';
import { moveToTrash } from '@/api/server/files/recycleBin';
import RenameFileModal from '@/components/server/files/RenameFileModal';
import DeleteConfirmationModal from '@/components/server/files/DeleteConfirmationModal';
import Portal from '@/components/elements/Portal';
import { Trash2, Archive, FolderInput } from 'lucide-react';

const MassActionsBar = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMove, setShowMove] = useState(false);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const selectedFiles = ServerContext.useStoreState((state) => state.files.selectedFiles);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    useEffect(() => {
        if (!loading) setLoadingMessage('');
    }, [loading]);

    const onClickCompress = () => {
        setLoading(true);
        clearFlashes('files');
        setLoadingMessage('Archiving files...');

        compressFiles(uuid, directory, selectedFiles)
            .then(() => mutate())
            .then(() => setSelectedFiles([]))
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setLoading(false));
    };

    const onClickMoveToTrash = () => {
        setLoading(true);
        clearFlashes('files');
        setLoadingMessage('Memindahkan ke Tong Sampah...');

        const filesToTrash = selectedFiles.map((name) => ({
            name,
            isFile: true,
            size: 0,
        }));

        moveToTrash(uuid, directory, filesToTrash)
            .then(() => {
                mutate((files) => files.filter((f) => selectedFiles.indexOf(f.name) < 0), false);
                setSelectedFiles([]);
            })
            .catch((error) => {
                mutate();
                clearAndAddHttpError({ key: 'files', error });
            })
            .finally(() => setLoading(false));
    };

    const onClickConfirmDeletion = () => {
        setLoading(true);
        clearFlashes('files');
        setLoadingMessage('Menghapus file secara permanen...');

        deleteFiles(uuid, directory, selectedFiles)
            .then(() => {
                mutate((files) => files.filter((f) => selectedFiles.indexOf(f.name) < 0), false);
                setSelectedFiles([]);
            })
            .catch((error) => {
                mutate();
                clearAndAddHttpError({ key: 'files', error });
            })
            .then(() => setLoading(false));
    };

    return (
        <>
            <div css={tw`pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center`}>
                <SpinnerOverlay visible={loading} size={'large'} fixed>
                    {loadingMessage}
                </SpinnerOverlay>
                <DeleteConfirmationModal
                    visible={showConfirm}
                    onDismissed={() => setShowConfirm(false)}
                    files={selectedFiles}
                    onMoveToTrash={onClickMoveToTrash}
                    onDeletePermanently={onClickConfirmDeletion}
                />
                {showMove && (
                    <RenameFileModal
                        files={selectedFiles}
                        visible
                        appear
                        useMoveTerminology
                        onDismissed={() => setShowMove(false)}
                    />
                )}
                <Portal>
                    <div className={'pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50'}>
                        <Fade timeout={75} in={selectedFiles.length > 0} unmountOnExit>
                            <div className={'flex items-center gap-2 pointer-events-auto rounded-xl p-2 bg-neutral-900/95 border border-neutral-700 shadow-2xl backdrop-blur-md'}>
                                <Button
                                    onClick={() => setShowMove(true)}
                                    className={'!py-2 !px-3 text-xs flex items-center gap-1.5'}
                                >
                                    <FolderInput size={14} />
                                    Move
                                </Button>
                                <Button
                                    onClick={onClickCompress}
                                    className={'!py-2 !px-3 text-xs flex items-center gap-1.5'}
                                >
                                    <Archive size={14} />
                                    Archive
                                </Button>
                                <Button.Danger
                                    onClick={() => setShowConfirm(true)}
                                    className={'!py-2 !px-3 text-xs flex items-center gap-1.5'}
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </Button.Danger>
                            </div>
                        </Fade>
                    </div>
                </Portal>
            </div>
        </>
    );
};

export default MassActionsBar;
