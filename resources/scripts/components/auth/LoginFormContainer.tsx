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
                <div className={'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 shadow-sm'}>
                    <span className={'w-2 h-2 rounded-full bg-primary-400 animate-pulse'} />
                    <span className={'text-xs font-bold uppercase tracking-wider text-neutral-200 truncate max-w-[130px]'}>
                        {name}
                    </span>
                </div>
            );
        }

        if (logoDisplay === 'logo_only') {
            return (
                <div className={'flex items-center justify-end'}>
                    <img
                        src={logo || (isDefaultLogo ? jksoftLogo : logo)}
                        alt={name}
                        className={'h-10 sm:h-12 max-w-[140px] object-contain drop-shadow-md'}
                    />
                </div>
            );
        }

        // 'both' (default) - Asymmetrical top-right emblem
        return (
            <div className={'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-neutral-800/90 border border-neutral-700/60 shadow-lg shadow-black/40 flex items-center justify-center p-2.5 transition-all duration-200 hover:scale-105 hover:border-primary-500/50 hover:shadow-primary-500/10'}>
                <img
                    src={isDefaultLogo ? jksoftIcon : (logo || jksoftIcon)}
                    alt={name}
                    className={'w-full h-full object-contain'}
                />
            </div>
        );
    };

    return (
        <div className={'w-full select-none'}>
            <Form {...props} ref={ref}>
                <div className={'w-full bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/90 shadow-2xl shadow-black/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden'}>
                    {/* Top Accent Line */}
                    <div className={'absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-cyan-400 to-primary-600 shadow-[0_0_12px_rgba(59,130,246,0.5)]'} />

                    {/* Asymmetric Header: Title & Subtitle on the left, Logo badge on the right */}
                    <div className={'pb-5 mb-5 border-b border-neutral-800/80'}>
                        <div className={'flex items-start justify-between gap-4'}>
                            {/* Left Side: Title & Subtitle */}
                            <div className={'flex-1 min-w-0 pr-2'}>
                                {title && (
                                    <h1 className={'text-xl sm:text-2xl font-black text-white tracking-tight leading-tight'}>
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className={'text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed'}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {/* Right Side: Logo / Brand Emblem */}
                            <div className={'shrink-0 pt-0.5'}>
                                {renderBrand()}
                            </div>
                        </div>
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
