@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'meta'])

@section('title')
    Elysium Settings
@endsection

@section('content-header')
    <h1>Elysium Meta<small>Configure meta tag Elysium theme.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Meta</li>
    </ol>
@endsection

@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Meta Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.meta.update') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-5">
                                <label class="control-label">Logo</label>
                                <div>
                                    <input id="logo" type="text" class="form-control" name="logo" value="{{ $elysium->logo }}" readonly />
                                    <p class="text-muted"><small>The meta logo and logo is the same as in the general setting.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-5">
                                <label class="control-label">Title</label>
                                <div>
                                    <input type="text" class="form-control" name="title" @if(!empty($elysium)) value="{{ $elysium->title }}" @endif required />
                                    <p class="text-muted"><small>The meta embed title.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-2">
                                <label class="control-label">Color</label>
                                <div>
                                    <input type="color" class="form-control" name="color_meta" @if(!empty($elysium)) value="{{ $elysium->color_meta }}" @endif required />
                                    <p class="text-muted"><small>The meta embed color.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-12">
                                <label class="control-label">Description</label>
                                <div>
                                    <textarea type="text" rows="4" class="form-control" name="description" required >@if(!empty($elysium)) {{ $elysium->description }} @endif</textarea>
                                    <p class="text-muted"><small>The meta embed description.</small></p>
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
