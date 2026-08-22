import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${tw`w-full px-4 py-8 mx-auto`}

    ${breakpoint('sm')`
        ${tw`w-4/5`}
    `};

    ${breakpoint('md')`
        ${tw`w-3/5 py-12`}
    `};

    ${breakpoint('lg')`
        ${tw`w-full`}
        max-width: 680px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo || '/assets/svgs/pterodactyl.svg');

    return (
        <Container>
            <div className={'flex flex-col items-center mb-6'}>
                <div className={'relative group mb-3'}>
                    <div className={'absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-30 blur group-hover:opacity-50 transition duration-300'} />
                    <div className={'relative bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-center'}>
                        {logo && logo !== '/assets/svgs/pterodactyl.svg' ? (
                            <img src={logo} alt={name} className={'h-12 max-w-[200px] object-contain'} />
                        ) : (
                            <div className={'flex items-center gap-2.5 px-2'}>
                                <div className={'w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25'}>
                                    <span className={'text-white font-bold text-base'}>JK</span>
                                </div>
                                <span className={'text-xl font-bold text-white tracking-tight'}>{name}</span>
                            </div>
                        )}
                    </div>
                </div>
                {title && <h2 className={'text-2xl font-bold text-neutral-100 mt-2'}>{title}</h2>}
                <p className={'text-sm text-neutral-400 mt-1'}>Selamat datang kembali di panel manajemen cloud.</p>
            </div>

            <FlashMessageRender css={tw`mb-4 px-1`} />

            <Form {...props} ref={ref}>
                <div className={'w-full bg-neutral-900/90 backdrop-blur border border-neutral-800 shadow-2xl rounded-2xl p-6 sm:p-8'}>
                    {props.children}
                </div>
            </Form>

            <div className={'text-center mt-6 text-neutral-500 text-xs flex flex-col items-center gap-1'}>
                <p>
                    &copy; {new Date().getFullYear()} <span className={'text-neutral-300 font-semibold'}>{name}</span>. All rights reserved.
                </p>
                <p className={'text-neutral-600 text-[11px]'}>Protected with enterprise security.</p>
            </div>
        </Container>
    );
});
