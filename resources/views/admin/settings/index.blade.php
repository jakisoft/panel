@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Settings
@endsection

@section('content-header')
    <h1>Panel Settings<small>Configure Pterodactyl to your liking.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Settings</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Panel Settings</h3>
                </div>
                <form action="{{ route('admin.settings') }}" method="POST" enctype="multipart/form-data">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Company Name</label>
                                <div>
                                    <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                                    <p class="text-muted"><small>This is the name that is used throughout the panel and in emails sent to clients.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Require 2-Factor Authentication</label>
                                <div>
                                    <div class="btn-group" data-toggle="buttons">
                                        @php
                                            $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                                        @endphp
                                        <label class="btn btn-primary @if ($level == 0) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> Not Required
                                        </label>
                                        <label class="btn btn-primary @if ($level == 1) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> Admin Only
                                        </label>
                                        <label class="btn btn-primary @if ($level == 2) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> All Users
                                        </label>
                                    </div>
                                    <p class="text-muted"><small>If enabled, any account falling into the selected grouping will be required to have 2-Factor authentication enabled to use the Panel.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Default Language</label>
                                <div>
                                    <select name="app:locale" class="form-control">
                                        @foreach($languages as $key => $value)
                                            <option value="{{ $key }}" @if(config('app.locale') === $key) selected @endif>{{ $value }}</option>
                                        @endforeach
                                    </select>
                                    <p class="text-muted"><small>The default language to use when rendering UI components.</small></p>
                                </div>
                            </div>
                        </div>

                        <hr style="margin: 10px 0 20px 0;">

                        <div class="row">
                            <div class="col-xs-12">
                                <h4 style="margin-top: 0; margin-bottom: 15px; font-weight: 600;">
                                    <i class="fa fa-paint-brush"></i> Branding & Assets (Logo & Favicon)
                                </h4>
                            </div>

                            <!-- Panel Logo -->
                            <div class="form-group col-md-6">
                                <label class="control-label">Panel Logo (URL / Upload)</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="logoUrlInput" name="app:logo" value="{{ old('app:logo', config('app.logo')) }}" placeholder="/assets/svgs/pterodactyl.svg atau https://domain.com/logo.png" />
                                    <span class="input-group-btn">
                                        <label class="btn btn-default" style="margin-bottom: 0;">
                                            <i class="fa fa-upload"></i> Upload
                                            <input type="file" id="logoFileInput" name="app:logo_file" accept="image/*" style="display: none;">
                                        </label>
                                    </span>
                                </div>
                                <p class="text-muted"><small>Logo yang ditampilkan di navigasi panel & halaman login. Masukkan URL gambar atau upload file.</small></p>

                                <div style="margin-top: 10px; display: flex; align-items: center; gap: 15px; background: #1b2228; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                                    <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold;">Preview:</span>
                                        <img id="logoPreviewImg" src="{{ old('app:logo', config('app.logo', '/assets/svgs/pterodactyl.svg')) }}" alt="Logo Preview" style="max-height: 42px; max-width: 200px; object-fit: contain;">
                                    </div>
                                    <button type="button" id="logoTrashBtn" class="btn btn-danger btn-sm" title="Hapus kustomisasi & kembalikan ke default" style="display: none;">
                                        <i class="fa fa-trash"></i> Reset Default
                                    </button>
                                </div>
                            </div>

                            <!-- Panel Favicon -->
                            <div class="form-group col-md-6">
                                <label class="control-label">Panel Favicon (URL / Upload)</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="faviconUrlInput" name="app:favicon" value="{{ old('app:favicon', config('app.favicon')) }}" placeholder="/favicons/favicon.ico atau https://domain.com/favicon.png" />
                                    <span class="input-group-btn">
                                        <label class="btn btn-default" style="margin-bottom: 0;">
                                            <i class="fa fa-upload"></i> Upload
                                            <input type="file" id="faviconFileInput" name="app:favicon_file" accept="image/x-icon,image/png,image/svg+xml,image/jpeg" style="display: none;">
                                        </label>
                                    </span>
                                </div>
                                <p class="text-muted"><small>Icon tab browser (Favicon). Masukkan URL atau upload file (.ico, .png, .svg).</small></p>

                                <div style="margin-top: 10px; display: flex; align-items: center; gap: 15px; background: #1b2228; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                                    <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold;">Preview:</span>
                                        <img id="faviconPreviewImg" src="{{ old('app:favicon', config('app.favicon', '/favicons/favicon.ico')) }}" alt="Favicon Preview" style="width: 32px; height: 32px; object-fit: contain;">
                                    </div>
                                    <button type="button" id="faviconTrashBtn" class="btn btn-danger btn-sm" title="Hapus kustomisasi & kembalikan ke default" style="display: none;">
                                        <i class="fa fa-trash"></i> Reset Default
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $(document).ready(function () {
            var defaultLogo = '/assets/svgs/pterodactyl.svg';
            var defaultFavicon = '/favicons/favicon.ico';

            var logoInput = $('#logoUrlInput');
            var logoFileInput = $('#logoFileInput');
            var logoPreview = $('#logoPreviewImg');
            var logoTrash = $('#logoTrashBtn');

            var faviconInput = $('#faviconUrlInput');
            var faviconFileInput = $('#faviconFileInput');
            var faviconPreview = $('#faviconPreviewImg');
            var faviconTrash = $('#faviconTrashBtn');

            function updateLogoState() {
                var val = logoInput.val().trim();
                var isCustom = val !== '' && val !== defaultLogo;
                if (isCustom) {
                    logoTrash.show();
                    logoPreview.attr('src', val);
                } else {
                    logoTrash.hide();
                    logoPreview.attr('src', defaultLogo);
                }
            }

            function updateFaviconState() {
                var val = faviconInput.val().trim();
                var isCustom = val !== '' && val !== defaultFavicon;
                if (isCustom) {
                    faviconTrash.show();
                    faviconPreview.attr('src', val);
                } else {
                    faviconTrash.hide();
                    faviconPreview.attr('src', defaultFavicon);
                }
            }

            logoInput.on('input change', updateLogoState);
            faviconInput.on('input change', updateFaviconState);

            logoFileInput.on('change', function (e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        logoPreview.attr('src', event.target.result);
                        logoTrash.show();
                    };
                    reader.readAsDataURL(file);
                }
            });

            faviconFileInput.on('change', function (e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        faviconPreview.attr('src', event.target.result);
                        faviconTrash.show();
                    };
                    reader.readAsDataURL(file);
                }
            });

            logoTrash.on('click', function () {
                logoInput.val(defaultLogo);
                logoFileInput.val('');
                updateLogoState();
            });

            faviconTrash.on('click', function () {
                faviconInput.val(defaultFavicon);
                faviconFileInput.val('');
                updateFaviconState();
            });

            // Initial check
            updateLogoState();
            updateFaviconState();
        });
    </script>
@endsection
