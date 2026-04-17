@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'announcement'])


@section('title')
    Elysium Settings
@endsection

@section('content-header')
    <h1>Elysium Announcement<small>Configure announcement Elysium theme.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Announcement</li>
    </ol>
@endsection


@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Announcement Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.announcement.update') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-2">
                                <label class="control-label">Announcement Type</label>
                                <div>
                                    <select class="form-control" name="announcement_type">
                                        <option value="disable" @if(!empty($elysium) && $elysium->announcement_type === 'disable') selected @endif>Disable</option>
                                        <option value="information" @if(!empty($elysium) && $elysium->announcement_type === 'information') selected @endif>Information</option>
                                        <option value="update" @if(!empty($elysium) && $elysium->announcement_type === 'update') selected @endif>Update</option>
                                        <option value="warning" @if(!empty($elysium) && $elysium->announcement_type === 'warning') selected @endif>Warning</option>
                                        <option value="error" @if(!empty($elysium) && $elysium->announcement_type === 'error') selected @endif>Error</option>
                                    </select>
                                    <p class="text-muted"><small>The type of the Announcement.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-2">
                                <label class="control-label">Announcement Closable</label>
                                <div>
                                    <select class="form-control" name="announcement_closable">
                                        <option value="enable" @if(!empty($elysium) && $elysium->announcement_closable === 'enable') selected @endif>Enable</option>
                                        <option value="disable" @if(!empty($elysium) && $elysium->announcement_closable === 'disable') selected @endif>Disable</option>
                                    </select>
                                    <p class="text-muted"><small>Allow closing announcement.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-8">
                                <label class="control-label">Announcement Message</label>
                                <div>
                                    <textarea type="text" class="form-control" rows="3" name="announcement_message" required>@if(!empty($elysium)){{ $elysium->announcement_message }}@endif</textarea>
                                    <p class="text-muted"><small>The message of the Announcement.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-3 col-xs-6">
                                <label class="control-label">Information Color</label>
                                <div>
                                    <input type="color" class="form-control" name="color_information" @if(!empty($elysium)) value="{{ $elysium->color_information }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#589AFC</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-3 col-xs-6">
                                <label class="control-label">Update Color</label>
                                <div>
                                    <input type="color" class="form-control" name="color_update" @if(!empty($elysium)) value="{{ $elysium->color_update }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#45AF45</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-3 col-xs-6">
                                <label class="control-label">Warning Color</label>
                                <div>
                                    <input type="color" class="form-control" name="color_warning" @if(!empty($elysium)) value="{{ $elysium->color_warning }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#DF5438</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-3 col-xs-6">
                                <label class="control-label">Error Color</label>
                                <div>
                                    <input type="color" class="form-control" name="color_error" @if(!empty($elysium)) value="{{ $elysium->color_error }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#D53F3F</code></small></p>
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
    </div>
@endsection
