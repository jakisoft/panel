import React, { forwardRef } from 'react';
import { Form } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import jksoftLogo from '@/assets/images/jksoft-logo.svg';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
    icon?: React.ReactNode;
};

export default forwardRef<HTMLFormElement, Props>(({ title, icon, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo);
    const logoDisplay = useStoreState((state: ApplicationStore) => state.settings.data?.logo_display || 'both');
    const footerUrl = useStoreState(
        (state: ApplicationStore) => state.settings.data?.footer_url || 'https://github.com/jakisoft/panel'
    );

    const renderBrand = () => {
        if (logoDisplay === 'text_only') {
            return (
                <span className={'font-bold text-sm text-neutral-300 tracking-tight truncate max-w-[160px]'}>
                    {name}
                </span>
            );
        }
        return (
            <img
                src={logo || jksoftLogo}
                alt={name}
                className={'h-8 sm:h-9 max-w-[160px] object-contain shrink-0 opacity-80'}
            />
        );
    };

    return (
        <div className={'w-full max-w-[480px] mx-auto px-4'}>
            <Form {...props} ref={ref}>
                <div
                    className={
                        'bg-neutral-800 border border-neutral-700/50 shadow-2xl shadow-black/40 rounded-2xl p-6 sm:p-8'
                    }
                >
                    {/* Header: Icon + Title on left, Brand on right */}
                    <div
                        className={
                            'flex items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-700/40'
                        }
                    >
                        <div className={'flex items-center gap-2.5 min-w-0'}>
                            {icon && <div className={'text-neutral-400 shrink-0'}>{icon}</div>}
                            {title && (
                                <h2
                                    className={
                                        'text-lg sm:text-xl font-semibold text-neutral-100 tracking-tight truncate'
                                    }
                                >
                                    {title}
                                </h2>
                            )}
                        </div>
                        <div className={'shrink-0'}>{renderBrand()}</div>
                    </div>

                    <FlashMessageRender css={tw`mb-5`} />
                    {props.children}
                </div>
            </Form>
            <p className={'text-center text-neutral-600 text-xs mt-6'}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    href={footerUrl}
                    rel={'noopener nofollow noreferrer'}
                    target={'_blank'}
                    className={
                        'no-underline text-neutral-500 font-medium hover:text-neutral-400 transition-colors'
                    }
                >
                    {name}
                </a>
                . All rights reserved.
            </p>
        </div>
    );
});
