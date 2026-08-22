import React, { useState } from 'react';
import { Dialog } from '@/components/elements/dialog';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default ({ open, onClose }: Props) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onConfirmed = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <>
            <SpinnerOverlay visible={isLoggingOut} fixed />
            <Dialog.Confirm
                open={open}
                onClose={onClose}
                title={'Konfirmasi Keluar'}
                confirm={'Ya, Keluar'}
                onConfirmed={onConfirmed}
            >
                Apakah Anda yakin ingin keluar dari akun Anda? Sesi Anda akan diakhiri.
            </Dialog.Confirm>
        </>
    );
};
