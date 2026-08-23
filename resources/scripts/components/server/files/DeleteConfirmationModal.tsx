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
            title={'Delete Files'}
        >
            <div className={'py-2'}>
                <p className={'text-sm text-neutral-300'}>
                    {files.length === 1 ? (
                        <>
                            Do you want to move <span className={'font-mono text-neutral-100 font-semibold'}>{files[0]}</span> to the Trash or permanently delete it?
                        </>
                    ) : (
                        <>
                            Do you want to move the selected files to the Trash or permanently delete them?
                        </>
                    )}
                </p>
            </div>
            <Dialog.Footer>
                <div className={'w-full flex items-center justify-between'}>
                    <Button.Text onClick={onDismissed} className={'!py-2 !px-3 text-xs sm:text-sm'}>
                        Cancel
                    </Button.Text>
                    <div className={'flex items-center gap-2'}>
                        <Button
                            variant={Button.Variants.Secondary}
                            onClick={() => {
                                onDismissed();
                                onMoveToTrash();
                            }}
                            className={'!bg-amber-600/20 hover:!bg-amber-600/30 !text-amber-300 border border-amber-500/40 text-xs sm:text-sm !py-2 !px-3'}
                            title={'Move to Trash'}
                        >
                            <Trash2 size={14} className={'mr-1.5 inline'} />
                            Move to Trash
                        </Button>
                        <Button.Danger
                            onClick={() => {
                                onDismissed();
                                onDeletePermanently();
                            }}
                            className={'text-xs sm:text-sm !py-2 !px-3'}
                            title={'Delete Permanently'}
                        >
                            Delete Permanently
                        </Button.Danger>
                    </div>
                </div>
            </Dialog.Footer>
        </Dialog>
    );
};
