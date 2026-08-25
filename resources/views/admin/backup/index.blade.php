@extends('layouts.admin')

@section('title')
    Panel & Cloud Backup
@endsection

@section('content-header')
    <h1><i class="fa fa-database text-primary"></i> Panel & Cloud Backup <small>Kelola backup seluruh data panel, auto-backup, dan integrasi Telegram Bot / Cloud Storage.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}"><i class="fa fa-dashboard"></i> Admin</a></li>
        <li class="active">Panel Backup</li>
    </ol>
@endsection

@section('content')
<style>
    /* Modern Switch Toggle */
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
    input:checked + .switch-slider.slider-primary {
        background-color: #3b82f6;
    }
    input:checked + .switch-slider:before {
        transform: translateX(22px);
    }

    /* Responsive Cards & UI */
    .backup-header-box {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    .backup-actions-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .provider-card {
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        margin-bottom: 20px;
    }
    .provider-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: white;
    }

    @media (max-width: 768px) {
        .backup-header-box {
            flex-direction: column;
            align-items: flex-start;
        }
        .backup-actions-group {
            width: 100%;
        }
        .backup-actions-group .btn {
            flex: 1 1 auto;
            text-align: center;
        }
        .table-responsive {
            border: none;
        }
        .btn-table-action {
            margin-bottom: 4px;
        }
    }
</style>

<!-- SECTION 1: Full Panel Backup Management Table -->
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <div class="box-header with-border" style="padding: 16px;">
                <div class="backup-header-box">
                    <div>
                        <h3 class="box-title" style="font-size: 18px; font-weight: 700;">
                            <i class="fa fa-server text-primary"></i> Data Backup Panel
                        </h3>
                        <p class="text-muted" style="margin: 4px 0 0 0; font-size: 13px;">
                            Daftar arsip data panel (Database MySQL & Kunci Enkripsi <code>.env</code>).
                        </p>
                    </div>
                    <div class="backup-actions-group">
                        <button type="button" class="btn btn-success" data-toggle="modal" data-target="#createBackupModal">
                            <i class="fa fa-plus-circle"></i> Buat Backup Baru
                        </button>
                        <button type="button" class="btn btn-warning" data-toggle="modal" data-target="#restoreUploadModal">
                            <i class="fa fa-upload"></i> Upload & Restore
                        </button>
                    </div>
                </div>
            </div>
            <div class="box-body no-padding table-responsive">
                <table class="table table-hover table-striped" style="margin-bottom: 0;">
                    <thead>
                        <tr style="background-color: #f8fafc;">
                            <th style="padding: 14px 16px;">Nama File Backup</th>
                            <th style="padding: 14px 16px;">Ukuran File</th>
                            <th style="padding: 14px 16px;">Waktu Dibuat</th>
                            <th style="padding: 14px 16px; text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($backups as $backup)
                            <tr>
                                <td style="padding: 14px 16px; vertical-align: middle;">
                                    <i class="fa fa-file-archive-o text-primary" style="font-size: 16px; margin-right: 6px;"></i>
                                    <code style="font-size: 13px; font-weight: 600; color: #1e293b; background: #e2e8f0; padding: 3px 6px; border-radius: 4px;">{{ $backup['filename'] }}</code>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle;">
                                    <span class="label label-default" style="font-size: 12px;">{{ $backup['size_human'] }}</span>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle; color: #64748b; font-size: 13px;">
                                    <i class="fa fa-clock-o"></i> {{ $backup['created_at'] }}
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle; text-align: right;">
                                    <a href="{{ route('admin.backup.download', ['filename' => $backup['filename']]) }}" class="btn btn-sm btn-primary btn-table-action" title="Download Arsip Backup">
                                        <i class="fa fa-download"></i> Download
                                    </a>
                                    <form action="{{ route('admin.backup.restore') }}" method="POST" style="display: inline-block;" onsubmit="return confirm('PERINGATAN: Memulihkan backup ini akan menimpa seluruh database panel saat ini. Lanjutkan?');">
                                        {!! csrf_field() !!}
                                        <input type="hidden" name="filename" value="{{ $backup['filename'] }}">
                                        <button type="submit" class="btn btn-sm btn-warning btn-table-action" title="Pulihkan / Restore ke Panel">
                                            <i class="fa fa-history"></i> Pulihkan
                                        </button>
                                    </form>
                                    <form action="{{ route('admin.backup.delete', ['filename' => $backup['filename']]) }}" method="POST" style="display: inline-block;" onsubmit="return confirm('Hapus file backup ini secara permanen?');">
                                        {!! csrf_field() !!}
                                        {!! method_field('DELETE') !!}
                                        <button type="submit" class="btn btn-sm btn-danger btn-table-action" title="Hapus">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted" style="padding: 40px 16px;">
                                    <i class="fa fa-inbox fa-3x" style="color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
                                    <p style="font-size: 15px; margin: 0; color: #64748b;">Belum ada arsip backup panel yang dibuat.</p>
                                    <p style="font-size: 13px; color: #94a3b8;">Klik tombol <strong>"Buat Backup Baru"</strong> di atas untuk membuat arsip pertama Anda.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="box-footer" style="background-color: #f8fafc; padding: 12px 16px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <span class="text-muted" style="font-size: 13px;">
                    <i class="fa fa-info-circle text-info"></i> Backup ini siap digunakan untuk migrasi antar VPS / instalasi ulang panel.
                </span>
            </div>
        </div>
    </div>
</div>

<!-- SECTION 2: Auto-Backup & Storage Integrations Configuration -->
<form action="{{ route('admin.backup') }}" method="POST">
    {!! csrf_field() !!}

    <div class="row">
        <!-- Auto Backup Scheduler Card -->
        <div class="col-xs-12">
            <div class="box box-info provider-card">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700;"><i class="fa fa-clock-o text-info"></i> Auto-Backup Panel Otomatis</h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Penjadwalan backup otomatis latar belakang (Cron Worker / Task Scheduler).</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="panel_auto_enabled" name="panel_auto_enabled" value="1" @if($auto_backup['enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 16px;">
                    <div class="row">
                        <div class="form-group col-sm-6 col-xs-12">
                            <label class="control-label">Frekuensi Auto-Backup</label>
                            <select name="panel_auto_frequency" class="form-control">
                                <option value="daily" @if($auto_backup['frequency'] === 'daily') selected @endif>Setiap Hari (Daily - Rekomendasi)</option>
                                <option value="weekly" @if($auto_backup['frequency'] === 'weekly') selected @endif>Setiap Minggu (Weekly)</option>
                                <option value="monthly" @if($auto_backup['frequency'] === 'monthly') selected @endif>Setiap Bulan (Monthly)</option>
                                <option value="hourly" @if($auto_backup['frequency'] === 'hourly') selected @endif>Setiap Jam (Hourly)</option>
                            </select>
                        </div>
                        <div class="form-group col-sm-6 col-xs-12">
                            <label class="control-label">Target Penyimpanan Utama</label>
                            <select name="default_provider" class="form-control">
                                <option value="local" @if($default_provider === 'local') selected @endif>Local Node Storage (Default)</option>
                                <option value="telegram" @if($default_provider === 'telegram') selected @endif>Telegram Bot API</option>
                                <option value="r2" @if($default_provider === 'r2') selected @endif>Cloudflare R2 (Bebas Egress / S3 Compatible)</option>
                                <option value="gdrive" @if($default_provider === 'gdrive') selected @endif>Google Drive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Storage Provider Cards Grid -->
    <div class="row">
        <!-- Provider 1: Telegram Bot (NEW) -->
        <div class="col-xs-12 col-md-4">
            <div class="box box-primary provider-card" style="border-top: 3px solid #229ED9;">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="provider-badge" style="background-color: #229ED9;">
                            <i class="fa fa-paper-plane"></i> Telegram Bot
                        </span>
                        <h4 style="margin: 6px 0 0 0; font-weight: 700; font-size: 15px;">Backup via Telegram API</h4>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="telegram_enabled" name="telegram_enabled" value="1" @if($telegram['enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 16px;">
                    <div class="alert alert-info" style="font-size: 12px; margin-bottom: 14px; padding: 10px;">
                        <i class="fa fa-info-circle"></i> File backup panel otomatis akan dikirimkan ke Telegram Chat/Owner ID via Bot API saat backup dibuat.
                    </div>
                    <div class="form-group">
                        <label class="control-label">Bot Token Telegram</label>
                        <input type="password" class="form-control" id="telegram_bot_token" name="telegram_bot_token" value="{{ old('telegram_bot_token', $telegram['bot_token']) }}" placeholder="123456789:AAHk..." autocomplete="new-password">
                        <p class="text-muted"><small>Dapatkan token dari <a href="https://t.me/BotFather" target="_blank" rel="noreferrer">@BotFather</a>.</small></p>
                    </div>
                    <div class="form-group">
                        <label class="control-label">Owner ID / Chat ID</label>
                        <input type="text" class="form-control" id="telegram_owner_id" name="telegram_owner_id" value="{{ old('telegram_owner_id', $telegram['owner_id']) }}" placeholder="Contoh: 123456789 atau -1001234567890">
                        <p class="text-muted"><small>User ID atau Group/Channel ID penerima (dapatkan dari <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer">@userinfobot</a>).</small></p>
                    </div>
                </div>
                <div class="box-footer" style="padding: 12px 16px; background-color: #f8fafc;">
                    <button type="button" class="btn btn-sm btn-info btn-block" id="btnTestTelegram">
                        <i class="fa fa-paper-plane"></i> Test Bot Connection
                    </button>
                    <div id="testTelegramStatus" style="margin-top: 8px; font-size: 12px;"></div>
                </div>
            </div>
        </div>

        <!-- Provider 2: Cloudflare R2 -->
        <div class="col-xs-12 col-md-4">
            <div class="box box-warning provider-card" style="border-top: 3px solid #f59e0b;">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="provider-badge" style="background-color: #f59e0b;">
                            <i class="fa fa-cloud"></i> Cloudflare R2
                        </span>
                        <h4 style="margin: 6px 0 0 0; font-weight: 700; font-size: 15px;">S3 Compatible Storage</h4>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="r2_enabled" name="r2_enabled" value="1" @if($r2['enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 16px;">
                    <div class="form-group">
                        <label class="control-label">Account ID</label>
                        <input type="text" class="form-control" id="r2_account_id" name="r2_account_id" value="{{ old('r2_account_id', $r2['account_id']) }}" placeholder="Cloudflare Account ID">
                    </div>
                    <div class="form-group">
                        <label class="control-label">Bucket Name</label>
                        <input type="text" class="form-control" id="r2_bucket" name="r2_bucket" value="{{ old('r2_bucket', $r2['bucket']) }}" placeholder="panel-backups">
                    </div>
                    <div class="form-group">
                        <label class="control-label">Access Key ID</label>
                        <input type="text" class="form-control" id="r2_access_key_id" name="r2_access_key_id" value="{{ old('r2_access_key_id', $r2['access_key_id']) }}" placeholder="Access Key ID">
                    </div>
                    <div class="form-group">
                        <label class="control-label">Secret Access Key</label>
                        <input type="password" class="form-control" id="r2_secret_access_key" name="r2_secret_access_key" value="{{ old('r2_secret_access_key', $r2['secret_access_key']) }}" placeholder="Secret Access Key" autocomplete="new-password">
                    </div>
                </div>
                <div class="box-footer" style="padding: 12px 16px; background-color: #f8fafc;">
                    <button type="button" class="btn btn-sm btn-warning btn-block" id="btnTestR2">
                        <i class="fa fa-plug"></i> Test R2 Connection
                    </button>
                    <div id="testR2Status" style="margin-top: 8px; font-size: 12px;"></div>
                </div>
            </div>
        </div>

        <!-- Provider 3: Google Drive -->
        <div class="col-xs-12 col-md-4">
            <div class="box box-success provider-card" style="border-top: 3px solid #10b981;">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span class="provider-badge" style="background-color: #10b981;">
                            <i class="fa fa-google"></i> Google Drive
                        </span>
                        <h4 style="margin: 6px 0 0 0; font-weight: 700; font-size: 15px;">Google Drive Storage</h4>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="gdrive_enabled" name="gdrive_enabled" value="1" @if($gdrive['enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 16px;">
                    <div class="form-group">
                        <label class="control-label">Client ID</label>
                        <input type="text" class="form-control" id="gdrive_client_id" name="gdrive_client_id" value="{{ old('gdrive_client_id', $gdrive['client_id']) }}" placeholder="Google Cloud OAuth Client ID">
                    </div>
                    <div class="form-group">
                        <label class="control-label">Client Secret</label>
                        <input type="password" class="form-control" id="gdrive_client_secret" name="gdrive_client_secret" value="{{ old('gdrive_client_secret', $gdrive['client_secret']) }}" placeholder="OAuth Client Secret" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label class="control-label">Refresh Token</label>
                        <input type="password" class="form-control" id="gdrive_refresh_token" name="gdrive_refresh_token" value="{{ old('gdrive_refresh_token', $gdrive['refresh_token']) }}" placeholder="OAuth2 Refresh Token" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label class="control-label">Folder ID (Opsional)</label>
                        <input type="text" class="form-control" id="gdrive_folder_id" name="gdrive_folder_id" value="{{ old('gdrive_folder_id', $gdrive['folder_id']) }}" placeholder="Contoh: 1a2b3c4d5e...">
                    </div>
                </div>
                <div class="box-footer" style="padding: 12px 16px; background-color: #f8fafc;">
                    <button type="button" class="btn btn-sm btn-success btn-block" id="btnTestGDrive">
                        <i class="fa fa-plug"></i> Test Google Drive
                    </button>
                    <div id="testGDriveStatus" style="margin-top: 8px; font-size: 12px;"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Save Settings Button Bar -->
    <div class="row">
        <div class="col-xs-12">
            <div class="box" style="border-radius: 8px; padding: 14px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                    <button type="submit" class="btn btn-primary" style="font-weight: 600; padding: 8px 24px;">
                        <i class="fa fa-save"></i> Simpan Konfigurasi Backup
                    </button>
                </div>
            </div>
        </div>
    </div>
</form>

<!-- MODAL 1: Create Manual Backup -->
<div class="modal fade" id="createBackupModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content" style="border-radius: 8px;">
            <form action="{{ route('admin.backup.create') }}" method="POST">
                {!! csrf_field() !!}
                <div class="modal-header" style="background-color: #f8fafc; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" style="font-weight: 700;"><i class="fa fa-plus-circle text-success"></i> Buat Backup Panel Baru</h4>
                </div>
                <div class="modal-body">
                    <p class="text-muted" style="font-size: 13px;">
                        Sistem akan mengompilasi snapshot database panel MySQL dan file <code>.env</code> ke dalam arsip terkompresi.
                    </p>
                    <div class="form-group">
                        <label class="control-label">Deskripsi / Catatan Backup (Opsional)</label>
                        <input type="text" class="form-control" name="description" placeholder="Contoh: Backup sebelum upgrade Wings / Database" />
                    </div>
                </div>
                <div class="modal-footer" style="background-color: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-success" style="font-weight: 600;"><i class="fa fa-play"></i> Mulai Buat Backup</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- MODAL 2: Upload & Restore Backup -->
<div class="modal fade" id="restoreUploadModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content" style="border-radius: 8px;">
            <form action="{{ route('admin.backup.restore') }}" method="POST" enctype="multipart/form-data" onsubmit="return confirm('PERINGATAN KRUSIAL: Memulihkan file backup ini akan menimpa seluruh database panel saat ini. Lanjutkan?');">
                {!! csrf_field() !!}
                <div class="modal-header" style="background-color: #fff7ed; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom-color: #fed7aa;">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" style="font-weight: 700; color: #9a3412;"><i class="fa fa-exclamation-triangle text-warning"></i> Upload & Restore Panel</h4>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning" style="font-size: 13px;">
                        <strong>Perhatian:</strong> Pastikan Anda mengupload file arsip <code>.tar.gz</code>, <code>.zip</code>, atau file <code>.sql</code> yang valid.
                    </div>
                    <div class="form-group">
                        <label class="control-label">Pilih File Backup</label>
                        <input type="file" class="form-control" name="backup_file" accept=".tar.gz,.zip,.sql,.gz" required />
                    </div>
                </div>
                <div class="modal-footer" style="background-color: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning" style="font-weight: 600;"><i class="fa fa-history"></i> Upload & Pulihkan Sekarang</button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

@section('footer-scripts')
@parent
<script>
    $(document).ready(function() {
        // Test Telegram Connection AJAX
        $('#btnTestTelegram').on('click', function(e) {
            e.preventDefault();
            var $btn = $(this);
            var $status = $('#testTelegramStatus');
            $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Menguji...');
            $status.html('');

            $.ajax({
                url: "{{ route('admin.backup.test.telegram') }}",
                method: "POST",
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                data: {
                    bot_token: $('#telegram_bot_token').val(),
                    owner_id: $('#telegram_owner_id').val()
                },
                success: function(res) {
                    $status.html('<div class="text-success" style="font-weight: 600;"><i class="fa fa-check-circle"></i> ' + res.message + '</div>');
                },
                error: function(xhr) {
                    var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Gagal menghubungi Telegram Bot API.';
                    $status.html('<div class="text-danger" style="font-weight: 600;"><i class="fa fa-times-circle"></i> ' + msg + '</div>');
                },
                complete: function() {
                    $btn.prop('disabled', false).html('<i class="fa fa-paper-plane"></i> Test Bot Connection');
                }
            });
        });

        // Test Cloudflare R2 Connection AJAX
        $('#btnTestR2').on('click', function(e) {
            e.preventDefault();
            var $btn = $(this);
            var $status = $('#testR2Status');
            $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Menguji...');
            $status.html('');

            $.ajax({
                url: "{{ route('admin.backup.test.r2') }}",
                method: "POST",
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                data: {
                    account_id: $('#r2_account_id').val(),
                    bucket: $('#r2_bucket').val(),
                    access_key_id: $('#r2_access_key_id').val(),
                    secret_access_key: $('#r2_secret_access_key').val()
                },
                success: function(res) {
                    $status.html('<div class="text-success" style="font-weight: 600;"><i class="fa fa-check-circle"></i> ' + res.message + '</div>');
                },
                error: function(xhr) {
                    var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Koneksi R2 Gagal.';
                    $status.html('<div class="text-danger" style="font-weight: 600;"><i class="fa fa-times-circle"></i> ' + msg + '</div>');
                },
                complete: function() {
                    $btn.prop('disabled', false).html('<i class="fa fa-plug"></i> Test R2 Connection');
                }
            });
        });

        // Test Google Drive Connection AJAX
        $('#btnTestGDrive').on('click', function(e) {
            e.preventDefault();
            var $btn = $(this);
            var $status = $('#testGDriveStatus');
            $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Menguji...');
            $status.html('');

            $.ajax({
                url: "{{ route('admin.backup.test.gdrive') }}",
                method: "POST",
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                data: {
                    client_id: $('#gdrive_client_id').val(),
                    client_secret: $('#gdrive_client_secret').val(),
                    refresh_token: $('#gdrive_refresh_token').val()
                },
                success: function(res) {
                    $status.html('<div class="text-success" style="font-weight: 600;"><i class="fa fa-check-circle"></i> ' + res.message + '</div>');
                },
                error: function(xhr) {
                    var msg = (xhr.responseJSON && xhr.responseJSON.message) ? xhr.responseJSON.message : 'Koneksi Google Drive Gagal.';
                    $status.html('<div class="text-danger" style="font-weight: 600;"><i class="fa fa-times-circle"></i> ' + msg + '</div>');
                },
                complete: function() {
                    $btn.prop('disabled', false).html('<i class="fa fa-plug"></i> Test Google Drive');
                }
            });
        });
    });
</script>
@endsection
