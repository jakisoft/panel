import React from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

/* ── SVG Brand Icons for Footer ──────────────────────────────────────── */
const GitHubIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.04-.52 4.84 4.84 0 0 1-1.73-1.4 4.8 4.8 0 0 1-.77-2.6z" />
    </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const footerUrl = useStoreState((state: ApplicationStore) => state.settings.data?.footer_url || 'https://github.com/jakisoft/panel');
    const socials = useStoreState((state: ApplicationStore) => state.settings.data?.social_links);

    const showSocials = socials?.enabled !== false;
    const githubUrl = socials?.github || 'https://github.com/jakisoft/panel';
    const tiktokUrl = socials?.tiktok || '';
    const instagramUrl = socials?.instagram || '';

    return (
        <footer className={'mt-12 pt-6 pb-8 border-t border-neutral-800/80 text-xs text-neutral-400'}>
            <div className={'flex flex-col sm:flex-row items-center justify-between gap-4'}>
                {/* ── Sudut Kiri (Left Corner): Social Icons ──────────────── */}
                <div className={'flex items-center gap-3'}>
                    {showSocials && (
                        <>
                            {/* GitHub */}
                            {githubUrl && (
                                <a
                                    href={githubUrl}
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}
                                    className={'w-8 h-8 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 hover:border-neutral-600 flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 shadow-sm hover:scale-110'}
                                    title={'GitHub'}
                                >
                                    <GitHubIcon size={16} />
                                </a>
                            )}

                            {/* TikTok */}
                            {tiktokUrl && (
                                <a
                                    href={tiktokUrl}
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}
                                    className={'w-8 h-8 rounded-lg bg-neutral-850 hover:bg-black border border-neutral-750 hover:border-[#EE1D52]/50 flex items-center justify-center text-neutral-300 hover:text-[#EE1D52] transition-all duration-200 shadow-sm hover:scale-110'}
                                    title={'TikTok'}
                                >
                                    <TikTokIcon size={16} />
                                </a>
                            )}

                            {/* Instagram */}
                            {instagramUrl && (
                                <a
                                    href={instagramUrl}
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}
                                    className={'w-8 h-8 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 hover:border-[#E4405F]/50 flex items-center justify-center text-neutral-300 hover:text-[#E4405F] transition-all duration-200 shadow-sm hover:scale-110'}
                                    title={'Instagram'}
                                >
                                    <InstagramIcon size={16} />
                                </a>
                            )}
                        </>
                    )}
                </div>

                {/* ── Sudut Kanan (Right Corner): Copyright & App Link ────── */}
                <div className={'text-center sm:text-right text-neutral-400 text-xs'}>
                    &copy; 2015 - {new Date().getFullYear()}&nbsp;
                    <a
                        href={footerUrl}
                        rel={'noopener nofollow noreferrer'}
                        target={'_blank'}
                        className={'no-underline text-neutral-300 font-semibold hover:text-white transition-colors'}
                    >
                        {name}
                    </a>
                    . All rights reserved.
                </div>
            </div>
        </footer>
    );
};
