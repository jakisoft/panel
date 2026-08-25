import React, { useEffect, useRef, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Headset, X, Mail, Phone, MessageSquare, Globe, ExternalLink } from 'lucide-react';

/* ── SVG Brand Icons ─────────────────────────────────────────────────── */
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.676-1.63-.927-2.232-.244-.585-.493-.505-.676-.514l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.377.197 1.896.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.2-.577-.35zM12.042 21.824c-1.77 0-3.504-.477-5.024-1.381l-.36-.214-3.738.98 1-3.644-.236-.375c-.996-1.586-1.522-3.419-1.522-5.302 0-5.503 4.477-9.98 9.98-9.98 2.666 0 5.172 1.039 7.057 2.925a9.923 9.923 0 0 1 2.924 7.055c0 5.504-4.477 9.936-9.081 9.936zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.12.553 4.19 1.602 6.012L0 24l6.113-1.603a11.968 11.968 0 0 0 5.929 1.564c6.64 0 12.042-5.402 12.042-12.042C24.084 5.402 18.682 0 12.042 0z" />
    </svg>
);

const TelegramIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-.96 4.966-1.356 7.086-.168.897-.5 1.198-.82 1.228-.697.064-1.226-.46-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.328.016.096.036.313.02.483z" />
    </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.04-.52 4.84 4.84 0 0 1-1.73-1.4 4.8 4.8 0 0 1-.77-2.6z" />
    </svg>
);

const getChannelIcon = (iconKey: string, size = 20) => {
    switch (iconKey?.toLowerCase()) {
        case 'whatsapp':
            return {
                Component: <WhatsAppIcon size={size} />,
                color: '#25D366',
                bg: 'bg-[#25D366]/15',
                border: 'border-[#25D366]/30',
            };
        case 'telegram':
            return {
                Component: <TelegramIcon size={size} />,
                color: '#229ED9',
                bg: 'bg-[#229ED9]/15',
                border: 'border-[#229ED9]/30',
            };
        case 'discord':
            return {
                Component: <DiscordIcon size={size} />,
                color: '#5865F2',
                bg: 'bg-[#5865F2]/15',
                border: 'border-[#5865F2]/30',
            };
        case 'instagram':
            return {
                Component: <InstagramIcon size={size} />,
                color: '#E4405F',
                bg: 'bg-[#E4405F]/15',
                border: 'border-[#E4405F]/30',
            };
        case 'tiktok':
            return {
                Component: <TikTokIcon size={size} />,
                color: '#EE1D52',
                bg: 'bg-black/40',
                border: 'border-[#EE1D52]/30',
            };
        case 'email':
            return {
                Component: <Mail size={size} />,
                color: '#EA4335',
                bg: 'bg-[#EA4335]/15',
                border: 'border-[#EA4335]/30',
            };
        case 'phone':
            return {
                Component: <Phone size={size} />,
                color: '#10B981',
                bg: 'bg-[#10B981]/15',
                border: 'border-[#10B981]/30',
            };
        case 'message':
            return {
                Component: <MessageSquare size={size} />,
                color: '#3B82F6',
                bg: 'bg-[#3B82F6]/15',
                border: 'border-[#3B82F6]/30',
            };
        case 'globe':
            return {
                Component: <Globe size={size} />,
                color: '#6366F1',
                bg: 'bg-[#6366F1]/15',
                border: 'border-[#6366F1]/30',
            };
        default:
            return {
                Component: <Headset size={size} />,
                color: '#8B5CF6',
                bg: 'bg-[#8B5CF6]/15',
                border: 'border-[#8B5CF6]/30',
            };
    }
};

export default () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const cs = useStoreState((state: ApplicationStore) => state.settings.data?.cs_contact);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    if (cs?.enabled === false) {
        return null;
    }

    const title = cs?.title || 'Customer Support';
    const subtitle = cs?.subtitle || 'Butuh bantuan? Hubungi tim support kami 24/7';
    const items = cs?.items || [];

    return (
        <div ref={containerRef} className={'fixed bottom-6 right-6 z-50 select-none'}>
            {/* ── Dropup Popover Modal ─────────────────────────────────── */}
            {isOpen && (
                <div
                    className={
                        'absolute bottom-20 right-0 w-[330px] sm:w-[370px] bg-neutral-900/98 backdrop-blur-2xl border border-neutral-750/90 rounded-2xl shadow-2xl shadow-black/80 p-4 sm:p-5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4'
                    }
                >
                    {/* Header */}
                    <div className={'flex items-center justify-between pb-3.5 border-b border-neutral-800'}>
                        <div className={'flex items-center gap-3 min-w-0'}>
                            <div className={'w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-primary-500/20'}>
                                <Headset size={20} />
                            </div>
                            <div className={'min-w-0'}>
                                <h4 className={'text-sm sm:text-base font-bold text-neutral-100 truncate tracking-tight'}>
                                    {title}
                                </h4>
                                <div className={'flex items-center gap-1.5 mt-0.5'}>
                                    <span className={'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />
                                    <p className={'text-[11px] text-neutral-400 truncate'}>{subtitle}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            type={'button'}
                            onClick={() => setIsOpen(false)}
                            className={'text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors shrink-0'}
                            title={'Tutup'}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Dynamic Channel Items List */}
                    <div className={'mt-3.5 space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5'}>
                        {items && items.length > 0 ? (
                            items.map((item, index) => {
                                const iconData = getChannelIcon(item.icon, 20);
                                return (
                                    <a
                                        key={item.id || index}
                                        href={item.url}
                                        target={'_blank'}
                                        rel={'noreferrer noopener'}
                                        className={
                                            'group flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750/70 hover:border-primary-500/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg no-underline'
                                        }
                                    >
                                        <div className={'flex items-center gap-3 min-w-0'}>
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconData.border} ${iconData.bg} transition-transform group-hover:scale-105 shadow-sm`}
                                                style={{ color: iconData.color }}
                                            >
                                                {iconData.Component}
                                            </div>
                                            <div className={'min-w-0'}>
                                                <p className={'text-xs sm:text-sm font-semibold text-neutral-100 group-hover:text-white truncate'}>
                                                    {item.name}
                                                </p>
                                                <p className={'text-[11px] text-neutral-400 truncate mt-0.5'}>
                                                    {item.url}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={'w-7 h-7 rounded-lg bg-neutral-800 group-hover:bg-neutral-750 flex items-center justify-center text-neutral-400 group-hover:text-white shrink-0 transition-colors'}>
                                            <ExternalLink size={13} />
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className={'py-8 text-center text-neutral-400 text-xs'}>
                                <p>Belum ada saluran CS yang dikonfigurasi.</p>
                                <p className={'text-[10px] text-neutral-500 mt-1'}>Tambahkan saluran di Admin &gt; Settings &gt; CS Contact.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer note */}
                    <div className={'mt-3 pt-2.5 border-t border-neutral-800 text-center'}>
                        <span className={'text-[10px] text-neutral-500'}>
                            ✨ Hubungi kami kapan saja untuk bantuan teknis &amp; billing.
                        </span>
                    </div>
                </div>
            )}

            {/* ── Main Large Floating Button ────────────────────────────── */}
            <button
                type={'button'}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-300 shadow-2xl ${
                    isOpen
                        ? 'bg-neutral-800 text-white border border-neutral-700 shadow-black/80 rotate-90 scale-95'
                        : 'bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 text-white hover:scale-108 shadow-primary-500/40 hover:shadow-primary-500/60'
                }`}
                title={'Buka Bantuan Customer Support'}
            >
                {/* Ping animation indicator when closed */}
                {!isOpen && (
                    <span className={'absolute top-0 right-0 flex h-4 w-4'}>
                        <span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'} />
                        <span className={'relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-neutral-900'} />
                    </span>
                )}

                {isOpen ? (
                    <X size={24} className={'transition-transform'} />
                ) : (
                    <Headset size={26} className={'transition-transform group-hover:rotate-12'} />
                )}
            </button>
        </div>
    );
};
