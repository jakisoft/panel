import React, { forwardRef } from 'react';
import { Form } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import jksoftIcon from '@/assets/images/jksoft-icon.svg';
import jksoftLogo from '@/assets/images/jksoft-logo.svg';

interface Props extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    title?: string;
    subtitle?: string;
}

export default forwardRef<HTMLFormElement, Props>(({ title, subtitle, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo);
    const logoDisplay = useStoreState((state: ApplicationStore) => state.settings.data?.logo_display || 'both');
    const footerUrl = useStoreState((state: ApplicationStore) => state.settings.data?.footer_url || 'https://github.com/jakisoft/panel');

    const isDefaultLogo = !logo || logo.includes('jksoft-logo.svg') || logo.includes('jksoft-icon.svg');

    const renderBrand = () => {
        if (logoDisplay === 'text_only') {
            return (
                <span className={'font-black text-lg sm:text-xl text-white tracking-tight truncate'}>
                    {name}
                </span>
            );
        }

        if (logoDisplay === 'logo_only') {
            return (
                <img
                    src={logo || (isDefaultLogo ? jksoftLogo : logo)}
                    alt={name}
                    className={'h-10 sm:h-11 max-w-[200px] object-contain'}
                />
            );
        }

        // 'both' (default)
        return (
            <div className={'flex items-center gap-3'}>
                <img
                    src={isDefaultLogo ? jksoftIcon : (logo || jksoftIcon)}
                    alt={name}
                    className={isDefaultLogo ? 'h-10 w-10 object-contain rounded-2xl shadow-md' : 'h-10 max-w-[160px] object-contain'}
                />
                <span className={'font-black text-lg sm:text-xl text-white tracking-tight truncate'}>
                    {name}
                </span>
            </div>
        );
    };

    return (
        <div className={'w-full max-w-[440px] px-4 mx-auto select-none'}>
            <Form {...props} ref={ref}>
                <div className={'w-full bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800/90 shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-8 mx-auto relative overflow-hidden'}>
                    {/* Decorative top subtle gradient line */}
                    <div className={'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-cyan-400 to-primary-600'} />

                    {/* Top Header: Logo / Brand Badge */}
                    <div className={'flex items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-800/80'}>
                        <div>
                            {title && (
                                <h2 className={'text-xl sm:text-2xl font-black text-white tracking-tight'}>
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className={'text-xs text-neutral-400 mt-1'}>{subtitle}</p>
                            )}
                        </div>
                        <div className={'flex items-center justify-end shrink-0'}>
                            {renderBrand()}
                        </div>
                    </div>

                    {/* Flash Messages */}
                    <FlashMessageRender className={'mb-4'} />

                    {/* Form Body Content */}
                    <div className={'space-y-4'}>
                        {props.children}
                    </div>
                </div>
            </Form>

            {/* Footer Copyright */}
            <p className={'text-center text-neutral-500 text-xs mt-6 font-medium'}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    href={footerUrl}
                    rel={'noopener nofollow noreferrer'}
                    target={'_blank'}
                    className={'no-underline text-neutral-400 font-semibold hover:text-neutral-200 transition-colors'}
                >
                    {name}
                </a>
                . All rights reserved.
            </p>
        </div>
    );
});
