import React from 'react';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import { Trash2 } from 'lucide-react';

interface Props {
    visible: boolean;
    onDismissed: () => void;
    files: string[];
    onMoveToTrash: () => void;
    onDeletePermanently: () => void;
}

export default ({ visible, onDismissed, files, onMoveToTrash, onDeletePermanently }: Props) => {
    return (
        <Dialog
            open={visible}
            onClose={onDismissed}
            title={'Konfirmasi Hapus'}
        >
            <div className={'py-2'}>
                <p className={'text-sm text-neutral-300'}>
                    {files.length === 1 ? (
                        <>
                            Apakah Anda ingin memindahkan <span className={'font-mono text-neutral-100 font-semibold'}>{files[0]}</span> ke Tong Sampah atau menghapus secara permanen?
                        </>
                    ) : (
                        <>
                            Apakah Anda ingin memindahkan file terpilih ke Tong Sampah atau menghapus secara permanen?
                        </>
                    )}
                </p>
            </div>
            <Dialog.Footer>
                <div className={'w-full flex items-center justify-between'}>
                    <Button.Text onClick={onDismissed} className={'!py-2 !px-3 text-xs sm:text-sm'}>
                        Batal
                    </Button.Text>
                    <div className={'flex items-center gap-2'}>
                        <Button
                            variant={Button.Variants.Secondary}
                            onClick={() => {
                                onDismissed();
                                onMoveToTrash();
                            }}
                            className={'!bg-amber-600/20 hover:!bg-amber-600/30 !text-amber-300 border border-amber-500/40 text-xs sm:text-sm !py-2 !px-3'}
                            title={'Pindahkan ke Tong Sampah'}
                        >
                            <Trash2 size={14} className={'mr-1.5 inline'} />
                            Ke Sampah
                        </Button>
                        <Button.Danger
                            onClick={() => {
                                onDismissed();
                                onDeletePermanently();
                            }}
                            className={'text-xs sm:text-sm !py-2 !px-3'}
                            title={'Hapus Permanen'}
                        >
                            Permanen
                        </Button.Danger>
                    </div>
                </div>
            </Dialog.Footer>
        </Dialog>
    );
};
