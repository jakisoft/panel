@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'color'])

@section('title')
    Elysium Settings
@endsection

@section('content-header')
    <h1>Elysium Color<small>Configure color Elysium theme.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Color</li>
    </ol>
@endsection

@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-9">
            <div class="box-header with-border">
                <h3 class="box-title">Color Live Preview</h3>
            </div>
            <div class="iframe-container">
                <iframe width="100%" height="100%" src="/" style="height: 75vh; border: none"></iframe>
            </div>
        </div>
        <div class="col-md-3">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Color Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.color.update') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6 col-xs-6">
                                <label class="control-label">Color 1</label>
                                <div>
                                    <input type="color" class="form-control" name="color_1" @if(!empty($elysium)) value="{{ $elysium->color_1 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#0C0C2B</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-6 col-xs-6">
                                <label class="control-label">Color 2</label>
                                <div>
                                    <input type="color" class="form-control" name="color_2" @if(!empty($elysium)) value="{{ $elysium->color_2 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#0F1032</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-6 col-xs-6">
                                <label class="control-label">Color 3</label>
                                <div>
                                    <input type="color" class="form-control" name="color_3" @if(!empty($elysium)) value="{{ $elysium->color_3 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#1B1C3E</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-6 col-xs-6">
                                <label class="control-label">Color 4</label>
                                <div>
                                    <input type="color" class="form-control" name="color_4" @if(!empty($elysium)) value="{{ $elysium->color_4 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#303564</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-12">
                                <label class="control-label">Color 5</label>
                                <div>
                                    <input type="color" class="form-control" name="color_5" @if(!empty($elysium)) value="{{ $elysium->color_5 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#383E70</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-6 col-xs-6">
                                <label class="control-label">Color Console</label>
                                <div>
                                    <input type="color" class="form-control" name="color_console" @if(!empty($elysium)) value="{{ $elysium->color_console }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#1B1C3E</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-6 col-xs-6">
                                <label class="control-label">Color Editor</label>
                                <div>
                                    <input type="color" class="form-control" name="color_editor" @if(!empty($elysium)) value="{{ $elysium->color_editor }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#1B1C3E</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-4 col-xs-6">
                                <label class="control-label">Button Primary</label>
                                <div>
                                    <input type="color" class="form-control" name="color_6" @if(!empty($elysium)) value="{{ $elysium->color_6 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#2DCE89</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-4 col-xs-6">
                                <label class="control-label">Button Text</label>
                                <div>
                                    <input type="color" class="form-control" name="color_7" @if(!empty($elysium)) value="{{ $elysium->color_7 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#EAB208</code></small></p>
                                </div>  
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Button Danger</label>
                                <div>
                                    <input type="color" class="form-control" name="color_8" @if(!empty($elysium)) value="{{ $elysium->color_8 }}" @endif />
                                    <p class="text-muted"><small>Default color is <code>#F5365C</code></small></p>
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
