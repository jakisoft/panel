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
                            <!-- Brand Display Mode -->
                            <div class="form-group col-md-12">
                                <label class="control-label">Mode Tampilan Brand (Navbar & Sidebar)</label>
                                <div class="row">
                                    <div class="col-md-4">
                                        <label class="radio-inline" style="font-weight: 500;">
                                            <input type="radio" name="app:logo_display" value="both" @if(config('app.logo_display', 'both') === 'both') checked @endif>
                                            <strong>Kombinasi (Logo + Nama)</strong>
                                            <p class="text-muted" style="margin: 3px 0 0 0; font-size: 11px;">Menampilkan logo gambar dan teks nama aplikasi berdampingan.</p>
                                        </label>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="radio-inline" style="font-weight: 500;">
                                            <input type="radio" name="app:logo_display" value="logo_only" @if(config('app.logo_display') === 'logo_only') checked @endif>
                                            <strong>Hanya Logo (Logo Only)</strong>
                                            <p class="text-muted" style="margin: 3px 0 0 0; font-size: 11px;">Hanya menampilkan gambar logo tanpa teks nama.</p>
                                        </label>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="radio-inline" style="font-weight: 500;">
                                            <input type="radio" name="app:logo_display" value="text_only" @if(config('app.logo_display') === 'text_only') checked @endif>
                                            <strong>Hanya Teks Nama (Text Only)</strong>
                                            <p class="text-muted" style="margin: 3px 0 0 0; font-size: 11px;">Hanya menampilkan teks nama aplikasi tanpa icon/gambar logo.</p>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <hr style="border-color: #333; margin: 25px 0;">

                            <h4 style="font-weight: bold; color: #fff; margin-bottom: 15px;">
                                <i class="fa fa-paint-brush"></i> Kustomisasi Background & Tema Panel
                            </h4>

                            <!-- Background Color -->
                            <div class="form-group">
                                <label class="control-label">Warna Background Panel (Background Color)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="color" id="bgColorPicker" value="{{ old('app:background_color', config('app.background_color', '#090d16')) }}" style="width: 48px; height: 36px; padding: 2px; border-radius: 4px; border: 1px solid #444; background: #222; cursor: pointer;">
                                    <input type="text" id="bgColorInput" name="app:background_color" class="form-control" value="{{ old('app:background_color', config('app.background_color', '')) }}" placeholder="e.g. #090d16, #0f172a, #121212" style="max-width: 250px;">
                                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                        <button type="button" class="btn btn-default btn-xs bg-preset-btn" data-color="#090d16" style="background:#090d16; color:#fff; border-color:#333;">Default Dark</button>
                                        <button type="button" class="btn btn-default btn-xs bg-preset-btn" data-color="#0f172a" style="background:#0f172a; color:#fff; border-color:#333;">Slate Blue</button>
                                        <button type="button" class="btn btn-default btn-xs bg-preset-btn" data-color="#121212" style="background:#121212; color:#fff; border-color:#333;">Charcoal</button>
                                        <button type="button" class="btn btn-default btn-xs bg-preset-btn" data-color="#000000" style="background:#000000; color:#fff; border-color:#333;">Pure Black</button>
                                        <button type="button" class="btn btn-danger btn-xs" id="bgResetColorBtn">Reset</button>
                                    </div>
                                </div>
                                <p class="text-muted"><small>Pilih warna background dasar untuk seluruh halaman panel pengguna.</small></p>
                            </div>

                            <!-- Background Image -->
                            <div class="form-group">
                                <label class="control-label">Background Image (URL atau Upload File)</label>
                                <div class="input-group">
                                    <input type="text" id="bgImgInput" name="app:background_image" class="form-control" value="{{ old('app:background_image', config('app.background_image', '')) }}" placeholder="https://domain.com/wallpaper.jpg atau kosongkan untuk warna solid">
                                    <span class="input-group-btn">
                                        <label class="btn btn-default btn-file" style="margin-bottom: 0;">
                                            <i class="fa fa-upload"></i> Upload Image <input type="file" id="bgFileInput" name="app:background_file" accept="image/*" style="display: none;">
                                        </label>
                                    </span>
                                </div>
                                <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                                    <span style="font-size: 12px; color: #888;">Preset:</span>
                                    <button type="button" class="btn btn-default btn-xs bg-img-preset" data-url="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80">Cyber Dark</button>
                                    <button type="button" class="btn btn-default btn-xs bg-img-preset" data-url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80">Abstract Dark</button>
                                    <button type="button" class="btn btn-danger btn-xs" id="bgResetImgBtn">Hapus Background Image</button>
                                </div>
                            </div>

                            <!-- Live Interactive Mockup Preview -->
                            <div class="form-group" style="margin-top: 20px;">
                                <label class="control-label"><i class="fa fa-eye"></i> Live Preview Mockup</label>
                                <div id="livePreviewContainer" style="border-radius: 12px; border: 1px solid #334155; padding: 15px; min-height: 220px; background-color: {{ config('app.background_color') ?: '#090d16' }}; background-image: url('{{ config('app.background_image') }}'); background-size: cover; background-position: center; transition: all 0.3s ease;">
                                    <!-- Mini Navbar Mockup -->
                                    <div style="background: rgba(23, 23, 23, 0.9); border: 1px solid #333; border-radius: 8px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="width: 14px; height: 10px; border-top: 2px solid #aaa; border-bottom: 2px solid #aaa;"></div>
                                            <img id="mockupLogo" src="{{ config('app.logo', '/assets/svgs/pterodactyl.svg') }}" style="height: 18px; max-width: 60px; object-fit: contain;">
                                            <span id="mockupTitle" style="font-weight: bold; font-size: 12px; color: #fff;">{{ config('app.name', 'JKSoft Cloud') }}</span>
                                        </div>
                                        <div style="display: flex; gap: 6px; align-items: center;">
                                            <div style="width: 16px; height: 16px; background: #333; border-radius: 50%;"></div>
                                        </div>
                                    </div>
                                    <!-- Mini Content Mockup -->
                                    <div style="display: flex; gap: 12px;">
                                        <!-- Mini Sidebar -->
                                        <div style="width: 110px; background: rgba(23, 23, 23, 0.85); border: 1px solid #333; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 6px;">
                                            <div style="background: #2a2a2a; color: #fff; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">Dashboard</div>
                                            <div style="color: #888; padding: 3px 6px; font-size: 10px;">Servers</div>
                                            <div style="color: #888; padding: 3px 6px; font-size: 10px;">Account</div>
                                        </div>
                                        <!-- Mini Server Card -->
                                        <div style="flex: 1; background: rgba(23, 23, 23, 0.85); border: 1px solid #333; border-left: 3px solid #10b981; border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="font-weight: bold; font-size: 12px; color: #fff;">Production Server</div>
                                                <div style="font-size: 9px; color: #888; font-family: monospace;">192.168.1.1:25565</div>
                                            </div>
                                            <span style="font-size: 9px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 6px; border-radius: 4px;">Running</span>
                                        </div>
                                    </div>
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

            var bgColorPicker = $('#bgColorPicker');
            var bgColorInput = $('#bgColorInput');
            var bgImgInput = $('#bgImgInput');
            var bgFileInput = $('#bgFileInput');
            var livePreview = $('#livePreviewContainer');
            var mockupLogo = $('#mockupLogo');
            var mockupTitle = $('#mockupTitle');

            function updateLivePreview() {
                var color = bgColorInput.val().trim() || '#090d16';
                var img = bgImgInput.val().trim();

                livePreview.css('background-color', color);
                if (img) {
                    livePreview.css('background-image', "url('" + img + "')");
                } else {
                    livePreview.css('background-image', 'none');
                }
            }

            bgColorPicker.on('input change', function () {
                bgColorInput.val($(this).val());
                updateLivePreview();
            });

            bgColorInput.on('input change', function () {
                var val = $(this).val();
                if (/^#[0-9A-F]{6}$/i.test(val)) {
                    bgColorPicker.val(val);
                }
                updateLivePreview();
            });

            $('.bg-preset-btn').on('click', function () {
                var c = $(this).data('color');
                bgColorPicker.val(c);
                bgColorInput.val(c);
                updateLivePreview();
            });

            $('#bgResetColorBtn').on('click', function () {
                bgColorInput.val('');
                bgColorPicker.val('#090d16');
                updateLivePreview();
            });

            bgImgInput.on('input change', updateLivePreview);

            $('.bg-img-preset').on('click', function () {
                var u = $(this).data('url');
                bgImgInput.val(u);
                updateLivePreview();
            });

            $('#bgResetImgBtn').on('click', function () {
                bgImgInput.val('');
                bgFileInput.val('');
                updateLivePreview();
            });

            bgFileInput.on('change', function (e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        bgImgInput.val(event.target.result);
                        updateLivePreview();
                    };
                    reader.readAsDataURL(file);
                }
            });

            function updateLogoState() {
                var val = logoInput.val().trim();
                var isCustom = val !== '' && val !== defaultLogo;
                if (isCustom) {
                    logoTrash.show();
                    logoPreview.attr('src', val);
                    mockupLogo.attr('src', val);
                } else {
                    logoTrash.hide();
                    logoPreview.attr('src', defaultLogo);
                    mockupLogo.attr('src', defaultLogo);
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
                        mockupLogo.attr('src', event.target.result);
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
            updateLivePreview();
        });
    </script>
@endsection
