import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import {
    Globe,
    Layers,
    Cloud,
    CheckCircle2,
    XCircle,
    Copy,
    RefreshCw,
    Terminal,
    AlertTriangle,
    Check,
    Radio,
    Activity,
    Lock,
    Play,
    Zap,
} from 'lucide-react';
import getDomain from '@/api/server/domain/getDomain';
import setSubdomainApi from '@/api/server/domain/setSubdomain';
import setCustomDomainApi from '@/api/server/domain/setCustomDomain';
import disableDomainApi from '@/api/server/domain/disableDomain';
import getDomainLogsApi from '@/api/server/domain/getDomainLogs';
import getDomainHealthApi, { DomainHealthResult } from '@/api/server/domain/getDomainHealth';
import { ServerDomainData } from '@/api/server/domain/types';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [domainData, setDomainData] = useState<ServerDomainData | null>(null);

    // Active Tab: 'subdomain' | 'custom'
    const [activeTab, setActiveTab] = useState<'subdomain' | 'custom'>('subdomain');

    // Subdomain Form
    const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
    const [subdomainInput, setSubdomainInput] = useState('');

    // Custom Domain Form
    const [customDomainInput, setCustomDomainInput] = useState('');
    const [tunnelTokenInput, setTunnelTokenInput] = useState('');

    // Live Health & Logs
    const [healthResult, setHealthResult] = useState<DomainHealthResult | null>(null);
    const [healthChecking, setHealthChecking] = useState(false);
    const [logs, setLogs] = useState<string>('');
    const [logsLoading, setLogsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const loadData = () => {
        clearFlashes('domain');
        getDomain(uuid)
            .then((data) => {
                setDomainData(data);
                if (data.mode === 'custom') {
                    setActiveTab('custom');
                } else {
                    setActiveTab('subdomain');
                }

                if (data.domain_pool_id) {
                    setSelectedPoolId(data.domain_pool_id);
                } else if (data.available_pools && data.available_pools.length > 0) {
                    setSelectedPoolId(data.available_pools[0].id);
                }

                if (data.subdomain) {
                    setSubdomainInput(data.subdomain);
                }

                if (data.custom_domain) {
                    setCustomDomainInput(data.custom_domain);
                }
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'domain', error });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchHealth = () => {
        setHealthChecking(true);
        getDomainHealthApi(uuid)
            .then((res) => {
                setHealthResult(res);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setHealthChecking(false);
            });
    };

    const fetchLogs = () => {
        setLogsLoading(true);
        getDomainLogsApi(uuid)
            .then((logText) => {
                setLogs(logText);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLogsLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, [uuid]);

    useEffect(() => {
        if (domainData?.is_active) {
            fetchHealth();
        }
        if (domainData?.mode === 'custom' && domainData?.is_active) {
            fetchLogs();
        }
    }, [domainData?.is_active, domainData?.mode]);

    // Handle Subdomain Submit / Re-activate
    const handleSubdomainSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPoolId || !subdomainInput.trim()) {
            addFlash({
                key: 'domain',
                type: 'error',
                message: 'Silakan pilih domain master dan masukkan nama subdomain.',
            });
            return;
        }

        setSubmitting(true);
        clearFlashes('domain');

        setSubdomainApi(uuid, selectedPoolId, subdomainInput.trim())
            .then((res) => {
                addFlash({
                    key: 'domain',
                    type: 'success',
                    message: res.message || 'Subdomain berhasil diaktifkan!',
                });
                loadData();
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'domain', error });
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    // Handle Custom Domain Submit / Re-activate
    const handleCustomDomainSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customDomainInput.trim()) {
            addFlash({
                key: 'domain',
                type: 'error',
                message: 'Silakan masukkan nama domain kustom Anda.',
            });
            return;
        }

        if (!tunnelTokenInput.trim() && !domainData?.has_tunnel_token) {
            addFlash({
                key: 'domain',
                type: 'error',
                message: 'Token Cloudflare Tunnel wajib diisi saat konfigurasi awal.',
            });
            return;
        }

        setSubmitting(true);
        clearFlashes('domain');

        setCustomDomainApi(uuid, customDomainInput.trim(), tunnelTokenInput.trim())
            .then((res) => {
                addFlash({
                    key: 'domain',
                    type: 'success',
                    message: res.message || 'Domain kustom berhasil dihubungkan!',
                });
                setTunnelTokenInput('');
                loadData();
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'domain', error });
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    // Handle Disable / Turn Off Domain (Preserves data)
    const handleDisable = () => {
        if (!confirm('Nonaktifkan routing domain? DNS record di Cloudflare / Tunnel akan dimatikan dari jaringan, tetapi pengaturan Anda tetap tersimpan.')) {
            return;
        }

        setSubmitting(true);
        clearFlashes('domain');

        disableDomainApi(uuid)
            .then((res) => {
                addFlash({
                    key: 'domain',
                    type: 'warning',
                    message: res.message || 'Domain dinonaktifkan. Pengaturan Anda tetap tersimpan dan siap diaktifkan kembali kapan saja.',
                });
                setHealthResult(null);
                loadData();
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'domain', error });
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <Spinner size={'large'} centered />;
    }

    if (domainData?.feature_enabled === false) {
        return (
            <ServerContentBlock title={'Domain Configuration'}>
                <div className={'bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center shadow-xl'}>
                    <div className={'w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4'}>
                        <Lock size={28} />
                    </div>
                    <h2 className={'text-lg font-bold text-neutral-100'}>Fitur Domain Tidak Tersedia</h2>
                    <p className={'text-sm text-neutral-400 max-w-md mx-auto mt-2'}>
                        Fitur domain atau routing Cloudflare tidak diizinkan untuk server ini. Silakan hubungi administrator panel untuk mengaktifkan izin domain pada server Anda.
                    </p>
                </div>
            </ServerContentBlock>
        );
    }

    const isSubdomainActive = domainData?.mode === 'subdomain' && domainData?.is_active;
    const isCustomActive = domainData?.mode === 'custom' && domainData?.is_active;
    const hasSavedSubdomain = !!domainData?.subdomain;
    const hasSavedCustom = !!domainData?.custom_domain;

    const selectedPool = domainData?.available_pools.find((p) => p.id === selectedPoolId);
    const previewDomain = subdomainInput.trim() && selectedPool ? `${subdomainInput.trim().toLowerCase()}.${selectedPool.domain}` : null;

    return (
        <ServerContentBlock title={'Domain Configuration'}>
            <FlashMessageRender byKey={'domain'} className={'mb-4'} />

            {/* Top Overview Card */}
            <div className={'bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-6 shadow-xl'}>
                <div className={'flex flex-wrap items-center justify-between gap-4'}>
                    <div className={'flex items-center gap-3.5'}>
                        <div className={'p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}>
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className={'text-lg font-bold text-neutral-100'}>Konfigurasi Domain & Jaringan</h2>
                            <p className={'text-xs text-neutral-400 mt-0.5'}>
                                Hubungkan subdomain panel otomatis atau domain kustom Cloudflare Tunnel ke port server ini.
                            </p>
                        </div>
                    </div>

                    <div className={'flex flex-wrap items-center gap-2.5'}>
                        {domainData?.allocation && (
                            <div className={'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs font-mono text-neutral-300'}>
                                <Radio size={13} className={'text-emerald-400 animate-pulse'} />
                                <span>Target: {domainData.allocation.ip}:{domainData.allocation.port}</span>
                            </div>
                        )}

                        {domainData?.is_active ? (
                            <span className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}>
                                <CheckCircle2 size={13} />
                                {domainData.mode === 'subdomain' ? 'Subdomain Aktif' : 'Custom Domain Aktif'}
                            </span>
                        ) : (
                            <span className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-800/80 text-neutral-400 border border-neutral-700'}>
                                <XCircle size={13} />
                                Domain Nonaktif (Tersimpan)
                            </span>
                        )}
                    </div>
                </div>

                {/* Active Domain Highlight Banner */}
                {domainData?.is_active && (
                    <div className={'mt-4 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60 p-4 rounded-xl'}>
                        <div className={'min-w-0'}>
                            <span className={'text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-0.5'}>
                                Alamat Domain Aktif:
                            </span>
                            <div className={'flex items-center gap-2'}>
                                <span className={'text-base font-extrabold text-cyan-300 tracking-tight truncate'}>
                                    {domainData.mode === 'subdomain' ? domainData.full_subdomain : domainData.custom_domain}
                                </span>
                            </div>
                        </div>

                        <div className={'flex items-center gap-2'}>
                            <button
                                type={'button'}
                                onClick={() => handleCopy(domainData.mode === 'subdomain' ? (domainData.full_subdomain || '') : (domainData.custom_domain || ''))}
                                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700'}
                            >
                                {copied ? <Check size={13} className={'text-emerald-400'} /> : <Copy size={13} />}
                                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                            </button>

                            <button
                                type={'button'}
                                onClick={fetchHealth}
                                disabled={healthChecking}
                                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-cyan-300 transition-colors border border-neutral-700'}
                            >
                                <Activity size={13} className={healthChecking ? 'animate-spin' : ''} />
                                <span>Cek Status</span>
                            </button>

                            <button
                                type={'button'}
                                onClick={handleDisable}
                                disabled={submitting}
                                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20'}
                            >
                                <XCircle size={13} />
                                <span>Matikan</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Health Check Status Card */}
                {healthResult && (
                    <div className={'mt-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs flex items-center justify-between gap-3'}>
                        <div className={'flex items-center gap-2.5 min-w-0'}>
                            <Zap size={15} className={healthResult.connected ? 'text-emerald-400' : 'text-amber-400'} />
                            <span className={'text-neutral-300'}>{healthResult.message}</span>
                        </div>
                        {healthResult.latency_ms !== undefined && (
                            <span className={'px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-neutral-400'}>
                                {healthResult.latency_ms} ms
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Mode Selection Tabs */}
            <div className={'flex items-center gap-2 p-1.5 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-6 w-full max-w-md'}>
                <button
                    type={'button'}
                    onClick={() => setActiveTab('subdomain')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'subdomain'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                >
                    <Layers size={14} />
                    <span>Subdomain Panel</span>
                    {isSubdomainActive && <span className={'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />}
                </button>

                <button
                    type={'button'}
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'custom'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                >
                    <Cloud size={14} />
                    <span>Custom Domain</span>
                    {isCustomActive && <span className={'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />}
                </button>
            </div>

            {/* TAB 1: Subdomain Panel */}
            {activeTab === 'subdomain' && (
                <div className={'bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl'}>
                    <div className={'flex items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800'}>
                        <div>
                            <h3 className={'text-base font-bold text-neutral-100 flex items-center gap-2'}>
                                <Layers size={18} className={'text-cyan-400'} />
                                <span>Subdomain Gratis Panel</span>
                            </h3>
                            <p className={'text-xs text-neutral-400 mt-1'}>
                                Buat subdomain instan dari daftar domain utama yang telah disediakan oleh administrator.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubdomainSubmit}>
                        <div className={'space-y-4'}>
                            <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                                <div>
                                    <label className={'block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2'}>
                                        Pilih Master Domain
                                    </label>
                                    <select
                                        value={selectedPoolId || ''}
                                        onChange={(e) => setSelectedPoolId(Number(e.target.value))}
                                        className={'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors'}
                                        required
                                    >
                                        {domainData?.available_pools.map((pool) => (
                                            <option key={pool.id} value={pool.id}>
                                                .{pool.domain} ({pool.record_type} - {pool.protocol.toUpperCase()})
                                            </option>
                                        ))}
                                    </select>
                                    {(!domainData?.available_pools || domainData.available_pools.length === 0) && (
                                        <p className={'text-[11px] text-amber-400 mt-1.5'}>
                                            Belum ada master domain yang didaftarkan oleh admin di panel.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={'block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2'}>
                                        Nama Subdomain (Prefix)
                                    </label>
                                    <input
                                        type={'text'}
                                        value={subdomainInput}
                                        onChange={(e) => setSubdomainInput(e.target.value)}
                                        placeholder={'Contoh: survival atau play'}
                                        className={'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors'}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Real-time Subdomain Preview */}
                            {previewDomain && (
                                <div className={'p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs'}>
                                    <span className={'text-neutral-400'}>Pratinjau Alamat Lengkap:</span>
                                    <code className={'font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20'}>
                                        {previewDomain}
                                    </code>
                                </div>
                            )}

                            <div className={'p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2.5'}>
                                <AlertTriangle size={16} className={'text-amber-400 shrink-0 mt-0.5'} />
                                <span>
                                    Mengaktifkan subdomain ini akan secara otomatis menonaktifkan dan membersihkan custom domain / tunnel jika sebelumnya aktif.
                                </span>
                            </div>

                            <div className={'pt-2 flex justify-end gap-3'}>
                                {isSubdomainActive ? (
                                    <>
                                        <button
                                            type={'button'}
                                            onClick={handleDisable}
                                            disabled={submitting}
                                            className={'px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors'}
                                        >
                                            Matikan Subdomain
                                        </button>

                                        <button
                                            type={'submit'}
                                            disabled={submitting || !domainData?.available_pools || domainData.available_pools.length === 0}
                                            className={'px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'}
                                        >
                                            {submitting && <Spinner size={'small'} />}
                                            <span>Perbarui Subdomain</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type={'submit'}
                                        disabled={submitting || !domainData?.available_pools || domainData.available_pools.length === 0}
                                        className={'px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'}
                                    >
                                        {submitting && <Spinner size={'small'} />}
                                        <Play size={13} />
                                        <span>{hasSavedSubdomain ? 'Aktifkan Kembali Subdomain' : 'Aktifkan Subdomain'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 2: Custom Domain with Cloudflare Tunnel */}
            {activeTab === 'custom' && (
                <div className={'bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl'}>
                    <div className={'flex items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800'}>
                        <div>
                            <h3 className={'text-base font-bold text-neutral-100 flex items-center gap-2'}>
                                <Cloud size={18} className={'text-cyan-400'} />
                                <span>Custom Domain (Cloudflare Zero Trust / Tunnel)</span>
                            </h3>
                            <p className={'text-xs text-neutral-400 mt-1'}>
                                Hubungkan nama domain pribadi Anda menggunakan koneksi aman Cloudflare Tunnel tanpa port forwarding.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleCustomDomainSubmit}>
                        <div className={'space-y-4'}>
                            <div>
                                <label className={'block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2'}>
                                    Nama Domain Kustom
                                </label>
                                <input
                                    type={'text'}
                                    value={customDomainInput}
                                    onChange={(e) => setCustomDomainInput(e.target.value)}
                                    placeholder={'Contoh: mc.domainpribadi.com atau bot.example.org'}
                                    className={'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors'}
                                    required
                                />
                            </div>

                            <div>
                                <label className={'block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2'}>
                                    Cloudflare Tunnel Token
                                </label>
                                <textarea
                                    value={tunnelTokenInput}
                                    onChange={(e) => setTunnelTokenInput(e.target.value)}
                                    placeholder={domainData?.has_tunnel_token ? '(Token sudah tersimpan - kosongkan jika tidak ingin diubah)' : 'Tempel token Cloudflare Tunnel Anda di sini (diawali eyJh...)'}
                                    rows={3}
                                    className={'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors'}
                                    required={!domainData?.has_tunnel_token}
                                />
                                <p className={'text-[11px] text-neutral-500 mt-1'}>
                                    Dapatkan token dari Cloudflare Zero Trust Dashboard ➔ <strong>Access ➔ Tunnels ➔ Create Tunnel ➔ Install and run a connector</strong>.
                                </p>
                            </div>

                            <div className={'p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2.5'}>
                                <AlertTriangle size={16} className={'text-amber-400 shrink-0 mt-0.5'} />
                                <span>
                                    Mengaktifkan domain kustom ini akan secara otomatis menonaktifkan subdomain lama dari server ini.
                                </span>
                            </div>

                            <div className={'pt-2 flex justify-end gap-3'}>
                                {isCustomActive ? (
                                    <>
                                        <button
                                            type={'button'}
                                            onClick={handleDisable}
                                            disabled={submitting}
                                            className={'px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors'}
                                        >
                                            Matikan Tunnel
                                        </button>

                                        <button
                                            type={'submit'}
                                            disabled={submitting}
                                            className={'px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'}
                                        >
                                            {submitting && <Spinner size={'small'} />}
                                            <span>Perbarui Custom Domain</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type={'submit'}
                                        disabled={submitting}
                                        className={'px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'}
                                    >
                                        {submitting && <Spinner size={'small'} />}
                                        <Play size={13} />
                                        <span>{hasSavedCustom ? 'Aktifkan Kembali Custom Domain' : 'Hubungkan Custom Domain'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Cloudflared Live Logs Console */}
                    {isCustomActive && (
                        <div className={'mt-6 pt-6 border-t border-neutral-800'}>
                            <div className={'flex items-center justify-between mb-3'}>
                                <div className={'flex items-center gap-2 text-xs font-bold text-neutral-300'}>
                                    <Terminal size={15} className={'text-cyan-400'} />
                                    <span>Cloudflared Live Logs</span>
                                </div>
                                <button
                                    type={'button'}
                                    onClick={fetchLogs}
                                    disabled={logsLoading}
                                    className={'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors'}
                                >
                                    <RefreshCw size={12} className={logsLoading ? 'animate-spin' : ''} />
                                    <span>Refresh Logs</span>
                                </button>
                            </div>

                            <div className={'bg-black/90 border border-neutral-800/90 rounded-xl p-3.5 font-mono text-xs text-neutral-300 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner'}>
                                {logs || 'Sedang memuat log tunnel...'}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </ServerContentBlock>
    );
};
