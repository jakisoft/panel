import React, { memo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faUndo, faTrashAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '@/components/elements/DropdownMenu';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { TrashItem, restoreTrashItem, deleteTrashItemPermanently } from '@/api/server/files/recycleBin';
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
                <Row onClick={doRestore} icon={faUndo} title={'Pulihkan (Restore)'} />
                <Row onClick={() => setShowDeleteConfirm(true)} icon={faTrashAlt} title={'Hapus Permanen'} $danger />
            </DropdownMenu>
        </>
    );
};

export default memo(RecycleBinDropdownMenu, isEqual);
