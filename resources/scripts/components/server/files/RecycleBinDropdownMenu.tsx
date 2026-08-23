import React, { memo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faUndo, faTrashAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '@/components/elements/DropdownMenu';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { format } from 'date-fns';
import { Clock, Calendar, Folder } from 'lucide-react';
import { TrashItem, restoreTrashItem, deleteTrashItemPermanently, formatDaysRemaining } from '@/api/server/files/recycleBin';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import isEqual from 'react-fast-compare';

const StyledRow = styled.div<{ $danger?: boolean }>`
    ${tw`p-2 flex items-center rounded cursor-pointer`};
    ${(props) =>
        props.$danger ? tw`hover:bg-red-100 hover:text-red-700` : tw`hover:bg-neutral-100 hover:text-neutral-700`};
`;

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: IconDefinition;
    title: string;
    $danger?: boolean;
}

const Row = ({ icon, title, ...props }: RowProps) => (
    <StyledRow {...props}>
        <FontAwesomeIcon icon={icon} css={tw`text-xs`} fixedWidth />
        <span css={tw`ml-2`}>{title}</span>
    </StyledRow>
);

interface Props {
    item: TrashItem;
    onItemRemoved: (id: string) => void;
}

const RecycleBinDropdownMenu = ({ item, onItemRemoved }: Props) => {
    const onClickRef = useRef<DropdownMenu>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const doRestore = () => {
        setLoading(true);
        setLoadingMessage('Memulihkan item...');
        clearFlashes('files');

        restoreTrashItem(uuid, item)
            .then(() => {
                onItemRemoved(item.id);
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => setLoading(false));
    };

    const doPermanentDelete = () => {
        setLoading(true);
        setShowDeleteConfirm(false);
        setLoadingMessage('Menghapus permanen...');
        clearFlashes('files');

        deleteTrashItemPermanently(uuid, item)
            .then(() => {
                onItemRemoved(item.id);
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .finally(() => setLoading(false));
    };

    return (
        <>
            <SpinnerOverlay visible={loading} fixed size={'large'}>
                {loadingMessage}
            </SpinnerOverlay>

            <Dialog.Confirm
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={'Hapus Permanen'}
                confirm={'Hapus'}
                onConfirmed={doPermanentDelete}
            >
                Apakah Anda yakin ingin menghapus <span className={'font-bold text-white'}>{item.name}</span> secara permanen?
                Tindakan ini tidak dapat dibatalkan.
            </Dialog.Confirm>

            <DropdownMenu
                ref={onClickRef}
                renderToggle={(onClick) => (
                    <div css={tw`px-4 py-2 hover:text-white cursor-pointer`} onClick={onClick}>
                        <FontAwesomeIcon icon={faEllipsisH} />
                    </div>
                )}
            >
                {/* Trash Item Metadata Info & Countdown */}
                <div css={tw`p-2.5 mb-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700`}>
                    <div css={tw`font-bold text-neutral-900 mb-1.5 truncate text-xs`} title={item.name}>
                        {item.name}
                    </div>
                    <div css={tw`space-y-1 text-[11px]`}>
                        <div css={tw`flex items-center gap-1.5 text-neutral-600`}>
                            <Calendar size={12} className={'shrink-0 text-neutral-500'} />
                            <span className={'truncate'}>Dihapus: <strong className={'text-neutral-800 font-semibold'}>{format(new Date(item.deletedAt), 'dd/MM/yyyy HH:mm')}</strong></span>
                        </div>
                        <div css={tw`flex items-center gap-1.5 text-neutral-600`}>
                            <Clock size={12} className={'shrink-0 text-rose-500'} />
                            <span className={'truncate'}>Sisa: <strong className={'text-rose-600 font-bold'}>{formatDaysRemaining(item.deletedAt)}</strong></span>
                        </div>
                        {item.originalDirectory && (
                            <div css={tw`flex items-center gap-1.5 text-neutral-600 truncate`}>
                                <Folder size={12} className={'shrink-0 text-neutral-500'} />
                                <span className={'truncate'} title={item.originalDirectory}>Asal: <strong className={'font-mono text-neutral-800'}>{item.originalDirectory}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <Row onClick={doRestore} icon={faUndo} title={'Pulihkan (Restore)'} />
                    <Row onClick={() => setShowDeleteConfirm(true)} icon={faTrashAlt} title={'Hapus Permanen'} $danger />
                </div>
            </DropdownMenu>
        </>
    );
};

export default memo(RecycleBinDropdownMenu, isEqual);
