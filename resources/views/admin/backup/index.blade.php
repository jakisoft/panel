@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'backup'])

@section('title')
    Panel & Cloud Backup
@endsection

@section('content-header')
    <h1>Panel & Cloud Backup<small>Backup menyeluruh data panel (Database + Pengaturan) & integrasi Cloud Storage.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Backup</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <!-- Section 1: Full Panel Backup Management -->
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                    <h3 class="box-title"><i class="fa fa-database"></i> Backup & Restore Seluruh Data Panel</h3>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-success btn-sm" data-toggle="modal" data-target="#createBackupModal">
                            <i class="fa fa-plus-circle"></i> Buat Backup Panel Sekarang
                        </button>
                        <button type="button" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#restoreUploadModal">
                            <i class="fa fa-upload"></i> Upload & Pulihkan Data Panel
                        </button>
                    </div>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Nama File Backup</th>
                                <th>Ukuran File</th>
                                <th>Waktu Dibuat</th>
                                <th class="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($backups as $backup)
                                <tr>
                                    <td>
                                        <i class="fa fa-file-archive-o text-primary"></i>
                                        <code style="font-size: 13px; font-weight: 600; margin-left: 5px;">{{ $backup['filename'] }}</code>
                                    </td>
                                    <td>{{ $backup['size_human'] }}</td>
                                    <td>{{ $backup['created_at'] }}</td>
                                    <td class="text-right">
                                        <a href="{{ route('admin.backup.download', ['filename' => $backup['filename']]) }}" class="btn btn-xs btn-primary" title="Download Langsung Backup">
                                            <i class="fa fa-download"></i> Download
                                        </a>
                                        <form action="{{ route('admin.backup.restore') }}" method="POST" style="display: inline-block;" onsubmit="return confirm('PERINGATAN: Memulihkan backup ini akan menimpa seluruh database panel saat ini dengan data di dalam file backup. Lanjutkan?');">
                                            {!! csrf_field() !!}
                                            <input type="hidden" name="filename" value="{{ $backup['filename'] }}">
                                            <button type="submit" class="btn btn-xs btn-warning" title="Pulihkan / Restore ke Panel">
                                                <i class="fa fa-history"></i> Pulihkan Data
                                            </button>
                                        </form>
                                        <form action="{{ route('admin.backup.delete', ['filename' => $backup['filename']]) }}" method="POST" style="display: inline-block;" onsubmit="return confirm('Apakah Anda yakin ingin menghapus file backup ini?');">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger" title="Hapus Backup">
                                                <i class="fa fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted py-4">
                                        <em>Belum ada file backup panel yang dibuat. Klik tombol <strong>"Buat Backup Panel Sekarang"</strong> di atas.</em>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <div class="box-footer">
                    <p class="text-muted text-sm" style="margin-bottom: 0;">
                        <i class="fa fa-info-circle"></i> File backup mencakup dump lengkap MySQL (User, Server, Node, Allocations, Nests, Eggs, Settings) dan konfigurasi <code>.env</code> (APP_KEY). File ini dapat langsung dipulihkan saat instalasi panel baru di server lain.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Section 2: Auto Backup & Cloud Storage Configuration Form -->
    <form action="{{ route('admin.backup') }}" method="POST">
        <div class="row">
            <!-- Auto Panel Backup Scheduler -->
            <div class="col-xs-12">
                <div class="box box-info">
                    <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                        <h3 class="box-title"><i class="fa fa-clock-o"></i> Auto-Backup Panel Otomatis (Penjadwalan)</h3>
                        <div class="material-switch">
                            <input id="panel_auto_enabled" name="panel_auto_enabled" type="checkbox" value="1" @if($auto_backup['enabled']) checked @endif />
                            <label for="panel_auto_enabled" class="label-info"></label>
                        </div>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">Frekuensi Auto-Backup Panel</label>
                                <select name="panel_auto_frequency" class="form-control">
                                    <option value="daily" @if($auto_backup['frequency'] === 'daily') selected @endif>Setiap Hari (Daily - Rekomendasi)</option>
                                    <option value="weekly" @if($auto_backup['frequency'] === 'weekly') selected @endif>Setiap Minggu (Weekly)</option>
                                    <option value="monthly" @if($auto_backup['frequency'] === 'monthly') selected @endif>Setiap Bulan (Monthly)</option>
                                    <option value="hourly" @if($auto_backup['frequency'] === 'hourly') selected @endif>Setiap Jam (Hourly)</option>
                                </select>
                                <p class="text-muted"><small>Panel akan otomatis membuat dump database & backup konfigurasi sesuai jadwal dan mengunggahnya ke cloud jika diaktifkan.</small></p>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">Penyimpanan Utama</label>
                                <select name="default_provider" class="form-control">
                                    <option value="local" @if($default_provider === 'local') selected @endif>Local Node Storage (Default)</option>
                                    <option value="r2" @if($default_provider === 'r2') selected @endif>Cloudflare R2 (S3-Compatible - Bebas Egress)</option>
                                    <option value="gdrive" @if($default_provider === 'gdrive') selected @endif>Google Drive</option>
                                </select>
                                <p class="text-muted"><small>Pilih penyimpanan utama untuk hasil backup.</small></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cloudflare R2 -->
            <div class="col-md-6">
                <div class="box box-warning">
                    <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                        <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa fa-cloud" style="color: #f38020;"></i> Cloudflare R2 Storage
                        </h3>
                        <div class="material-switch">
                            <input id="r2_enabled" name="r2_enabled" type="checkbox" value="1" @if($r2['enabled']) checked @endif />
                            <label for="r2_enabled" class="label-warning"></label>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted"><small>Penyimpanan object S3-compatible berkecepatan tinggi tanpa biaya transfer data keluar (egress).</small></p>
                        
                        <div class="form-group">
                            <label class="control-label">Cloudflare Account ID</label>
                            <input type="text" class="form-control" id="r2_account_id" name="r2_account_id" value="{{ old('r2_account_id', $r2['account_id']) }}" placeholder="Contoh: 1a2b3c4d5e6f7g8h9i0j" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">R2 Bucket Name</label>
                            <input type="text" class="form-control" id="r2_bucket" name="r2_bucket" value="{{ old('r2_bucket', $r2['bucket']) }}" placeholder="Contoh: panel-backups" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">Access Key ID</label>
                            <input type="text" class="form-control" id="r2_access_key_id" name="r2_access_key_id" value="{{ old('r2_access_key_id', $r2['access_key_id']) }}" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">Secret Access Key</label>
                            <input type="password" class="form-control" id="r2_secret_access_key" name="r2_secret_access_key" placeholder="@if(!empty($r2['secret_access_key'])) (Tidak berubah) @endif" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">Custom Endpoint URL (Opsional)</label>
                            <input type="text" class="form-control" id="r2_endpoint" name="r2_endpoint" value="{{ old('r2_endpoint', $r2['endpoint']) }}" placeholder="https://<account_id>.r2.cloudflarestorage.com" />
                        </div>

                        <div style="margin-top: 15px;">
                            <button type="button" id="btnTestR2" class="btn btn-default btn-sm">
                                <i class="fa fa-plug"></i> Test Koneksi R2
                            </button>
                            <span id="r2TestResult" style="margin-left: 10px; font-size: 13px;"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Google Drive -->
            <div class="col-md-6">
                <div class="box box-success">
                    <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                        <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa fa-google" style="color: #0f9d58;"></i> Google Drive Storage
                        </h3>
                        <div class="material-switch">
                            <input id="gdrive_enabled" name="gdrive_enabled" type="checkbox" value="1" @if($gdrive['enabled']) checked @endif />
                            <label for="gdrive_enabled" class="label-success"></label>
                        </div>
                    </div>
                    <div class="box-body">
                        <p class="text-muted"><small>Simpan hasil backup langsung ke akun Google Drive Anda menggunakan OAuth2.</small></p>

                        <div class="form-group">
                            <label class="control-label">Google Client ID</label>
                            <input type="text" class="form-control" id="gdrive_client_id" name="gdrive_client_id" value="{{ old('gdrive_client_id', $gdrive['client_id']) }}" placeholder="Contoh: xxxxxxxx.apps.googleusercontent.com" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">Google Client Secret</label>
                            <input type="password" class="form-control" id="gdrive_client_secret" name="gdrive_client_secret" placeholder="@if(!empty($gdrive['client_secret'])) (Tidak berubah) @endif" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">OAuth Refresh Token</label>
                            <input type="text" class="form-control" id="gdrive_refresh_token" name="gdrive_refresh_token" value="{{ old('gdrive_refresh_token', $gdrive['refresh_token']) }}" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">Google Drive Folder ID (Opsional)</label>
                            <input type="text" class="form-control" id="gdrive_folder_id" name="gdrive_folder_id" value="{{ old('gdrive_folder_id', $gdrive['folder_id']) }}" placeholder="ID Folder tujuan di Google Drive" />
                        </div>

                        <div style="margin-top: 15px;">
                            <button type="button" id="btnTestGDrive" class="btn btn-default btn-sm">
                                <i class="fa fa-plug"></i> Test Koneksi Google Drive
                            </button>
                            <span id="gdriveTestResult" style="margin-left: 10px; font-size: 13px;"></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xs-12">
                <div class="box">
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-sm btn-primary pull-right">
                            <i class="fa fa-save"></i> Simpan Pengaturan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <!-- Modal Buat Backup Manual -->
    <div class="modal fade" id="createBackupModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <form action="{{ route('admin.backup.create') }}" method="POST">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title"><i class="fa fa-database"></i> Buat Backup Seluruh Data Panel</h4>
                    </div>
                    <div class="modal-body">
                        <p class="text-sm text-neutral-600">
                            Proses ini akan meng-export seluruh database MySQL panel (user, server, node, egg, dll) serta konfigurasi <code>.env</code> dan membungkusnya ke dalam file <code>.tar.gz</code>.
                        </p>
                        <div class="form-group">
                            <label class="control-label">Deskripsi / Catatan Backup (Opsional)</label>
                            <input type="text" class="form-control" name="description" placeholder="Contoh: Backup sebelum migrasi server" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        {!! csrf_field() !!}
                        <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Mulai Backup Sekarang</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Upload & Pulihkan Data -->
    <div class="modal fade" id="restoreUploadModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <form action="{{ route('admin.backup.restore') }}" method="POST" enctype="multipart/form-data" onsubmit="return confirm('PERINGATAN: Memulihkan backup akan menimpa seluruh database panel saat ini. Pastikan Anda telah membuat backup terbaru sebelum melanjutkan. Lanjutkan?');">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title"><i class="fa fa-history"></i> Upload & Pulihkan Data Panel</h4>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <i class="fa fa-exclamation-triangle"></i> <strong>Perhatian:</strong> Memulihkan backup panel akan menimpa seluruh database panel saat ini dengan data di dalam file backup yang Anda upload.
                        </div>
                        <div class="form-group">
                            <label class="control-label">Pilih File Backup (.tar.gz atau .zip)</label>
                            <input type="file" class="form-control" name="backup_file" accept=".tar.gz,.zip,.tar" required />
                            <p class="text-muted"><small>Unggah file backup panel yang sebelumnya Anda download dari JKSoft Cloud Panel.</small></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        {!! csrf_field() !!}
                        <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-danger">Upload & Restore Sekarang</button>
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
