@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'backup'])

@section('title')
    Cloud Backup
@endsection

@section('content-header')
    <h1>Cloud Backup Settings<small>Konfigurasi integrasi backup eksternal ke Cloudflare R2 dan Google Drive.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Cloud Backup</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <form action="{{ route('admin.backup') }}" method="POST">
        <div class="row">
            <!-- Global Backup Provider -->
            <div class="col-xs-12">
                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-hdd-o"></i> Default Storage Provider</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group col-md-6">
                            <label class="control-label">Penyimpanan Backup Utama</label>
                            <div>
                                <select name="default_provider" class="form-control">
                                    <option value="local" @if($default_provider === 'local') selected @endif>Local Node Storage (Default)</option>
                                    <option value="r2" @if($default_provider === 'r2') selected @endif>Cloudflare R2 (S3-Compatible - Bebas Egress)</option>
                                    <option value="gdrive" @if($default_provider === 'gdrive') selected @endif>Google Drive</option>
                                </select>
                                <p class="text-muted"><small>Pilih tujuan penyimpanan utama saat user membuat backup server.</small></p>
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
                        <p class="text-muted"><small>Cloudflare R2 adalah penyimpanan object S3-compatible yang cepat tanpa biaya transfer data keluar (egress).</small></p>
                        
                        <div class="form-group">
                            <label class="control-label">Cloudflare Account ID</label>
                            <input type="text" class="form-control" id="r2_account_id" name="r2_account_id" value="{{ old('r2_account_id', $r2['account_id']) }}" placeholder="Contoh: 1a2b3c4d5e6f7g8h9i0j" />
                        </div>

                        <div class="form-group">
                            <label class="control-label">R2 Bucket Name</label>
                            <input type="text" class="form-control" id="r2_bucket" name="r2_bucket" value="{{ old('r2_bucket', $r2['bucket']) }}" placeholder="Contoh: pterodactyl-backups" />
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
                        <p class="text-muted"><small>Integrasi penyimpanan backup server langsung ke akun Google Drive Anda menggunakan OAuth2 Credentials.</small></p>

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
                            <i class="fa fa-save"></i> Simpan Pengaturan Backup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
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
