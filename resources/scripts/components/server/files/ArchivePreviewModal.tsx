import React, { useEffect, useState } from 'react';
import Modal from '@/components/elements/Modal';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import { ServerContext } from '@/state/server';
import getFileDownloadUrl from '@/api/server/files/getFileDownloadUrl';
import { join } from 'pathe';
import { bytesToString } from '@/lib/formatters';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArchive, faFolder, faFile, faSearch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/elements/Input';
import JSZip from 'jszip';
import decompressFiles from '@/api/server/files/decompressFiles';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';

interface Props {
    visible: boolean;
    fileName: string;
    onDismissed: () => void;
}

interface ArchiveEntry {
    name: string;
    dir: boolean;
    size: number;
    date: Date;
}

export default ({ visible, fileName, onDismissed }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { mutate } = useFileManagerSwr();
    const { clearAndAddHttpError, addFlash } = useFlash();

    const [loading, setLoading] = useState(true);
    const [extracting, setExtracting] = useState(false);
    const [entries, setEntries] = useState<ArchiveEntry[]>([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) {
            setEntries([]);
            setError(null);
            setSearch('');
            return;
        }

        setLoading(true);
        setError(null);

        getFileDownloadUrl(uuid, join(directory, fileName))
            .then((url) => fetch(url))
            .then((res) => {
                if (!res.ok) throw new Error('Gagal mengunduh file archive.');
                return res.arrayBuffer();
            })
            .then((buffer) => JSZip.loadAsync(buffer))
            .then((zip) => {
                const list: ArchiveEntry[] = [];
                zip.forEach((relativePath, file) => {
                    list.push({
                        name: relativePath,
                        dir: file.dir,
                        // @ts-expect-error _data is present in JSZip internal objects
                        size: file._data?.uncompressedSize || 0,
                        date: file.date,
                    });
                });
                setEntries(list);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Tidak dapat membaca isi archive. Pastikan file berformat ZIP yang valid.');
                setLoading(false);
            });
    }, [visible, fileName]);

    const handleExtract = () => {
        setExtracting(true);
        decompressFiles(uuid, directory, fileName)
            .then(() => {
                setExtracting(false);
                mutate();
                addFlash({
                    key: 'files',
                    type: 'success',
                    message: `Archive ${fileName} berhasil diekstrak.`,
                });
                onDismissed();
            })
            .catch((err) => {
                setExtracting(false);
                clearAndAddHttpError({ key: 'files', error: err });
                onDismissed();
            });
    };

    const filtered = entries.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Modal visible={visible} onDismissed={onDismissed} showSpinnerOverlay={extracting}>
            <div css={tw`flex items-center justify-between mb-4`}>
                <h3 css={tw`text-2xl text-neutral-100 flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faFileArchive} css={tw`text-yellow-500`} />
                    <span>Isi Archive: {fileName}</span>
                </h3>
            </div>

            {loading ? (
                <div css={tw`py-12 flex flex-col items-center justify-center`}>
                    <Spinner size={'large'} />
                    <p css={tw`text-neutral-400 text-sm mt-4`}>Membaca daftar file di dalam archive...</p>
                </div>
            ) : error ? (
                <div css={tw`py-8 text-center text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4`}>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    <div css={tw`flex items-center gap-4 mb-4`}>
                        <div css={tw`relative flex-1`}>
                            <Input
                                placeholder={'Cari file di dalam archive...'}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div css={tw`text-xs text-neutral-400 whitespace-nowrap`}>
                            Total: {entries.length} item ({bytesToString(entries.reduce((acc, cur) => acc + cur.size, 0))})
                        </div>
                    </div>

                    <div css={tw`max-h-80 overflow-y-auto border border-neutral-700 rounded-lg bg-neutral-900`}>
                        {filtered.length === 0 ? (
                            <p css={tw`text-neutral-500 text-center py-6 text-sm`}>Tidak ada file yang cocok.</p>
                        ) : (
                            <table css={tw`w-full text-left text-sm`}>
                                <thead css={tw`bg-neutral-800 text-neutral-400 text-xs uppercase sticky top-0`}>
                                    <tr>
                                        <th css={tw`py-2 px-3`}>Nama File / Folder</th>
                                        <th css={tw`py-2 px-3 text-right`}>Ukuran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            css={tw`border-t border-neutral-800 hover:bg-neutral-800/50 transition-colors`}
                                        >
                                            <td css={tw`py-2 px-3 flex items-center gap-2 truncate text-neutral-200`}>
                                                <FontAwesomeIcon
                                                    icon={item.dir ? faFolder : faFile}
                                                    css={item.dir ? tw`text-yellow-500` : tw`text-neutral-400`}
                                                />
                                                <span css={tw`truncate`}>{item.name}</span>
                                            </td>
                                            <td css={tw`py-2 px-3 text-right text-neutral-400 text-xs`}>
                                                {item.dir ? '-' : bytesToString(item.size)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            <div css={tw`mt-6 flex justify-between items-center`}>
                <Button isSecondary onClick={onDismissed}>
                    Tutup
                </Button>
                {!loading && !error && (
                    <Button onClick={handleExtract} disabled={extracting}>
                        <FontAwesomeIcon icon={faBoxOpen} css={tw`mr-2`} /> Ekstrak Sekarang
                    </Button>
                )}
            </div>
        </Modal>
    );
};
