import React, { useEffect, useRef, useState } from 'react';
import {
    Award,
    BookOpen,
    Check,
    ChevronDown,
    ChevronUp,
    Github,
    Globe,
    GraduationCap,
    Instagram,
    Loader2,
    Mail,
    MoreHorizontal,
    Server,
    ShieldCheck,
    Sparkles,
    Twitter,
    UserPlus,
} from 'lucide-react';

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    --bright-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #fcfcfd;
    color: #1a1a1a;
    overflow-x: hidden;
  }

  .text-gradient {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .bg-gradient-bright { background: var(--bright-gradient); }
  .asymmetric-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
  .card-glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 1); }
  .floating { animation: floating 5s ease-in-out infinite; }
  @keyframes floating { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-15px);} }
  .floating-delayed { animation: floating 7s ease-in-out infinite; animation-delay: 1s; }
  .glass-nav { background: rgba(255,255,255,0.6); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.4); }
  .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
  .reveal.active { opacity: 1; transform: translateY(0); }
`;

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={'fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 transition-all duration-500'}>
            <div
                className={`glass-nav rounded-2xl px-5 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 ${
                    isScrolled ? 'py-2 scale-95' : 'py-2.5 scale-100'
                }`}
            >
                <div className={'flex items-center gap-2'}>
                    <div className={'w-7 h-7 bg-gradient-bright rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200'}>
                        <Server size={16} />
                    </div>
                    <span className={'font-bold text-lg tracking-tight'}>
                        Elysium <span className={'text-indigo-600'}>Panel</span>
                    </span>
                </div>
                <div className={'hidden md:flex items-center gap-7 font-semibold text-[13px] text-slate-500'}>
                    <a href={'#home'} className={'hover:text-indigo-600 transition-colors'}>
                        Beranda
                    </a>
                    <a href={'#pricing'} className={'hover:text-indigo-600 transition-colors'}>
                        Fitur
                    </a>
                    <a href={'#faq'} className={'hover:text-indigo-600 transition-colors'}>
                        FAQ
                    </a>
                </div>
                <div className={'flex items-center gap-3'}>
                    <a href={'/auth/login'} className={'text-[13px] font-bold text-slate-600 hover:text-indigo-600 px-3 transition-all'}>
                        Masuk
                    </a>
                    <a
                        href={'/auth/register'}
                        className={'bg-slate-900 text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-indigo-600 transition-all shadow-md active:scale-95'}
                    >
                        Daftar
                    </a>
                </div>
            </div>
        </nav>
    );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={'bg-slate-50 rounded-2xl border border-slate-100 transition-all duration-300'}>
            <button className={'w-full flex items-center justify-between p-6 text-left focus:outline-none'} onClick={() => setIsOpen(!isOpen)}>
                <span className={'font-bold text-slate-800 text-[14px]'}>{question}</span>
                <div className={'text-indigo-500'}>{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </button>
            <div className={`overflow-hidden transition-all duration-400 ease-in-out ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className={'px-6 text-slate-500 text-[13px] leading-relaxed'}>{answer}</div>
            </div>
        </div>
    );
};

const FooterNewsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3500);
        }, 1200);
    };

    return (
        <div className={'space-y-5'}>
            <h4 className={'font-bold text-[14px] uppercase tracking-widest text-indigo-400 flex items-center gap-2'}>
                <Sparkles size={14} /> Update Panel
            </h4>
            <p className={'text-slate-400 text-[13px] leading-relaxed'}>
                Dapatkan update fitur terbaru Elysium Theme, maintenance, dan rilis panel.
            </p>

            <form onSubmit={handleSubmit} className={'space-y-3'}>
                <div className={'flex flex-col gap-3'}>
                    <input
                        type={'email'}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={'Alamat email Anda'}
                        className={'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm w-full outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-500'}
                        disabled={status !== 'idle'}
                    />
                    <button
                        type={'submit'}
                        disabled={status !== 'idle'}
                        className={'w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-[13px] hover:bg-indigo-500 transition-all disabled:bg-slate-700 disabled:cursor-not-allowed shadow-lg active:scale-[0.98] flex justify-center items-center'}
                    >
                        {status === 'loading' ? <Loader2 size={18} className={'animate-spin'} /> : 'Berlangganan'}
                    </button>
                </div>

                <div className={`transition-all duration-300 ${status === 'success' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>
                    <div className={'bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2'}>
                        <Check size={14} className={'text-green-500'} />
                        <p className={'text-green-400 text-[11px] font-medium'}>Email Anda telah terdaftar.</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('active');
                });
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={'reveal'}>
            {children}
        </div>
    );
};

export default () => (
    <>
        <style>{customStyles}</style>

        <Navbar />

        <section id={'home'} className={'relative min-h-screen pt-28 pb-16 px-6 flex items-center overflow-hidden'}>
            <div className={'absolute -top-20 -right-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[140px] opacity-70'} />
            <div className={'absolute top-1/2 -left-20 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[120px] opacity-70'} />

            <div className={'max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 w-full'}>
                <div className={'lg:col-span-6'}>
                    <ScrollReveal>
                        <div className={'inline-flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 rounded-full text-[11px] font-bold uppercase tracking-wider mb-8 border border-slate-100 shadow-sm'}>
                            <span className={'w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse'} />
                            Pterodactyl + Elysium Theme
                        </div>
                        <h1 className={'text-4xl md:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight'}>
                            Kelola Server <br /> <span className={'text-gradient'}>Lebih Cepat</span> dan Modern.
                        </h1>
                        <p className={'text-slate-500 mb-10 max-w-lg text-[15px]'}>
                            Halaman playground untuk eksplorasi fitur panel, status server, keamanan akun, dan pembaruan Elysium Theme.
                        </p>
                        <div className={'flex flex-wrap gap-4'}>
                            <a href={'/auth/login'} className={'bg-gradient-bright text-white px-7 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 text-[14px]'}>
                                Masuk ke Panel
                            </a>
                            <a href={'/auth/register'} className={'bg-white text-slate-700 border border-slate-100 px-7 py-3.5 rounded-2xl font-bold hover:bg-slate-50 transition-all text-[14px]'}>
                                Daftar Akun Baru
                            </a>
                        </div>
                    </ScrollReveal>
                </div>

                <div className={'lg:col-span-6 relative flex justify-center items-center h-[500px]'}>
                    <div className={'relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] floating'}>
                        <div className={'absolute inset-0 bg-gradient-bright asymmetric-shape shadow-3xl opacity-90'} />

                        <div className={'absolute -bottom-6 -left-12 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 max-w-[220px]'}>
                            <div className={'flex items-center gap-3 mb-2'}>
                                <div className={'w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600'}>
                                    <ShieldCheck size={16} />
                                </div>
                                <span className={'font-bold text-[13px]'}>Keamanan Aktif</span>
                            </div>
                            <p className={'text-[11px] text-slate-500 leading-tight'}>
                                2FA, checkpoint login, dan audit activity siap melindungi panel Anda.
                            </p>
                        </div>

                        <div className={'absolute -top-4 -right-16 card-glass p-5 rounded-3xl shadow-2xl max-w-[230px] floating-delayed'}>
                            <div className={'flex justify-between items-center mb-4'}>
                                <span className={'text-[11px] font-bold text-slate-400 uppercase tracking-widest'}>Realtime Panel Feed</span>
                                <span className={'w-2 h-2 rounded-full bg-red-500 animate-ping'} />
                            </div>
                            <div className={'space-y-3'}>
                                <div className={'flex items-center gap-3'}>
                                    <div className={'w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500'}>
                                        <UserPlus size={14} />
                                    </div>
                                    <div>
                                        <p className={'text-[11px] font-bold'}>@panel_admin</p>
                                        <p className={'text-[10px] text-slate-400'}>Update server berhasil</p>
                                    </div>
                                </div>
                                <div className={'flex items-center gap-3 opacity-60'}>
                                    <div className={'w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500'}>
                                        <UserPlus size={14} />
                                    </div>
                                    <div>
                                        <p className={'text-[11px] font-bold'}>@devops_team</p>
                                        <p className={'text-[10px] text-slate-400'}>Maintenance terjadwal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={'absolute inset-0 flex items-center justify-center'}>
                            <GraduationCap size={80} className={'text-white/40'} />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id={'pricing'} className={'py-24 px-6 relative'}>
            <div className={'max-w-7xl mx-auto'}>
                <div className={'text-center mb-16'}>
                    <ScrollReveal>
                        <h2 className={'text-3xl md:text-4xl font-extrabold mb-4 tracking-tight'}>Paket Informasi Panel</h2>
                        <p className={'text-slate-500 text-[14px]'}>Ringkasan fitur utama Pterodactyl + Elysium Theme.</p>
                    </ScrollReveal>
                </div>

                <div className={'flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto'}>
                    <div className={'flex-1 bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]'}>
                        <ScrollReveal>
                            <div className={'flex justify-between items-start mb-10'}>
                                <div className={'w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600'}>
                                    <BookOpen size={24} />
                                </div>
                                <span className={'bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest'}>Core</span>
                            </div>
                            <h3 className={'text-xl font-bold mb-2'}>Fitur Pengguna</h3>
                            <p className={'text-slate-400 text-[13px] mb-8'}>Console, file manager, backup, database, schedule, dan activity log.</p>
                            <ul className={'space-y-4 mb-10'}>
                                {['Manajemen Server Real-time', 'Resource Monitoring', 'Kontrol Startup & Network'].map((item) => (
                                    <li key={item} className={'flex items-center gap-3 text-[13px] text-slate-600'}>
                                        <Check size={16} className={'text-green-500'} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </ScrollReveal>
                    </div>

                    <div className={'flex-1 bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-indigo-200 relative overflow-hidden'}>
                        <ScrollReveal>
                            <div className={'flex justify-between items-start mb-10 relative z-10'}>
                                <div className={'w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white'}>
                                    <Award size={24} />
                                </div>
                                <span className={'bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest'}>Theme</span>
                            </div>
                            <h3 className={'text-xl font-bold mb-2 text-white'}>Elysium Enhancements</h3>
                            <p className={'text-slate-400 text-[13px] mb-8'}>Custom auth UI, color management, announcement, social auth, dan playground.</p>
                            <ul className={'space-y-4 mb-10'}>
                                {['Upload Logo & Background', 'Social Login Google/GitHub', 'Color Live Preview'].map((item) => (
                                    <li key={item} className={'flex items-center gap-3 text-[13px] text-indigo-100'}>
                                        <Check size={16} className={'text-indigo-400'} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>

        <section id={'faq'} className={'py-24 px-6 bg-white'}>
            <div className={'max-w-3xl mx-auto'}>
                <div className={'text-center mb-16'}>
                    <ScrollReveal>
                        <span className={'text-indigo-600 font-bold text-[11px] uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full'}>
                            Pusat Bantuan
                        </span>
                        <h2 className={'text-3xl md:text-4xl font-extrabold mt-4 tracking-tight'}>Pertanyaan Populer</h2>
                    </ScrollReveal>
                </div>

                <div className={'space-y-4'}>
                    <FAQItem
                        question={'Apa itu halaman playground?'}
                        answer={'Playground adalah landing publik sebelum login yang menampilkan ringkasan fitur panel dan akses cepat ke Login/Daftar.'}
                    />
                    <FAQItem
                        question={'Apakah social login langsung membuat user baru?'}
                        answer={'Tidak. Login Google/GitHub hanya diizinkan jika email social tersebut sudah terdaftar sebagai user panel.'}
                    />
                    <FAQItem
                        question={'Siapa developer tema ini?'}
                        answer={'Tema ini adalah Elysium Theme by JKSoft Production dengan integrasi ke Pterodactyl Panel.'}
                    />
                </div>
            </div>
        </section>

        <footer className={'bg-slate-900 pt-20 pb-10 px-6 text-white overflow-hidden relative'}>
            <div className={'absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full'} />
            <div className={'max-w-7xl mx-auto relative z-10'}>
                <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16'}>
                    <div className={'space-y-6'}>
                        <div className={'flex items-center gap-2'}>
                            <div className={'w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg'}>
                                <Github size={16} />
                            </div>
                            <span className={'font-extrabold text-xl tracking-tight'}>
                                Elysium <span className={'text-indigo-400'}>Theme</span>
                            </span>
                        </div>
                        <p className={'text-slate-400 text-[13px] leading-relaxed'}>
                            Custom interface untuk Pterodactyl Panel by JKSoft Production.
                        </p>
                        <div className={'flex gap-4'}>
                            {[Twitter, Mail, Instagram].map((Icon, idx) => (
                                <a key={idx} href={'#'} className={'w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white text-slate-400 transition-all border border-white/5'}>
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className={'font-bold text-[14px] mb-6 uppercase tracking-widest text-indigo-400'}>Panel</h4>
                        <ul className={'space-y-4 text-slate-400 text-[13px]'}>
                            {['Server Management', 'Account Security', 'Backup & Restore'].map((link) => (
                                <li key={link}>
                                    <a href={'#'} className={'hover:text-white transition-colors'}>
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className={'font-bold text-[14px] mb-6 uppercase tracking-widest text-indigo-400'}>Developer</h4>
                        <ul className={'space-y-4 text-slate-400 text-[13px]'}>
                            {['JKSoft Production', 'Elysium Theme', 'Support & Docs'].map((link) => (
                                <li key={link}>
                                    <a href={'#'} className={'hover:text-white transition-colors'}>
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <FooterNewsletter />
                </div>

                <div className={'pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6'}>
                    <p className={'text-[12px] text-slate-500 italic'}>© 2026 Elysium Theme for Pterodactyl Panel.</p>
                    <div className={'flex items-center gap-2 text-slate-500 text-[12px]'}>
                        <Globe size={14} />
                        <span>Bahasa Indonesia (ID)</span>
                    </div>
                </div>
            </div>
        </footer>
    </>
);
