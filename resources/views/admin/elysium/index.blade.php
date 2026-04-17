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
                <form action="{{ route('admin.elysium.update') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6 ">
                                <label class="control-label">Website logo</label>
                                <div>
                                    <input id="logo" type="text" class="form-control" name="logo" @if(!empty($elysium)) value="{{ $elysium->logo }}" @endif required />
                                    <p class="text-muted"><small>The logo path or link for favicons, sidebar, meta, login form.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">Server Background Image</label>
                                <div>
                                    <input id="logo" type="text" class="form-control" name="server_background" @if(!empty($elysium)) value="{{ $elysium->server_background }}" @endif required />
                                    <p class="text-muted"><small>The background image path or link for background of all server.</small></p>
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
