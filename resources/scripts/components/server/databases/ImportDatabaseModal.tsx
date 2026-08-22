import React, { useState, useRef } from 'react';
import Modal from '@/components/elements/Modal';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import importDatabase from '@/api/server/databases/importDatabase';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faUpload } from '@fortawesome/free-solid-svg-icons';

interface Props {
    visible: boolean;
    database: ServerDatabase;
    onDismissed: () => void;
}

export default ({ visible, database, onDismissed }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes, addFlash } = useFlash();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!selectedFile) return;

        clearFlashes();
        setIsSubmitting(true);

        importDatabase(uuid, database.id, selectedFile)
            .then((res) => {
                setIsSubmitting(false);
                addFlash({
                    key: 'databases',
                    type: 'success',
                    message: res.message || 'Database berhasil diimport!',
                });
                onDismissed();
            })
            .catch((error) => {
                console.error(error);
                setIsSubmitting(false);
                addError({
                    key: 'database:import',
                    message: httpErrorToHuman(error),
                });
            });
    };

    return (
        <Modal
            visible={visible}
            dismissable={!isSubmitting}
            showSpinnerOverlay={isSubmitting}
            onDismissed={() => {
                setSelectedFile(null);
                onDismissed();
            }}
        >
            <FlashMessageRender byKey={'database:import'} css={tw`mb-6`} />
            <h3 css={tw`text-2xl mb-4 text-neutral-100 flex items-center gap-2`}>
                <FontAwesomeIcon icon={faFileImport} css={tw`text-cyan-500`} /> Import SQL ke {database.name}
            </h3>
            <p css={tw`text-sm text-neutral-300 mb-6`}>
                Pilih file SQL (<code>.sql</code> atau <code>.sql.gz</code>) untuk dieksekusi ke database{' '}
                <strong css={tw`text-neutral-100`}>{database.name}</strong>.
            </p>

            <div
                css={tw`border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500 transition-colors`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type={'file'}
                    accept={'.sql,.gz'}
                    css={tw`hidden`}
                    onChange={onFileChange}
                />
                <FontAwesomeIcon icon={faUpload} css={tw`text-3xl text-neutral-400 mb-2`} />
                {selectedFile ? (
                    <div>
                        <p css={tw`text-cyan-400 font-semibold`}>{selectedFile.name}</p>
                        <p css={tw`text-xs text-neutral-400 mt-1`}>
                            Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                ) : (
                    <div>
                        <p css={tw`text-neutral-200 font-medium`}>Klik untuk memilih file SQL</p>
                        <p css={tw`text-xs text-neutral-400 mt-1`}>Mendukung format .sql dan .sql.gz (Maks. 50 MB)</p>
                    </div>
                )}
            </div>

            <div css={tw`mt-6 flex justify-end gap-2`}>
                <Button isSecondary onClick={onDismissed} disabled={isSubmitting}>
                    Batal
                </Button>
                <Button onClick={handleImport} disabled={!selectedFile || isSubmitting}>
                    Import Database
                </Button>
            </div>
        </Modal>
    );
};
