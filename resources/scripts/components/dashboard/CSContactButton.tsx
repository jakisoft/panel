import React, { useEffect, useRef, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Headset, X, MessageCircle, Send, MessageSquare, Mail, ExternalLink } from 'lucide-react';

/* ── SVG Brand Icons for CS Channels ─────────────────────────────────── */
const WhatsAppIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.676-1.63-927-2.232-.244-.585-.493-.505-.676-.514l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.377.197 1.896.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.076-.125-.276-.2-.577-.35zM12.042 21.824c-1.77 0-3.504-.477-5.024-1.381l-.36-.214-3.738.98 1-3.644-.236-.375c-.996-1.586-1.522-3.419-1.522-5.302 0-5.503 4.477-9.98 9.98-9.98 2.666 0 5.172 1.039 7.057 2.925a9.923 9.923 0 0 1 2.924 7.055c0 5.504-4.477 9.936-9.081 9.936zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.12.553 4.19 1.602 6.012L0 24l6.113-1.603a11.968 11.968 0 0 0 5.929 1.564c6.64 0 12.042-5.402 12.042-12.042C24.084 5.402 18.682 0 12.042 0z" />
    </svg>
);

const TelegramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.847-.96 4.966-1.356 7.086-.168.897-.5 1.198-.82 1.228-.697.064-1.226-.46-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.328.016.096.036.313.02.483z" />
    </svg>
);

const DiscordIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

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

    // Close on Escape
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
    const subtitle = cs?.subtitle || 'Butuh bantuan? Hubungi tim support kami';

    const getWhatsAppUrl = (val: string) => {
        if (val.startsWith('http')) return val;
        const cleaned = val.replace(/[^0-9]/g, '');
        return `https://wa.me/${cleaned}`;
    };

    const getTelegramUrl = (val: string) => {
        if (val.startsWith('http')) return val;
        const cleaned = val.replace(/^@/, '');
        return `https://t.me/${cleaned}`;
    };

    const channels = [
        cs?.whatsapp && {
            id: 'whatsapp',
            name: 'WhatsApp Support',
            desc: 'Chat via WhatsApp langsung',
            url: getWhatsAppUrl(cs.whatsapp),
            icon: WhatsAppIcon,
            color: '#25D366',
            badgeBg: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30',
        },
        cs?.telegram && {
            id: 'telegram',
            name: 'Telegram Support',
            desc: 'Chat via Telegram Helpdesk',
            url: getTelegramUrl(cs.telegram),
            icon: TelegramIcon,
            color: '#229ED9',
            badgeBg: 'bg-[#229ED9]/10 text-[#229ED9] border-[#229ED9]/30',
        },
        cs?.discord && {
            id: 'discord',
            name: 'Discord Community',
            desc: 'Buka tiket support di Discord',
            url: cs.discord,
            icon: DiscordIcon,
            color: '#5865F2',
            badgeBg: 'bg-[#5865F2]/10 text-[#7983F5] border-[#5865F2]/30',
        },
        cs?.email && {
            id: 'email',
            name: 'Email Support',
            desc: cs.email,
            url: `mailto:${cs.email}`,
            icon: Mail,
            color: '#EA4335',
            badgeBg: 'bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/30',
        },
    ].filter(Boolean);

    return (
        <div ref={containerRef} className={'fixed bottom-6 right-6 z-50 select-none'}>
            {/* ── Dropup Content Modal ─────────────────────────────────── */}
            {isOpen && (
                <div
                    className={
                        'absolute bottom-16 right-0 w-[320px] sm:w-[350px] bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl shadow-black/60 p-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3'
                    }
                >
                    {/* Header */}
                    <div className={'flex items-center justify-between pb-3 border-b border-neutral-800'}>
                        <div className={'flex items-center gap-2.5 min-w-0'}>
                            <div className={'w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0'}>
                                <Headset size={16} />
                            </div>
                            <div className={'min-w-0'}>
                                <h4 className={'text-sm font-bold text-neutral-100 truncate tracking-tight'}>{title}</h4>
                                {subtitle && <p className={'text-[11px] text-neutral-400 truncate'}>{subtitle}</p>}
                            </div>
                        </div>
                        <button
                            type={'button'}
                            onClick={() => setIsOpen(false)}
                            className={'text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors'}
                            title={'Tutup'}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Channel List */}
                    <div className={'mt-3 space-y-2 max-h-[320px] overflow-y-auto'}>
                        {channels.length > 0 ? (
                            channels.map((ch: any) => {
                                const IconComp = ch.icon;
                                return (
                                    <a
                                        key={ch.id}
                                        href={ch.url}
                                        target={'_blank'}
                                        rel={'noreferrer noopener'}
                                        className={
                                            'flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/40 hover:border-neutral-600 transition-all duration-150 no-underline group'
                                        }
                                    >
                                        <div className={'flex items-center gap-3 min-w-0'}>
                                            <div
                                                className={'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm'}
                                                style={{ backgroundColor: `${ch.color}20`, color: ch.color }}
                                            >
                                                <IconComp size={18} />
                                            </div>
                                            <div className={'min-w-0'}>
                                                <p className={'text-xs font-semibold text-neutral-200 group-hover:text-white truncate'}>
                                                    {ch.name}
                                                </p>
                                                <p className={'text-[10px] text-neutral-400 truncate'}>
                                                    {ch.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ExternalLink size={14} className={'text-neutral-500 group-hover:text-neutral-300 shrink-0 transition-colors'} />
                                    </a>
                                );
                            })
                        ) : (
                            <div className={'py-6 text-center text-neutral-400 text-xs'}>
                                <p>Belum ada saluran CS yang dikonfigurasi.</p>
                                <p className={'text-[10px] text-neutral-500 mt-1'}>Atur di Admin &gt; Settings &gt; CS Contact.</p>
                            </div>
                        )}
                    </div>

                    <div className={'mt-3 pt-2.5 border-t border-neutral-800 text-center'}>
                        <span className={'text-[10px] text-neutral-500'}>
                            Online Support Team &bull; Respons Cepat
                        </span>
                    </div>
                </div>
            )}

            {/* ── Main Trigger Button ──────────────────────────────────── */}
            <button
                type={'button'}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative group flex items-center gap-2.5 px-4 py-3 rounded-full font-semibold text-xs transition-all duration-300 shadow-xl ${
                    isOpen
                        ? 'bg-neutral-800 text-white border border-neutral-700 shadow-black/60 scale-95'
                        : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105 shadow-primary-500/30'
                }`}
                title={'Buka Bantuan Customer Support'}
            >
                {/* Ping animation when closed */}
                {!isOpen && (
                    <span className={'absolute -top-1 -right-1 flex h-3.5 w-3.5'}>
                        <span className={'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60'} />
                        <span className={'relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-neutral-900'} />
                    </span>
                )}

                <Headset size={18} className={'shrink-0 transition-transform group-hover:rotate-12'} />
                <span className={'hidden sm:inline tracking-wide'}>{isOpen ? 'Tutup' : 'Help & Support'}</span>
            </button>
        </div>
    );
};
