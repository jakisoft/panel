import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    logo?: string;
    logo_display?: 'both' | 'logo_only' | 'text_only';
    favicon?: string;
    footer_url?: string;
    locale: string;
    recaptcha: {
        enabled: boolean;
        siteKey: string;
    };
    cs_contact?: {
        enabled: boolean;
        title: string;
        subtitle: string;
        whatsapp?: string;
        telegram?: string;
        discord?: string;
        email?: string;
    };
    social_links?: {
        enabled: boolean;
        github?: string;
        tiktok?: string;
        instagram?: string;
    };
}

export interface SettingsStore {
    data?: SiteSettings;
    setSettings: Action<SettingsStore, SiteSettings>;
}

const settings: SettingsStore = {
    data: undefined,

    setSettings: action((state, payload) => {
        state.data = payload;
    }),
};

export default settings;
