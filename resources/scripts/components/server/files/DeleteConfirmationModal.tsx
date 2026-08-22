import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Trash2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/elements/button/index';

interface Props extends RequiredModalProps {
    files: string[];
    onMoveToTrash: () => void;
    onDeletePermanently: () => void;
}

export default ({ visible, onDismissed, files, onMoveToTrash, onDeletePermanently }: Props) => {
    return (
        <Modal visible={visible} onDismissed={onDismissed} showSpinnerOverlay={false}>
            <div className={'p-6'}>
                {/* Header */}
                <div className={'flex items-start justify-between pb-4 border-b border-neutral-800'}>
                    <div className={'flex items-center space-x-3'}>
                        <div className={'p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20'}>
                            <Trash2 size={22} />
                        </div>
                        <div>
                            <h2 className={'text-lg font-bold text-neutral-100'}>
                                Konfirmasi Penghapusan
                            </h2>
                            <p className={'text-xs text-neutral-400 mt-0.5'}>
                                {files.length === 1 ? (
                                    <span>
                                        File/Folder: <strong className={'text-neutral-200 font-mono'}>{files[0]}</strong>
                                    </span>
                                ) : (
                                    <span>
                                        <strong className={'text-neutral-200'}>{files.length}</strong> file/folder dipilih
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        type={'button'}
                        onClick={onDismissed}
                        className={'p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors'}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body: Action Choices */}
                <div className={'py-5 space-y-3'}>
                    <p className={'text-sm text-neutral-300 font-medium'}>
                        Pilih metode penghapusan yang diinginkan:
                    </p>

                    {/* Option 1: Move to Trash */}
                    <button
                        type={'button'}
                        onClick={() => {
                            onDismissed();
                            onMoveToTrash();
                        }}
                        className={'w-full group text-left p-4 bg-neutral-800/60 hover:bg-amber-500/10 border border-neutral-700/80 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between'}
                    >
                        <div className={'flex items-start space-x-3.5'}>
                            <div className={'p-2.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5 group-hover:scale-105 transition-transform'}>
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <div className={'flex items-center gap-2'}>
                                    <span className={'text-sm font-bold text-neutral-100 group-hover:text-amber-300 transition-colors'}>
                                        Simpan ke Tong Sampah
                                    </span>
                                    <span className={'text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full'}>
                                        Aman & Dapat Dipulihkan
                                    </span>
                                </div>
                                <p className={'text-xs text-neutral-400 mt-1 leading-relaxed'}>
                                    File dipindahkan ke Tong Sampah (Recycle Bin). Anda dapat memulihkannya kapan saja dalam 7 hari sebelum otomatis dibersihkan.
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} className={'text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-3'} />
                    </button>

                    {/* Option 2: Permanent Delete */}
                    <button
                        type={'button'}
                        onClick={() => {
                            onDismissed();
                            onDeletePermanently();
                        }}
                        className={'w-full group text-left p-4 bg-neutral-800/60 hover:bg-rose-500/10 border border-neutral-700/80 hover:border-rose-500/50 rounded-xl transition-all flex items-center justify-between'}
                    >
                        <div className={'flex items-start space-x-3.5'}>
                            <div className={'p-2.5 bg-rose-500/20 text-rose-400 rounded-lg shrink-0 mt-0.5 group-hover:scale-105 transition-transform'}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <div className={'flex items-center gap-2'}>
                                    <span className={'text-sm font-bold text-neutral-100 group-hover:text-rose-300 transition-colors'}>
                                        Hapus Permanen
                                    </span>
                                    <span className={'text-[10px] font-semibold px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full'}>
                                        Tidak Bisa Dipulihkan
                                    </span>
                                </div>
                                <p className={'text-xs text-neutral-400 mt-1 leading-relaxed'}>
                                    File langsung dihapus seketika dari server secara permanen dan tidak dapat dikembalikan.
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} className={'text-neutral-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-3'} />
                    </button>
                </div>

                {/* Footer */}
                <div className={'pt-4 border-t border-neutral-800 flex justify-end'}>
                    <Button variant={Button.Variants.Secondary} onClick={onDismissed}>
                        Batal
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
