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

@php
    $colorFields = [
        ['name' => 'color_1', 'label' => 'Color 1', 'default' => '#0C0C2B'],
        ['name' => 'color_2', 'label' => 'Color 2', 'default' => '#0F1032'],
        ['name' => 'color_3', 'label' => 'Color 3', 'default' => '#1B1C3E'],
        ['name' => 'color_4', 'label' => 'Color 4', 'default' => '#303564'],
        ['name' => 'color_5', 'label' => 'Color 5', 'default' => '#383E70'],
        ['name' => 'color_console', 'label' => 'Color Console', 'default' => '#1B1C3E'],
        ['name' => 'color_editor', 'label' => 'Color Editor', 'default' => '#1B1C3E'],
        ['name' => 'color_6', 'label' => 'Button Primary', 'default' => '#2DCE89'],
        ['name' => 'color_7', 'label' => 'Button Text', 'default' => '#EAB208'],
        ['name' => 'color_8', 'label' => 'Button Danger', 'default' => '#F5365C'],
    ];
@endphp

@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-8">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Color Live Preview</h3>
                </div>
                <div class="box-body">
                    <div id="elysium-preview" style="border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
                        <div style="padding: 14px; background: #0C0C2B; color: #fff;" data-preview="color_1">Background 1</div>
                        <div style="padding: 14px; background: #0F1032; color: #fff;" data-preview="color_2">Background 2</div>
                        <div style="padding: 14px; background: #1B1C3E; color: #fff;" data-preview="color_3">Background 3</div>
                        <div style="padding: 14px; background: #303564; color: #fff;" data-preview="color_4">Background 4</div>
                        <div style="padding: 14px; background: #383E70; color: #fff;" data-preview="color_5">Background 5</div>
                        <div style="padding: 14px; display:flex; gap:8px; background:#fff;">
                            <button class="btn btn-success" type="button" data-preview="color_6">Primary</button>
                            <button class="btn btn-warning" type="button" data-preview="color_7">Text</button>
                            <button class="btn btn-danger" type="button" data-preview="color_8">Danger</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Color Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.color.update') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        @foreach($colorFields as $field)
                            @php
                                $value = !empty($elysium) ? ($elysium->{$field['name']} ?? $field['default']) : $field['default'];
                            @endphp
                            <div class="form-group">
                                <label class="control-label">{{ $field['label'] }}</label>
                                <div class="input-group">
                                    <span class="input-group-addon" style="padding:0; border:0; background:transparent;">
                                        <input
                                            type="color"
                                            class="elysium-color-input"
                                            name="{{ $field['name'] }}"
                                            value="{{ $value }}"
                                            data-sync="#text_{{ $field['name'] }}"
                                            data-preview-target="{{ $field['name'] }}"
                                            style="width: 48px; height: 34px; border: 1px solid #ddd; border-radius: 4px; padding: 0; cursor: pointer;"
                                        />
                                    </span>
                                    <input
                                        id="text_{{ $field['name'] }}"
                                        type="text"
                                        class="form-control"
                                        value="{{ $value }}"
                                        data-color-input="[name='{{ $field['name'] }}']"
                                        pattern="^#[0-9a-fA-F]{6}$"
                                    />
                                </div>
                                <p class="text-muted"><small>Default color is <code>{{ $field['default'] }}</code>.</small></p>
                            </div>
                        @endforeach
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        (function () {
            const colorInputs = document.querySelectorAll('.elysium-color-input');

            const applyPreview = (name, value) => {
                const previewItem = document.querySelector(`[data-preview="${name}"]`);
                if (!previewItem) return;

                if (['color_6', 'color_7', 'color_8'].includes(name)) {
                    previewItem.style.backgroundColor = value;
                    previewItem.style.borderColor = value;
                    return;
                }

                previewItem.style.backgroundColor = value;
            };

            colorInputs.forEach((input) => {
                const textInput = document.querySelector(input.dataset.sync);
                if (textInput) textInput.value = input.value;
                applyPreview(input.name, input.value);

                input.addEventListener('input', () => {
                    if (textInput) textInput.value = input.value;
                    applyPreview(input.name, input.value);
                });
            });

            document.querySelectorAll('input[data-color-input]').forEach((textInput) => {
                textInput.addEventListener('input', () => {
                    const target = document.querySelector(textInput.dataset.colorInput);
                    if (!target) return;
                    const value = textInput.value.trim();
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        target.value = value;
                        applyPreview(target.name, value);
                    }
                });
            });
        })();
    </script>
@endsection
