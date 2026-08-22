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
import Portal from '@/components/elements/Portal';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

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
        setLoadingMessage('Memindahkan ke Recycle Bin...');

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
        setShowConfirm(false);
        clearFlashes('files');
        setLoadingMessage('Deleting files permanently...');

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
                <Dialog.Confirm
                    title={'Hapus File Permanen'}
                    open={showConfirm}
                    confirm={'Hapus Permanen'}
                    onClose={() => setShowConfirm(false)}
                    onConfirmed={onClickConfirmDeletion}
                >
                    <p className={'mb-2'}>
                        Apakah Anda yakin ingin menghapus&nbsp;
                        <span className={'font-semibold text-gray-50'}>{selectedFiles.length} file</span> secara permanen?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <ul className={'list-disc pl-5 text-sm text-neutral-300 max-h-40 overflow-y-auto'}>
                        {selectedFiles.slice(0, 15).map((file) => (
                            <li key={file}>{file}</li>
                        ))}
                        {selectedFiles.length > 15 && <li>dan {selectedFiles.length - 15} file lainnya</li>}
                    </ul>
                </Dialog.Confirm>
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
                            <div css={tw`flex items-center space-x-3 pointer-events-auto rounded-lg p-3 bg-neutral-900/95 border border-neutral-700 shadow-xl backdrop-blur-sm`}>
                                <Button onClick={() => setShowMove(true)}>Move</Button>
                                <Button onClick={onClickCompress}>Archive</Button>
                                <Button
                                    onClick={onClickMoveToTrash}
                                    className={'bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5'}
                                    title={'Pindahkan ke Recycle Bin (Aman, dapat dipulihkan dalam 7 hari)'}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} className={'text-xs'} />
                                    Move to Trash
                                </Button>
                                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setShowConfirm(true)}>
                                    Delete Permanently
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
