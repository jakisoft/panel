import { action, Action } from 'easy-peasy';

export interface CSContactItem {
    id?: string;
    name: string;
    url: string;
    icon: string;
}

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
        items: CSContactItem[];
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
