import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import jksoftLogo from '@/assets/images/jksoft-logo.svg';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${tw`w-full px-4 mx-auto`};
    max-width: 480px;
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo);
    const logoDisplay = useStoreState((state: ApplicationStore) => state.settings.data?.logo_display || 'both');
    const footerUrl = useStoreState((state: ApplicationStore) => state.settings.data?.footer_url || 'https://github.com/jakisoft/panel');

    // Display either logo image OR app name text, never both
    const renderBrand = () => {
        if (logoDisplay === 'text_only') {
            return (
                <span className={'font-bold text-sm sm:text-base text-neutral-200 tracking-tight truncate max-w-[170px]'}>
                    {name}
                </span>
            );
        }
        return (
            <img
                src={logo || jksoftLogo}
                alt={name}
                className={'h-7 sm:h-8 max-w-[140px] object-contain shrink-0'}
            />
        );
    };

    return (
        <Container>
            <Form {...props} ref={ref}>
                <div css={tw`w-full bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl p-6 sm:p-8 mx-auto`}>
                    {/* Top Asymmetric Header: Title on Top-Left, Logo OR Name on Top-Right */}
                    <div className={'flex items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-800/80'}>
                        {title && (
                            <h2 className={'text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight'}>
                                {title}
                            </h2>
                        )}
                        <div className={'flex items-center justify-end shrink-0'}>
                            {renderBrand()}
                        </div>
                    </div>

                    <FlashMessageRender css={tw`mb-4 px-1`} />
                    {props.children}
                </div>
            </Form>
            <p css={tw`text-center text-neutral-500 text-xs mt-6`}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    href={footerUrl}
                    rel={'noopener nofollow noreferrer'}
                    target={'_blank'}
                    css={tw`no-underline text-neutral-400 font-semibold hover:text-neutral-300 transition-colors`}
                >
                    {name}
                </a>
                . All rights reserved.
            </p>
        </Container>
    );
});
