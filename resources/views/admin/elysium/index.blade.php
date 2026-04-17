@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'general'])

@section('title')
    Elysium Settings
@endsection

@section('content-header')
    <h1>Elysium General<small>Configure general Elysium theme.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">General</li>
    </ol>
@endsection

@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-9">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">General Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.update') }}" method="POST" enctype="multipart/form-data">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6 ">
                                <label class="control-label">Website logo</label>
                                <div>
                                    <input id="logo" type="text" class="form-control" name="logo" @if(!empty($elysium)) value="{{ $elysium->logo }}" @endif placeholder="https://example.com/logo.png or /favicons/android-chrome-512x512.png" />
                                    <p class="text-muted"><small>The logo path or link for favicons, sidebar, meta, login form.</small></p>

                                    <label class="control-label" style="margin-top: 12px;">Upload Logo</label>
                                    <input id="logo_upload" type="file" class="form-control" name="logo_upload" accept="image/*" />
                                    <p class="text-muted"><small>Upload image directly and it will be saved as <code>/favicons/android-chrome-512x512.[ext]</code>.</small></p>

                                    <input type="hidden" id="remove_logo" name="remove_logo" value="0" />
                                    <div id="logo_preview_wrapper" style="margin-top: 12px; display: {{ !empty($elysium->logo) ? 'inline-block' : 'none' }}; position: relative; max-width: 260px;">
                                        <img id="logo_preview" src="{{ !empty($elysium->logo) ? $elysium->logo : '' }}" alt="Logo preview" style="max-width: 100%; max-height: 140px; border-radius: 8px; border: 1px solid #ddd;" />
                                        <button type="button" id="remove_logo_btn" class="btn btn-xs btn-danger" style="position: absolute; top: 6px; right: 6px; border-radius: 999px; width: 28px; height: 28px; padding: 0;">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group col-md-6">
                                <label class="control-label">Server Background Image</label>
                                <div>
                                    <input id="server_background" type="text" class="form-control" name="server_background" @if(!empty($elysium)) value="{{ $elysium->server_background }}" @endif placeholder="https://example.com/background.jpg or /images/server-background.jpg" />
                                    <p class="text-muted"><small>The background image path or link for background of all server.</small></p>

                                    <label class="control-label" style="margin-top: 12px;">Upload Server Background</label>
                                    <input id="server_background_upload" type="file" class="form-control" name="server_background_upload" accept="image/*" />
                                    <p class="text-muted"><small>Upload image directly and it will be saved as <code>/images/server-background.[ext]</code>.</small></p>

                                    <input type="hidden" id="remove_server_background" name="remove_server_background" value="0" />
                                    <div id="server_background_preview_wrapper" style="margin-top: 12px; display: {{ !empty($elysium->server_background) ? 'inline-block' : 'none' }}; position: relative; max-width: 260px;">
                                        <img id="server_background_preview" src="{{ !empty($elysium->server_background) ? $elysium->server_background : '' }}" alt="Background preview" style="max-width: 100%; max-height: 140px; border-radius: 8px; border: 1px solid #ddd;" />
                                        <button type="button" id="remove_server_background_btn" class="btn btn-xs btn-danger" style="position: absolute; top: 6px; right: 6px; border-radius: 999px; width: 28px; height: 28px; padding: 0;">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Copyright By</label>
                                <div>
                                    <input type="text" class="form-control" name="copyright_by" @if(!empty($elysium)) value="{{ $elysium->copyright_by }}" @endif required />
                                    <p class="text-muted"><small>The copyright website name of the website.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Copyright Link</label>
                                <div>
                                    <input type="text" class="form-control" name="copyright_link" @if(!empty($elysium)) value="{{ $elysium->copyright_link }}" @endif required />
                                    <p class="text-muted"><small>The copyright link of the website.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Copyright Start Year</label>
                                <div>
                                    <input type="text" class="form-control" name="copyright_start_year" @if(!empty($elysium)) value="{{ $elysium->copyright_start_year }}" @endif required />
                                    <p class="text-muted"><small>The copyright start year of the website.</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="col-md-3">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Theme Information</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-12">
                            <label class="control-label">Name</label>
                            <div>
                                <input class="form-control" @if(!empty($elysium)) value="Elysium" @endif readonly />
                            </div>
                        </div>
                        <div class="form-group col-md-12">
                            <label class="control-label">Version</label>
                            <div>
                                <input class="form-control" value="1.0.0" readonly />
                            </div>
                        </div>
                        <div class="form-group col-md-12">
                            <label class="control-label">Author</label>
                            <div>
                                <input class="form-control" value="JKSoft Production"readonly />
                            </div>
                        </div>
                        <div class="form-group col-md-12">
                            <label class="control-label">Get Support</label>
                            <a href="https://t.me/otnexa" target="_blank">
                                <button class="btn btn-warning" style="width:100%;" >
                                    <i class="fa fa-fw fa-support"></i>
                                    Telegram
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        (function () {
            const bindPreview = function (inputId, previewId, wrapperId, removeInputId) {
                const fileInput = document.getElementById(inputId + '_upload');
                const urlInput = document.getElementById(inputId);
                const preview = document.getElementById(previewId);
                const wrapper = document.getElementById(wrapperId);
                const removeInput = document.getElementById(removeInputId);
                const removeBtn = document.getElementById('remove_' + inputId + '_btn');

                if (!fileInput || !urlInput || !preview || !wrapper || !removeInput || !removeBtn) return;

                fileInput.addEventListener('change', function (event) {
                    const file = event.target.files && event.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = function (readerEvent) {
                        preview.src = readerEvent.target.result;
                        wrapper.style.display = 'inline-block';
                        removeInput.value = '0';
                    };
                    reader.readAsDataURL(file);
                });

                urlInput.addEventListener('input', function () {
                    if (!urlInput.value) return;
                    preview.src = urlInput.value;
                    wrapper.style.display = 'inline-block';
                    removeInput.value = '0';
                });

                removeBtn.addEventListener('click', function () {
                    if (!window.confirm('Are you sure you want to remove this image?')) return;

                    removeInput.value = '1';
                    urlInput.value = '';
                    fileInput.value = '';
                    preview.src = '';
                    wrapper.style.display = 'none';
                });
            };

            bindPreview('logo', 'logo_preview', 'logo_preview_wrapper', 'remove_logo');
            bindPreview('server_background', 'server_background_preview', 'server_background_preview_wrapper', 'remove_server_background');
        })();
    </script>
@endsection
