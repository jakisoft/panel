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
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="google_auth_enabled" value="1" {{ !empty($elysium->google_auth_enabled) ? 'checked' : '' }}>
                                        Enable Google Login
                                    </label>
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
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="github_auth_enabled" value="1" {{ !empty($elysium->github_auth_enabled) ? 'checked' : '' }}>
                                        Enable GitHub Login
                                    </label>
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
