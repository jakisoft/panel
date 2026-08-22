import axios, { AxiosProgressEvent } from 'axios';
import getFileUploadUrl from '@/api/server/files/getFileUploadUrl';
import createDirectory from '@/api/server/files/createDirectory';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import React, { useEffect, useRef, useState } from 'react';
import { ModalMask } from '@/components/elements/Modal';
import Fade from '@/components/elements/Fade';
import useEventListener from '@/plugins/useEventListener';
import { useFlashKey } from '@/plugins/useFlash';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { ServerContext } from '@/state/server';
import { WithClassname } from '@/components/types';
import Portal from '@/components/elements/Portal';
import { CloudUploadIcon, FolderAddIcon } from '@heroicons/react/outline';
import { useSignal } from '@preact/signals-react';
import { join } from 'pathe';

interface UploadItem {
    file: File;
    relativePath?: string;
}

function isFileOrDirectory(event: DragEvent): boolean {
    if (!event.dataTransfer?.types) {
        return false;
    }

    return event.dataTransfer.types.some((value) => value.toLowerCase() === 'files');
}

async function scanFileSystemEntry(entry: any, path = ''): Promise<UploadItem[]> {
    if (!entry) return [];
    if (entry.isFile) {
        return new Promise((resolve) => {
            entry.file((file: File) => {
                resolve([{ file, relativePath: path ? `${path}/${file.name}` : file.name }]);
            });
        });
    } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readEntries = async (): Promise<any[]> => {
            return new Promise((resolve) => {
                dirReader.readEntries((entries: any[]) => resolve(entries));
            });
        };

        const allEntries: any[] = [];
        let batch = await readEntries();
        while (batch.length > 0) {
            allEntries.push(...batch);
            batch = await readEntries();
        }

        const currentPath = path ? `${path}/${entry.name}` : entry.name;
        const subResults = await Promise.all(
            allEntries.map((subEntry) => scanFileSystemEntry(subEntry, currentPath))
        );
        return subResults.flat();
    }
    return [];
}

export default ({ className }: WithClassname) => {
    const fileUploadInput = useRef<HTMLInputElement>(null);
    const folderUploadInput = useRef<HTMLInputElement>(null);

    const visible = useSignal(false);
    const timeouts = useSignal<NodeJS.Timeout[]>([]);

    const { mutate } = useFileManagerSwr();
    const { addError, clearAndAddHttpError } = useFlashKey('files');

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { clearFileUploads, removeFileUpload, pushFileUpload, setUploadProgress } = ServerContext.useStoreActions(
        (actions) => actions.files
    );

    useEventListener(
        'dragenter',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFileOrDirectory(e)) {
                visible.value = true;
            }
        },
        { capture: true }
    );

    useEventListener('dragexit', () => (visible.value = false), { capture: true });
    useEventListener('keydown', () => (visible.value = false));

    useEffect(() => {
        return () => timeouts.value.forEach(clearTimeout);
    }, []);

    const onUploadProgress = (data: AxiosProgressEvent, name: string) => {
        setUploadProgress({ name, loaded: data.loaded });
    };

    const handleUploadItems = async (items: UploadItem[]) => {
        clearAndAddHttpError();
        if (!items.length) return;

        // Collect all distinct folder paths that need creation
        const dirsToCreate = new Set<string>();
        for (const item of items) {
            if (item.relativePath && item.relativePath.includes('/')) {
                const segments = item.relativePath.split('/');
                segments.pop(); // remove file name
                let cur = '';
                for (const seg of segments) {
                    cur = cur ? `${cur}/${seg}` : seg;
                    dirsToCreate.add(cur);
                }
            }
        }

        // Sort by folder depth so parent is created before child
        const sortedDirs = Array.from(dirsToCreate).sort((a, b) => a.split('/').length - b.split('/').length);
        for (const dirPath of sortedDirs) {
            const parts = dirPath.split('/');
            const name = parts.pop()!;
            const parent = parts.join('/');
            const root = parent ? join(directory, parent) : directory;
            try {
                await createDirectory(uuid, root, name);
            } catch {
                // Ignore if directory already exists
            }
        }

        const uploads = items.map(({ file, relativePath }) => {
            const controller = new AbortController();
            const displayName = relativePath || file.name;
            pushFileUpload({
                name: displayName,
                data: { abort: controller, loaded: 0, total: file.size },
            });

            const targetDir = relativePath && relativePath.includes('/')
                ? join(directory, relativePath.substring(0, relativePath.lastIndexOf('/')))
                : directory;

            return () =>
                getFileUploadUrl(uuid).then((url) =>
                    axios
                        .post(
                            url,
                            { files: file },
                            {
                                signal: controller.signal,
                                headers: { 'Content-Type': 'multipart/form-data' },
                                params: { directory: targetDir },
                                onUploadProgress: (data) => onUploadProgress(data, displayName),
                            }
                        )
                        .then(() => timeouts.value.push(setTimeout(() => removeFileUpload(displayName), 500)))
                );
        });

        Promise.all(uploads.map((fn) => fn()))
            .then(() => mutate())
            .catch((error) => {
                clearFileUploads();
                clearAndAddHttpError(error);
            });
    };

    const onFileSubmission = (files: FileList) => {
        const list = Array.from(files).map((file) => ({
            file,
            relativePath: file.webkitRelativePath || undefined,
        }));
        handleUploadItems(list);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        visible.value = false;

        if (!e.dataTransfer?.items?.length) {
            if (e.dataTransfer?.files?.length) {
                onFileSubmission(e.dataTransfer.files);
            }
            return;
        }

        const items = Array.from(e.dataTransfer.items);
        const entries = items.map((item) => (item.webkitGetAsEntry ? item.webkitGetAsEntry() : null));

        const uploadItems: UploadItem[] = [];
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry) {
                const scanned = await scanFileSystemEntry(entry);
                uploadItems.push(...scanned);
            } else if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) uploadItems.push({ file });
            }
        }

        if (uploadItems.length > 0) {
            handleUploadItems(uploadItems);
        }
    };

    return (
        <>
            <Portal>
                <Fade appear in={visible.value} timeout={75} key={'upload_modal_mask'} unmountOnExit>
                    <ModalMask
                        onClick={() => (visible.value = false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className={'w-full flex items-center justify-center pointer-events-none'}>
                            <div
                                className={
                                    'flex items-center space-x-4 bg-black w-full ring-4 ring-blue-200 ring-opacity-60 rounded p-6 mx-10 max-w-sm'
                                }
                            >
                                <CloudUploadIcon className={'w-10 h-10 flex-shrink-0'} />
                                <p className={'font-header flex-1 text-lg text-neutral-100 text-center'}>
                                    Drag and drop files or folders to upload.
                                </p>
                            </div>
                        </div>
                    </ModalMask>
                </Fade>
            </Portal>

            {/* Hidden file input */}
            <input
                type={'file'}
                ref={fileUploadInput}
                css={tw`hidden`}
                onChange={(e) => {
                    if (!e.currentTarget.files) return;
                    onFileSubmission(e.currentTarget.files);
                    if (fileUploadInput.current) {
                        fileUploadInput.current.files = null;
                    }
                }}
                multiple
            />

            {/* Hidden folder input */}
            <input
                type={'file'}
                ref={folderUploadInput}
                css={tw`hidden`}
                onChange={(e) => {
                    if (!e.currentTarget.files) return;
                    onFileSubmission(e.currentTarget.files);
                    if (folderUploadInput.current) {
                        folderUploadInput.current.files = null;
                    }
                }}
                {...{ webkitdirectory: '', directory: '' }}
                multiple
            />

            <div className={'flex items-center space-x-2'}>
                <Button
                    className={className}
                    onClick={() => fileUploadInput.current && fileUploadInput.current.click()}
                >
                    Upload File
                </Button>
                <Button
                    variant={Button.Variants.Secondary}
                    className={className}
                    onClick={() => folderUploadInput.current && folderUploadInput.current.click()}
                    title={'Upload Folder'}
                >
                    <FolderAddIcon className={'w-4 h-4 mr-1 inline-block'} />
                    Upload Folder
                </Button>
            </div>
        </>
    );
};
