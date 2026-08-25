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
                <div className={'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 shadow-sm'}>
                    <span className={'w-2 h-2 rounded-full bg-primary-400 animate-pulse'} />
                    <span className={'text-xs font-bold uppercase tracking-wider text-neutral-200 truncate max-w-[220px]'}>
                        {name}
                    </span>
                </div>
            );
        }

        if (logoDisplay === 'logo_only') {
            return (
                <img
                    src={logo || (isDefaultLogo ? jksoftLogo : logo)}
                    alt={name}
                    className={'h-10 sm:h-11 max-w-[200px] object-contain drop-shadow-md'}
                />
            );
        }

        // 'both' (default)
        return (
            <div className={'flex flex-col items-center gap-2.5'}>
                <div className={'w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-neutral-800/90 border border-neutral-700/60 shadow-lg shadow-black/40 flex items-center justify-center p-2.5 transition-transform hover:scale-105 duration-200'}>
                    <img
                        src={isDefaultLogo ? jksoftIcon : (logo || jksoftIcon)}
                        alt={name}
                        className={'w-full h-full object-contain'}
                    />
                </div>
                <div className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40 text-[11px] font-semibold text-neutral-300 tracking-wide uppercase'}>
                    <span className={'w-1.5 h-1.5 rounded-full bg-primary-400'} />
                    <span className={'truncate max-w-[220px]'}>{name}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={'w-full select-none'}>
            <Form {...props} ref={ref}>
                <div className={'w-full bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/90 shadow-2xl shadow-black/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden'}>
                    {/* Top Accent Line */}
                    <div className={'absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-cyan-400 to-primary-600 shadow-[0_0_12px_rgba(59,130,246,0.5)]'} />

                    {/* Header: Centered Brand, Title and Subtitle */}
                    <div className={'flex flex-col items-center text-center pb-5 mb-5 border-b border-neutral-800/80'}>
                        {/* Brand Logo / Emblem */}
                        <div className={'mb-3'}>
                            {renderBrand()}
                        </div>

                        {/* Title & Subtitle */}
                        {title && (
                            <h1 className={'text-xl sm:text-2xl font-black text-white tracking-tight'}>
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className={'text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs sm:max-w-sm leading-relaxed'}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Flash Messages */}
                    <FlashMessageRender className={'mb-4'} />

                    {/* Form Controls Container */}
                    <div className={'space-y-4'}>
                        {props.children}
                    </div>
                </div>
            </Form>

            {/* Footer Copyright */}
            <p className={'text-center text-neutral-500 text-xs mt-6 font-medium tracking-normal'}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    href={footerUrl}
                    rel={'noopener nofollow noreferrer'}
                    target={'_blank'}
                    className={'no-underline text-neutral-400 font-semibold hover:text-primary-400 transition-colors'}
                >
                    {name}
                </a>
                . All rights reserved.
            </p>
        </div>
    );
});
