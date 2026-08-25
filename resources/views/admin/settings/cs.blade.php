@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'cs'])

@section('title')
    CS Contact & Social Links
@endsection

@section('content-header')
    <h1><i class="fa fa-headphones text-primary"></i> CS Contact & Social Links <small>Kelola tombol Customer Support mengambang dan tautan sosial media footer.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">CS Contact</li>
    </ol>
@endsection

@section('content')
@yield('settings::nav')

<style>
    .switch-toggle-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .switch-toggle {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
        margin-bottom: 0;
        cursor: pointer;
    }
    .switch-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .switch-slider {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #cbd5e1;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 26px;
    }
    .switch-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    input:checked + .switch-slider {
        background-color: #10b981;
    }
    input:checked + .switch-slider:before {
        transform: translateX(22px);
    }
    .brand-icon-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: white;
    }
</style>

<form action="{{ route('admin.settings.cs') }}" method="POST">
    {!! csrf_field() !!}
    {!! method_field('PATCH') !!}

    <div class="row">
        <!-- Card 1: Floating CS Contact Button & Dropup -->
        <div class="col-xs-12 col-md-6">
            <div class="box box-primary" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700; font-size: 16px;">
                            <i class="fa fa-headphones text-primary"></i> Floating CS Contact Button
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Tombol bantuan di pojok kanan bawah halaman utama panel.</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" name="cs_enabled" value="1" @if($cs['enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 18px;">
                    <div class="row">
                        <div class="form-group col-xs-12 col-sm-6">
                            <label class="control-label">Judul CS (Title)</label>
                            <input type="text" class="form-control" name="cs_title" value="{{ old('cs_title', $cs['title']) }}" placeholder="Customer Support" />
                            <p class="text-muted"><small>Judul header pada popover/dropup kontak CS.</small></p>
                        </div>
                        <div class="form-group col-xs-12 col-sm-6">
                            <label class="control-label">Subjudul CS (Subtitle)</label>
                            <input type="text" class="form-control" name="cs_subtitle" value="{{ old('cs_subtitle', $cs['subtitle']) }}" placeholder="Butuh bantuan? Hubungi kami" />
                            <p class="text-muted"><small>Keterangan singkat di bawah judul.</small></p>
                        </div>
                    </div>

                    <hr style="margin: 10px 0 15px 0;">
                    <h5 style="font-weight: 600; margin-bottom: 12px; color: #475569;">Saluran Kontak CS</h5>

                    <!-- WhatsApp -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background-color: #25D366;"><i class="fa fa-whatsapp"></i> WhatsApp</span>
                            Nomor / Link WhatsApp
                        </label>
                        <input type="text" class="form-control" name="cs_whatsapp" value="{{ old('cs_whatsapp', $cs['whatsapp']) }}" placeholder="Contoh: 6281234567890 atau https://wa.me/6281234567890" />
                        <p class="text-muted"><small>Format nomor dengan kode negara (contoh: 62812...) atau link wa.me langsung. Kosongkan jika tidak aktif.</small></p>
                    </div>

                    <!-- Telegram -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background-color: #229ED9;"><i class="fa fa-paper-plane"></i> Telegram</span>
                            Username / Link Telegram
                        </label>
                        <input type="text" class="form-control" name="cs_telegram" value="{{ old('cs_telegram', $cs['telegram']) }}" placeholder="Contoh: CS_Helpdesk atau https://t.me/CS_Helpdesk" />
                        <p class="text-muted"><small>Username Telegram (tanpa @) atau link https://t.me/.... Kosongkan jika tidak aktif.</small></p>
                    </div>

                    <!-- Discord -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background-color: #5865F2;"><i class="fa fa-comments"></i> Discord</span>
                            Link Server Discord / Invite
                        </label>
                        <input type="text" class="form-control" name="cs_discord" value="{{ old('cs_discord', $cs['discord']) }}" placeholder="Contoh: https://discord.gg/invite_code" />
                        <p class="text-muted"><small>Tautan undangan server Discord support Anda. Kosongkan jika tidak aktif.</small></p>
                    </div>

                    <!-- Email -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background-color: #EA4335;"><i class="fa fa-envelope"></i> Email</span>
                            Email Customer Support
                        </label>
                        <input type="email" class="form-control" name="cs_email" value="{{ old('cs_email', $cs['email']) }}" placeholder="Contoh: support@domain.com" />
                        <p class="text-muted"><small>Alamat email untuk menerima pertanyaan bantuan dari klien.</small></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 2: Footer Social Links (Sudut Kiri Footer) -->
        <div class="col-xs-12 col-md-6">
            <div class="box box-info" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700; font-size: 16px;">
                            <i class="fa fa-share-alt text-info"></i> Footer Social Links (Sudut Kiri)
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Ikon sosial media resmi (GitHub, TikTok, Instagram) di sudut kiri footer.</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" name="footer_social_enabled" value="1" @if($footer['social_enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 18px;">
                    <div class="alert alert-info" style="border-radius: 6px; font-size: 13px;">
                        <i class="fa fa-info-circle"></i> Ikon sosial media ini akan tampil di <strong>sudut kiri footer</strong> dengan warna brand asli masing-masing platform.
                    </div>

                    <!-- GitHub -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background-color: #24292e;"><i class="fa fa-github"></i> GitHub</span>
                            URL Profil / Repository GitHub
                        </label>
                        <input type="text" class="form-control" name="footer_github" value="{{ old('footer_github', $footer['github']) }}" placeholder="https://github.com/username/repo" />
                        <p class="text-muted"><small>Tautan ke halaman GitHub organisasi atau personal Anda.</small></p>
                    </div>

                    <!-- TikTok -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background-color: #000000; border: 1px solid #333;"><i class="fa fa-music"></i> TikTok</span>
                            URL Profil TikTok
                        </label>
                        <input type="text" class="form-control" name="footer_tiktok" value="{{ old('footer_tiktok', $footer['tiktok']) }}" placeholder="https://tiktok.com/@username" />
                        <p class="text-muted"><small>Tautan ke akun resmi TikTok Anda.</small></p>
                    </div>

                    <!-- Instagram -->
                    <div class="form-group">
                        <label class="control-label">
                            <span class="brand-icon-pill" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);"><i class="fa fa-instagram"></i> Instagram</span>
                            URL Profil Instagram
                        </label>
                        <input type="text" class="form-control" name="footer_instagram" value="{{ old('footer_instagram', $footer['instagram']) }}" placeholder="https://instagram.com/username" />
                        <p class="text-muted"><small>Tautan ke akun resmi Instagram Anda.</small></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Submit Button Bar -->
    <div class="row">
        <div class="col-xs-12">
            <div class="box" style="border-radius: 8px; padding: 14px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                    <a href="{{ route('admin.settings') }}" class="btn btn-default">
                        <i class="fa fa-times"></i> Batal
                    </a>
                    <button type="submit" class="btn btn-primary" style="font-weight: 600; padding: 6px 20px;">
                        <i class="fa fa-save"></i> Simpan Pengaturan CS & Social
                    </button>
                </div>
            </div>
        </div>
    </div>
</form>
@endsection
