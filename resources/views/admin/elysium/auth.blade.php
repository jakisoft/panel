@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'auth'])

@section('title')
    Elysium Auth Settings
@endsection

@section('content-header')
    <h1>Elysium Auth<small>Configure Google & GitHub OAuth login settings.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Auth Settings</li>
    </ol>
@endsection

@section('content')
    @yield('elysium::nav')

    <style>
        .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: #d1d5db; transition: .3s; border-radius: 999px; }
        .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; top: 3px; background-color: white; transition: .3s; border-radius: 999px; }
        input:checked + .slider { background-color: #4f46e5; }
        input:checked + .slider:before { transform: translateX(22px); }
    </style>

    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Auth Provider Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.auth.update') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h4 style="margin-top:0;">Google OAuth</h4>
                                <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                                    <label class="switch">
                                        <input type="checkbox" name="google_auth_enabled" value="1" {{ !empty($elysium->google_auth_enabled) ? 'checked' : '' }}>
                                        <span class="slider"></span>
                                    </label>
                                    <span><strong>{{ !empty($elysium->google_auth_enabled) ? 'Enabled' : 'Disabled' }}</strong> - Toggle Google Login</span>
                                </div>
                                <div class="form-group">
                                    <label class="control-label">Google Client ID</label>
                                    <input type="text" class="form-control" name="google_client_id" value="{{ $elysium->google_client_id ?? '' }}" placeholder="Google OAuth Client ID">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">Google Client Secret</label>
                                    <input type="text" class="form-control" name="google_client_secret" value="{{ $elysium->google_client_secret ?? '' }}" placeholder="Google OAuth Client Secret">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">Google Callback URL</label>
                                    <input type="url" class="form-control" name="google_callback_url" value="{{ $elysium->google_callback_url ?? url('/auth/google/callback') }}" placeholder="https://panel.example.com/auth/google/callback">
                                </div>
                            </div>

                            <div class="col-md-6">
                                <h4 style="margin-top:0;">GitHub OAuth</h4>
                                <div class="form-group" style="display:flex;align-items:center;gap:12px;">
                                    <label class="switch">
                                        <input type="checkbox" name="github_auth_enabled" value="1" {{ !empty($elysium->github_auth_enabled) ? 'checked' : '' }}>
                                        <span class="slider"></span>
                                    </label>
                                    <span><strong>{{ !empty($elysium->github_auth_enabled) ? 'Enabled' : 'Disabled' }}</strong> - Toggle GitHub Login</span>
                                </div>
                                <div class="form-group">
                                    <label class="control-label">GitHub Client ID</label>
                                    <input type="text" class="form-control" name="github_client_id" value="{{ $elysium->github_client_id ?? '' }}" placeholder="GitHub OAuth Client ID">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">GitHub Client Secret</label>
                                    <input type="text" class="form-control" name="github_client_secret" value="{{ $elysium->github_client_secret ?? '' }}" placeholder="GitHub OAuth Client Secret">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">GitHub Callback URL</label>
                                    <input type="url" class="form-control" name="github_callback_url" value="{{ $elysium->github_callback_url ?? url('/auth/github/callback') }}" placeholder="https://panel.example.com/auth/github/callback">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
