@extends('layouts.admin')

@section('title')
    Panel & Cloud Backup
@endsection

@section('content-header')
    <h1><i class="fa fa-database text-primary"></i> Panel & Cloud Backup <small>Kelola backup seluruh data panel & integrasi cloud storage.</small></h1>
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
        background-color: #3b82f6;
    }
    input:checked + .switch-slider.slider-success {
        background-color: #10b981;
    }
    input:checked + .switch-slider.slider-warning {
        background-color: #f59e0b;
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
    .status-badge-on {
        background-color: #dcfce7;
        color: #15803d;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        text-transform: uppercase;
    }
    .status-badge-off {
        background-color: #f1f5f9;
        color: #64748b;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        text-transform: uppercase;
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

<!-- SECTION 2: Auto-Backup & Cloud Storage Settings Form -->
<form action="{{ route('admin.backup') }}" method="POST">
    <div class="row">
        <!-- Auto Backup Scheduler Card -->
        <div class="col-xs-12">
            <div class="box box-info" style="border-radius: 8px;">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700;"><i class="fa fa-clock-o text-info"></i> Auto-Backup Panel Otomatis</h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Penjadwalan backup otomatis latar belakang (Cron Worker).</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="panel_auto_enabled" name="panel_auto_enabled" value="1" @if($auto_backup['enabled']) checked @endif>
                            <span class="switch-slider slider-success"></span>
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
                                <option value="r2" @if($default_provider === 'r2') selected @endif>Cloudflare R2 (Bebas Egress / S3 Compatible)</option>
                                <option value="gdrive" @if($default_provider === 'gdrive') selected @endif>Google Drive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cloudflare R2 Card -->
        <div class="col-md-6 col-xs-12">
            <div class="box box-warning" style="border-radius: 8px;">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700;">
                            <i class="fa fa-cloud" style="color: #f38020;"></i> Cloudflare R2
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Object Storage S3-Compatible tanpa biaya egress.</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="r2_enabled" name="r2_enabled" value="1" @if($r2['enabled']) checked @endif>
                            <span class="switch-slider slider-warning"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 16px;">
                    <div class="form-group">
                        <label class="control-label">Account ID</label>
                        <input type="text" class="form-control" id="r2_account_id" name="r2_account_id" value="{{ old('r2_account_id', $r2['account_id']) }}" placeholder="Contoh: 1a2b3c4d5e6f7g8h9i0j" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Bucket Name</label>
                        <input type="text" class="form-control" id="r2_bucket" name="r2_bucket" value="{{ old('r2_bucket', $r2['bucket']) }}" placeholder="panel-backups" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Access Key ID</label>
                        <input type="text" class="form-control" id="r2_access_key_id" name="r2_access_key_id" value="{{ old('r2_access_key_id', $r2['access_key_id']) }}" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Secret Access Key</label>
                        <input type="password" class="form-control" id="r2_secret_access_key" name="r2_secret_access_key" placeholder="@if(!empty($r2['secret_access_key'])) (Kunci sudah tersimpan - kosongkan jika tidak diubah) @endif" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Custom Endpoint URL (Opsional)</label>
                        <input type="text" class="form-control" id="r2_endpoint" name="r2_endpoint" value="{{ old('r2_endpoint', $r2['endpoint']) }}" placeholder="https://<account_id>.r2.cloudflarestorage.com" />
                    </div>

                    <div style="margin-top: 15px; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <button type="button" id="btnTestR2" class="btn btn-default btn-sm">
                            <i class="fa fa-plug"></i> Test Koneksi R2
                        </button>
                        <span id="r2TestResult" style="font-size: 13px;"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Google Drive Card -->
        <div class="col-md-6 col-xs-12">
            <div class="box box-success" style="border-radius: 8px;">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700;">
                            <i class="fa fa-google" style="color: #0f9d58;"></i> Google Drive
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Koneksi Google Drive via OAuth2 API.</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" id="gdrive_enabled" name="gdrive_enabled" value="1" @if($gdrive['enabled']) checked @endif>
                            <span class="switch-slider slider-success"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 16px;">
                    <div class="form-group">
                        <label class="control-label">Client ID</label>
                        <input type="text" class="form-control" id="gdrive_client_id" name="gdrive_client_id" value="{{ old('gdrive_client_id', $gdrive['client_id']) }}" placeholder="xxxxxxxx.apps.googleusercontent.com" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Client Secret</label>
                        <input type="password" class="form-control" id="gdrive_client_secret" name="gdrive_client_secret" placeholder="@if(!empty($gdrive['client_secret'])) (Secret sudah tersimpan - kosongkan jika tidak diubah) @endif" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">OAuth Refresh Token</label>
                        <input type="text" class="form-control" id="gdrive_refresh_token" name="gdrive_refresh_token" value="{{ old('gdrive_refresh_token', $gdrive['refresh_token']) }}" />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Folder ID (Opsional)</label>
                        <input type="text" class="form-control" id="gdrive_folder_id" name="gdrive_folder_id" value="{{ old('gdrive_folder_id', $gdrive['folder_id']) }}" placeholder="ID Folder Google Drive tujuan" />
                    </div>

                    <div style="margin-top: 15px; display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <button type="button" id="btnTestGDrive" class="btn btn-default btn-sm">
                            <i class="fa fa-plug"></i> Test Koneksi Google Drive
                        </button>
                        <span id="gdriveTestResult" style="font-size: 13px;"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button Footer -->
        <div class="col-xs-12">
            <div class="box" style="border-radius: 8px;">
                <div class="box-footer" style="padding: 16px;">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-primary pull-right" style="padding: 8px 24px; font-weight: 600;">
                        <i class="fa fa-save"></i> Simpan Konfigurasi
                    </button>
                </div>
            </div>
        </div>
    </div>
</form>

<!-- Modal: Create Backup -->
<div class="modal fade" id="createBackupModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form action="{{ route('admin.backup.create') }}" method="POST">
            <div class="modal-content" style="border-radius: 8px;">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title" style="font-weight: 700;"><i class="fa fa-database text-primary"></i> Buat Backup Seluruh Data Panel</h4>
                </div>
                <div class="modal-body">
                    <p class="text-muted">
                        Proses ini akan meng-export database MySQL lengkap (user, server, node, egg, dll) serta konfigurasi <code>.env</code> dan menyimpannya dalam arsip <code>.tar.gz</code>.
                    </p>
                    <div class="form-group">
                        <label class="control-label">Deskripsi / Catatan Backup (Opsional)</label>
                        <input type="text" class="form-control" name="description" placeholder="Contoh: Backup sebelum update server" />
                    </div>
                </div>
                <div class="modal-footer">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-play"></i> Mulai Backup</button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Modal: Upload & Restore -->
<div class="modal fade" id="restoreUploadModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <form action="{{ route('admin.backup.restore') }}" method="POST" enctype="multipart/form-data" onsubmit="return confirm('PERINGATAN: Memulihkan backup akan menimpa seluruh database panel saat ini. Lanjutkan?');">
            <div class="modal-content" style="border-radius: 8px;">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title" style="font-weight: 700;"><i class="fa fa-history text-warning"></i> Upload & Pulihkan Data Panel</h4>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <i class="fa fa-exclamation-triangle"></i> <strong>Perhatian:</strong> Data saat ini akan ditimpa dengan data dari file backup yang Anda unggah.
                    </div>
                    <div class="form-group">
                        <label class="control-label">Pilih File Backup (.tar.gz, .zip, atau .sql)</label>
                        <input type="file" class="form-control" name="backup_file" accept=".tar.gz,.zip,.tar,.sql" required />
                        <p class="text-muted"><small>Unggah arsip backup (.tar.gz / .zip) atau file export database (.sql) yang ingin dipulihkan ke panel.</small></p>
                    </div>
                </div>
                <div class="modal-footer">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-danger"><i class="fa fa-upload"></i> Upload & Restore</button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $(document).ready(function () {
            $('#btnTestR2').on('click', function () {
                var btn = $(this);
                var resultSpan = $('#r2TestResult');
                btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Menghubungkan...');
                resultSpan.html('');

                $.ajax({
                    url: '{{ route('admin.backup.test.r2') }}',
                    type: 'POST',
                    data: {
                        _token: '{{ csrf_token() }}',
                        account_id: $('#r2_account_id').val(),
                        bucket: $('#r2_bucket').val(),
                        access_key_id: $('#r2_access_key_id').val(),
                        secret_access_key: $('#r2_secret_access_key').val(),
                        endpoint: $('#r2_endpoint').val()
                    },
                    success: function (res) {
                        resultSpan.html('<span class="text-success"><i class="fa fa-check-circle"></i> ' + res.message + '</span>');
                    },
                    error: function (xhr) {
                        var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Koneksi gagal.';
                        resultSpan.html('<span class="text-danger"><i class="fa fa-times-circle"></i> ' + msg + '</span>');
                    },
                    complete: function () {
                        btn.prop('disabled', false).html('<i class="fa fa-plug"></i> Test Koneksi R2');
                    }
                });
            });

            $('#btnTestGDrive').on('click', function () {
                var btn = $(this);
                var resultSpan = $('#gdriveTestResult');
                btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Menghubungkan...');
                resultSpan.html('');

                $.ajax({
                    url: '{{ route('admin.backup.test.gdrive') }}',
                    type: 'POST',
                    data: {
                        _token: '{{ csrf_token() }}',
                        client_id: $('#gdrive_client_id').val(),
                        client_secret: $('#gdrive_client_secret').val(),
                        refresh_token: $('#gdrive_refresh_token').val()
                    },
                    success: function (res) {
                        resultSpan.html('<span class="text-success"><i class="fa fa-check-circle"></i> ' + res.message + '</span>');
                    },
                    error: function (xhr) {
                        var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Koneksi gagal.';
                        resultSpan.html('<span class="text-danger"><i class="fa fa-times-circle"></i> ' + msg + '</span>');
                    },
                    complete: function () {
                        btn.prop('disabled', false).html('<i class="fa fa-plug"></i> Test Koneksi Google Drive');
                    }
                });
            });
        });
    </script>
@endsection
