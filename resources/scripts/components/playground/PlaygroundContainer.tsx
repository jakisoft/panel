import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Check, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { getElysiumData } from '@/components/elements/elysium/getElysiumData';

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  :root { --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); --bright-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #fcfcfd; color: #1a1a1a; overflow-x: hidden; }
  .bg-gradient-bright { background: var(--bright-gradient); }
  .asymmetric-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
  .card-glass { background: rgba(255,255,255,.85); backdrop-filter: blur(10px); border: 1px solid #fff; }
  .floating { animation: floating 5s ease-in-out infinite; }
  @keyframes floating { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-15px);} }
  .floating-delayed { animation: floating 7s ease-in-out infinite; animation-delay: 1s; }
  .glass-nav { background: rgba(255,255,255,.6); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,.4); }
  .reveal { opacity: 0; transform: translateY(30px); transition: all .8s cubic-bezier(0.4,0,0.2,1); }
  .reveal.active { opacity: 1; transform: translateY(0); }
`;

type PricingItem = { name: string; price: string; description?: string; features?: string[] };
type FaqItem = { question: string; answer: string };
type VisualCard = { key: 'total_users' | 'total_servers'; title: string; description?: string };
type FooterLink = { label: string; url: string };
type SocialLink = { label: string; url: string; icon: string };

const parseStringVar = (name: string, fallback: string) => {
    try {
        const raw = getElysiumData(name).trim();
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const parseJsonVar = <T,>(name: string, fallback: T): T => {
    try {
        const raw = getElysiumData(name).trim();
        if (!raw) return fallback;
        const outer = JSON.parse(raw);
        if (typeof outer !== 'string') return fallback;
        return JSON.parse(outer) as T;
    } catch {
        return fallback;
    }
};

const IconByName = ({ name, size = 16 }: { name: string; size?: number }) => {
    const iconMap = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;
    const DynamicIcon = iconMap[name] || Server;

    return <DynamicIcon size={size} />;
};

const Navbar = ({ brandName, brandIcon, footerLinks }: { brandName: string; brandIcon: string; footerLinks: FooterLink[] }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={'fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 transition-all duration-500'}>
            <div className={`glass-nav rounded-2xl px-5 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 ${isScrolled ? 'py-2 scale-95' : 'py-2.5 scale-100'}`}>
                <div className={'flex items-center gap-2'}>
                    <div className={'w-7 h-7 bg-gradient-bright rounded-lg flex items-center justify-center text-white'}><IconByName name={brandIcon} size={16} /></div>
                    <span className={'font-bold text-lg tracking-tight'}>{brandName}</span>
                </div>
                <div className={'hidden md:flex items-center gap-7 font-semibold text-[13px] text-slate-500'}>
                    {footerLinks.slice(0, 3).map((link) => (
                        <a key={`${link.label}-${link.url}`} href={link.url} className={'hover:text-indigo-600'}>{link.label}</a>
                    ))}
                </div>
                <div className={'flex items-center gap-3'}>
                    <a href={'/auth/login'} className={'text-[13px] font-bold text-slate-600 hover:text-indigo-600 px-3'}>Masuk</a>
                    <a href={'/auth/register'} className={'bg-slate-900 text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-indigo-600'}>Daftar</a>
                </div>
            </div>
        </nav>
    );
};

const FAQItem = ({ question, answer }: FaqItem) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={'bg-slate-50 rounded-2xl border border-slate-100'}>
            <button className={'w-full flex items-center justify-between p-6 text-left'} onClick={() => setIsOpen(!isOpen)}>
                <span className={'font-bold text-slate-800 text-[14px]'}>{question}</span>
                <div className={'text-indigo-500'}>{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </button>
            <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className={'px-6 text-slate-500 text-[13px] leading-relaxed'}>{answer}</div>
            </div>
        </div>
    );
};

const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('active')), { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return <div ref={ref} className={'reveal'}>{children}</div>;
};

export default () => {
    const [stats, setStats] = useState({ total_users: 0, total_servers: 0 });

    const badge = parseStringVar('--playground-badge', 'Pterodactyl + Elysium Theme');
    const brandName = parseStringVar('--playground-brand-name', 'Elysium Panel');
    const brandIcon = parseStringVar('--playground-brand-icon', 'Server');
    const heroTitle = parseStringVar('--playground-hero-title', 'Kelola Server Lebih Cepat dan Modern.');
    const heroDescription = parseStringVar('--playground-hero-description', 'Halaman playground untuk eksplorasi fitur panel.');
    const pricingTitle = parseStringVar('--playground-pricing-title', 'Paket Pricing Panel');
    const pricingSubtitle = parseStringVar('--playground-pricing-subtitle', 'Ringkasan paket server.');
    const faqBadge = parseStringVar('--playground-faq-badge', 'Pusat Bantuan');
    const faqTitle = parseStringVar('--playground-faq-title', 'Pertanyaan Populer');
    const faqSubtitle = parseStringVar('--playground-faq-subtitle', 'Jawaban seputar panel.');

    const pricingItems = useMemo(() => parseJsonVar<PricingItem[]>('--playground-pricing-items', []), []);
    const faqItems = useMemo(() => parseJsonVar<FaqItem[]>('--playground-faq-items', []), []);
    const visualCards = useMemo(() => parseJsonVar<VisualCard[]>('--playground-visual-cards', []), []);
    const footerLinks = useMemo(() => parseJsonVar<FooterLink[]>('--playground-footer-links', []), []);
    const socialLinks = useMemo(() => parseJsonVar<SocialLink[]>('--playground-social-links', []), []);

    useEffect(() => {
        fetch('/api/pterodactyl/playground/stats')
            .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load stats')))
            .then((data) => {
                setStats({
                    total_users: Number(data.total_users || 0),
                    total_servers: Number(data.total_servers || 0),
                });
            })
            .catch(() => {
                setStats({ total_users: 0, total_servers: 0 });
            });
    }, []);

    const visualDefaults: VisualCard[] = [
        { key: 'total_users', title: 'Total Users', description: 'Pengguna aktif di panel.' },
        { key: 'total_servers', title: 'Total Servers', description: 'Server aktif dikelola panel.' },
    ];

    const resolvedCards = (visualCards.length ? visualCards : visualDefaults).slice(0, 2);
    const getCardValue = (key: VisualCard['key']) => key === 'total_users' ? stats.total_users.toLocaleString('id-ID') : stats.total_servers.toLocaleString('id-ID');

    return (
        <>
            <style>{customStyles}</style>
            <Navbar brandName={brandName} brandIcon={brandIcon} footerLinks={footerLinks.length ? footerLinks : [{ label: 'Beranda', url: '#home' }, { label: 'Pricing', url: '#pricing' }, { label: 'FAQ', url: '#faq' }]} />

            <section id={'home'} className={'relative min-h-screen pt-28 pb-16 px-6 flex items-center overflow-hidden'}>
                <div className={'absolute -top-20 -right-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[140px] opacity-70'} />
                <div className={'absolute top-1/2 -left-20 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[120px] opacity-70'} />

                <div className={'max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 w-full'}>
                    <div className={'lg:col-span-6'}>
                        <ScrollReveal>
                            <div className={'inline-flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 rounded-full text-[11px] font-bold uppercase tracking-wider mb-8 border border-slate-100'}>
                                <span className={'w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse'} /> {badge}
                            </div>
                            <h1 className={'text-4xl md:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight'}>{heroTitle}</h1>
                            <p className={'text-slate-500 mb-10 max-w-lg text-[15px]'}>{heroDescription}</p>
                            <div className={'flex flex-wrap gap-4'}>
                                <a href={'/auth/login'} className={'bg-gradient-bright text-white px-7 py-3.5 rounded-2xl font-bold text-[14px]'}>Masuk ke Panel</a>
                                <a href={'/auth/register'} className={'bg-white text-slate-700 border border-slate-100 px-7 py-3.5 rounded-2xl font-bold text-[14px]'}>Daftar Akun Baru</a>
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className={'lg:col-span-6 relative flex justify-center items-center h-[500px]'}>
                        <div className={'relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] floating'}>
                            <div className={'absolute inset-0 bg-gradient-bright asymmetric-shape shadow-3xl opacity-90'} />

                            <div className={'absolute -top-8 -left-16 card-glass p-5 rounded-3xl shadow-2xl max-w-[230px] floating-delayed'}>
                                <p className={'text-[10px] uppercase tracking-widest text-slate-400 font-bold'}>{resolvedCards[0]?.title}</p>
                                <h3 className={'text-xl font-extrabold mt-1 mb-2 text-indigo-600'}>{getCardValue(resolvedCards[0]?.key || 'total_users')}</h3>
                                <p className={'text-[11px] text-slate-500'}>{resolvedCards[0]?.description}</p>
                            </div>

                            <div className={'absolute -bottom-8 -right-16 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 max-w-[220px]'}>
                                <p className={'text-[10px] uppercase tracking-widest text-slate-400 font-bold'}>{resolvedCards[1]?.title}</p>
                                <h3 className={'text-xl font-extrabold mt-1 mb-2 text-indigo-600'}>{getCardValue(resolvedCards[1]?.key || 'total_servers')}</h3>
                                <p className={'text-[11px] text-slate-500'}>{resolvedCards[1]?.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id={'pricing'} className={'py-24 px-6'}>
                <div className={'max-w-7xl mx-auto'}>
                    <div className={'text-center mb-16'}><ScrollReveal><h2 className={'text-3xl md:text-4xl font-extrabold mb-4 tracking-tight'}>{pricingTitle}</h2><p className={'text-slate-500 text-[14px]'}>{pricingSubtitle}</p></ScrollReveal></div>
                    <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                        {(pricingItems.length ? pricingItems : [{ name: 'Starter', price: 'Rp 15.000/bulan', description: 'Paket dasar panel.', features: ['Support cepat'] }]).map((item, idx) => (
                            <div key={`${item.name}-${idx}`} className={'bg-white rounded-[28px] p-8 border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)]'}>
                                <h3 className={'text-xl font-extrabold'}>{item.name}</h3><p className={'text-indigo-600 font-black text-2xl mt-2'}>{item.price}</p><p className={'text-slate-400 text-[13px] mt-3 mb-6'}>{item.description}</p>
                                <ul className={'space-y-3'}>{(item.features ?? []).map((feature) => <li key={feature} className={'flex items-center gap-2 text-[13px] text-slate-600'}><Check size={15} className={'text-green-500'} /> {feature}</li>)}</ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id={'faq'} className={'py-24 px-6 bg-white'}>
                <div className={'max-w-3xl mx-auto'}>
                    <div className={'text-center mb-16'}><ScrollReveal><span className={'text-indigo-600 font-bold text-[11px] uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full'}>{faqBadge}</span><h2 className={'text-3xl md:text-4xl font-extrabold mt-4 tracking-tight'}>{faqTitle}</h2><p className={'text-slate-500 text-[14px] mt-4'}>{faqSubtitle}</p></ScrollReveal></div>
                    <div className={'space-y-4'}>{(faqItems.length ? faqItems : [{ question: 'Apakah panel ini aman?', answer: 'Ya, aman untuk penggunaan harian.' }]).map((item, idx) => <FAQItem key={`${item.question}-${idx}`} question={item.question} answer={item.answer} />)}</div>
                </div>
            </section>

            <footer className={'bg-slate-900 pt-20 pb-10 px-6 text-white'}>
                <div className={'max-w-7xl mx-auto'}>
                    <div className={'grid grid-cols-1 md:grid-cols-3 gap-12 mb-16'}>
                        <div>
                            <div className={'flex items-center gap-2'}><IconByName name={brandIcon} size={16} /><span className={'font-extrabold text-xl'}>{brandName}</span></div>
                            <p className={'text-slate-400 text-[13px] mt-4'}>Custom interface untuk Pterodactyl Panel.</p>
                        </div>
                        <div>
                            <h4 className={'font-bold text-[14px] mb-4 uppercase tracking-widest text-indigo-400'}>Navigasi</h4>
                            <ul className={'space-y-2 text-slate-400 text-[13px]'}>
                                {(footerLinks.length ? footerLinks : [{ label: 'Beranda', url: '#home' }, { label: 'Pricing', url: '#pricing' }, { label: 'FAQ', url: '#faq' }]).map((link) => (
                                    <li key={`${link.label}-${link.url}`}><a href={link.url} className={'hover:text-white transition-colors'}>{link.label}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className={'font-bold text-[14px] mb-4 uppercase tracking-widest text-indigo-400'}>Sosial Media</h4>
                            <div className={'flex flex-wrap gap-3'}>
                                {(socialLinks.length ? socialLinks : [{ label: 'Website', url: '#', icon: 'Globe' }]).map((link) => (
                                    <a key={`${link.label}-${link.url}`} href={link.url} title={link.label} className={'w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600'}>
                                        <IconByName name={link.icon} size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};
