@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'cs'])

@section('title')
    CS Contact Settings
@endsection

@section('content-header')
    <h1><i class="fa fa-headphones text-primary"></i> CS Contact <small>Kelola tombol Customer Support mengambang dan saluran kontak dinamis.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">CS Contact</li>
    </ol>
@endsection

@section('content')
@yield('settings::nav')

<style>
    .switch-toggle-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .switch-toggle {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
        margin-bottom: 0;
        cursor: pointer;
    }
    .switch-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .switch-slider {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #cbd5e1;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 26px;
    }
    .switch-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    input:checked + .switch-slider {
        background-color: #10b981;
    }
    input:checked + .switch-slider:before {
        transform: translateX(22px);
    }

    /* Icon Badges */
    .icon-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 10px;
        color: white;
        font-size: 17px;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .icon-whatsapp { background-color: #25D366; }
    .icon-telegram { background-color: #229ED9; }
    .icon-discord { background-color: #5865F2; }
    .icon-instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
    .icon-tiktok { background-color: #000000; }
    .icon-email { background-color: #EA4335; }
    .icon-phone { background-color: #10B981; }
    .icon-message { background-color: #3B82F6; }
    .icon-globe { background-color: #6366F1; }
    .icon-headset { background-color: #8B5CF6; }

    /* Channel Item Row */
    .channel-item-row {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        transition: all 0.2s ease;
        overflow: hidden;
    }
    .channel-item-row:hover {
        border-color: #cbd5e1;
        box-shadow: 0 3px 10px rgba(0,0,0,0.06);
    }
    .channel-info-box {
        min-width: 0;
        flex: 1 1 0%;
        overflow: hidden;
    }
    .channel-url-wrap {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 2px;
    }
    .channel-url-wrap code {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
        padding: 2px 6px;
        border-radius: 4px;
    }

    /* Custom Visual Icon Dropdown */
    .custom-icon-dropdown {
        position: relative;
    }
    .custom-icon-trigger {
        width: 100%;
        padding: 8px 14px;
        background: #ffffff;
        border: 1px solid #d2d6de;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: border-color 0.2s ease;
        user-select: none;
    }
    .custom-icon-trigger:hover, .custom-icon-trigger.active {
        border-color: #3b82f6;
    }
    .custom-icon-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        max-height: 250px;
        overflow-y: auto;
        z-index: 1060;
        display: none;
        padding: 6px;
    }
    .custom-icon-menu.show {
        display: block;
    }
    .custom-icon-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s ease;
    }
    .custom-icon-option:hover {
        background: #f8fafc;
    }
    .custom-icon-option.selected {
        background: #eff6ff;
    }
</style>

<form id="csSettingsForm" action="{{ route('admin.settings.cs') }}" method="POST">
    {!! csrf_field() !!}
    {!! method_field('PATCH') !!}
    <input type="hidden" name="cs_items_json" id="csItemsJsonInput" value="{{ json_encode($cs['items']) }}">

    <div class="row">
        <!-- Card 1: Pengaturan Utama CS -->
        <div class="col-xs-12 col-md-5">
            <div class="box box-primary" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700; font-size: 16px;">
                            <i class="fa fa-sliders text-primary"></i> Pengaturan Floating CS
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Tombol bantuan di pojok kanan bawah.</p>
                    </div>
                    <div class="switch-toggle-wrap">
                        <label class="switch-toggle">
                            <input type="checkbox" name="cs_enabled" value="1" @if($cs['enabled']) checked @endif>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="box-body" style="padding: 18px;">
                    <div class="form-group">
                        <label class="control-label">Judul CS (Title)</label>
                        <input type="text" class="form-control" name="cs_title" value="{{ old('cs_title', $cs['title']) }}" placeholder="Customer Support" />
                        <p class="text-muted"><small>Judul header yang muncul di bagian atas kartu dropup CS.</small></p>
                    </div>
                    <div class="form-group">
                        <label class="control-label">Subjudul CS (Subtitle)</label>
                        <input type="text" class="form-control" name="cs_subtitle" value="{{ old('cs_subtitle', $cs['subtitle']) }}" placeholder="Butuh bantuan? Hubungi kami 24/7" />
                        <p class="text-muted"><small>Keterangan singkat / jam operasional bantuan.</small></p>
                    </div>

                    <div class="alert alert-info" style="margin-top: 15px; margin-bottom: 0; font-size: 12px; border-radius: 6px;">
                        <i class="fa fa-info-circle"></i> Tombol mengambang ini tampil di <strong>halaman utama (Dashboard)</strong> panel untuk memudahkan pengguna menghubungi Anda.
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 2: Kelola Saluran Kontak CS Dinamis -->
        <div class="col-xs-12 col-md-7">
            <div class="box box-info" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700; font-size: 16px;">
                            <i class="fa fa-list-ul text-info"></i> Daftar Saluran CS Dinamis
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Tambah, edit, dan kelola tautan kontak bantuan.</p>
                    </div>
                    <button type="button" class="btn btn-success btn-sm" id="btnOpenAddModal">
                        <i class="fa fa-plus-circle"></i> Tambah Saluran Baru
                    </button>
                </div>
                <div class="box-body" style="padding: 18px;">
                    <!-- Container List Items -->
                    <div id="channelsListContainer">
                        <!-- Rendered dynamically by JavaScript -->
                    </div>

                    <div id="emptyChannelsNotice" style="display: none; padding: 30px; text-align: center; color: #94a3b8;">
                        <i class="fa fa-inbox fa-3x" style="margin-bottom: 8px; display: block;"></i>
                        <p style="font-size: 14px; margin: 0;">Belum ada saluran CS yang ditambahkan.</p>
                        <p style="font-size: 12px;">Klik tombol <strong>"Tambah Saluran Baru"</strong> di atas.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Submit Button Bar -->
    <div class="row">
        <div class="col-xs-12">
            <div class="box" style="border-radius: 8px; padding: 14px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                    <a href="{{ route('admin.settings') }}" class="btn btn-default">
                        <i class="fa fa-times"></i> Batal
                    </a>
                    <button type="submit" class="btn btn-primary" style="font-weight: 600; padding: 8px 24px;">
                        <i class="fa fa-save"></i> Simpan Pengaturan CS
                    </button>
                </div>
            </div>
        </div>
    </div>
</form>

<!-- MODAL: Tambah / Edit Saluran CS -->
<div class="modal fade" id="channelModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content" style="border-radius: 8px;">
            <div class="modal-header" style="background-color: #f8fafc; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="channelModalTitle" style="font-weight: 700;">
                    <i class="fa fa-plus-circle text-success"></i> Tambah Saluran CS Baru
                </h4>
            </div>
            <div class="modal-body">
                <input type="hidden" id="modalItemId" value="">
                <input type="hidden" id="modalItemIcon" value="whatsapp">

                <!-- Nama Saluran -->
                <div class="form-group">
                    <label class="control-label">Nama Saluran CS <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="modalItemName" placeholder="Contoh: WhatsApp CS 1, Telegram Owner, Discord Support..." required>
                    <p class="text-muted"><small>Label kontak yang akan dilihat klien pada daftar bantuan.</small></p>
                </div>

                <!-- URL Saluran -->
                <div class="form-group">
                    <label class="control-label">URL / Tautan Tujuan <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="modalItemUrl" placeholder="Contoh: https://wa.me/6281234567890 atau https://t.me/CS_Official..." required>
                    <p class="text-muted"><small>Tautan lengkap (https://wa.me/..., https://t.me/..., https://discord.gg/..., mailto:..., tel:...)</small></p>
                </div>

                <!-- Custom Visual Icon Selector Dropdown -->
                <div class="form-group">
                    <label class="control-label">Pilih Icon Brand <span class="text-danger">*</span></label>
                    <div class="custom-icon-dropdown">
                        <div class="custom-icon-trigger" id="customIconTrigger">
                            <div style="display: flex; align-items: center; gap: 10px;" id="selectedIconPreview">
                                <div class="icon-badge icon-whatsapp" style="width: 28px; height: 28px; font-size: 14px; border-radius: 6px;">
                                    <i class="fa fa-whatsapp"></i>
                                </div>
                                <span style="font-weight: 600; font-size: 13px; color: #1e293b;">WhatsApp</span>
                            </div>
                            <i class="fa fa-chevron-down text-muted" style="font-size: 11px;"></i>
                        </div>
                        <div class="custom-icon-menu" id="customIconMenu">
                            <!-- Options rendered by JS -->
                        </div>
                    </div>
                    <p class="text-muted"><small>Pilih ikon brand yang sesuai dengan jenis kontak bantuan.</small></p>
                </div>
            </div>
            <div class="modal-footer" style="background-color: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <button type="button" class="btn btn-default" data-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary" id="btnSaveChannelModal" style="font-weight: 600;">
                    <i class="fa fa-check"></i> Simpan Saluran
                </button>
            </div>
        </div>
    </div>
</div>

@endsection

@section('footer-scripts')
@parent
<script>
    $(document).ready(function() {
        var items = {!! json_encode($cs['items']) !!} || [];

        var availableIcons = [
            { key: 'whatsapp', name: 'WhatsApp', fa: 'fa fa-whatsapp', cls: 'icon-whatsapp', desc: 'Hijau Resmi (#25D366)' },
            { key: 'telegram', name: 'Telegram', fa: 'fa fa-paper-plane', cls: 'icon-telegram', desc: 'Biru Langit (#229ED9)' },
            { key: 'discord', name: 'Discord', fa: 'fa fa-comments', cls: 'icon-discord', desc: 'Ungu Blurple (#5865F2)' },
            { key: 'instagram', name: 'Instagram', fa: 'fa fa-instagram', cls: 'icon-instagram', desc: 'Gradient Oranye-Ungu' },
            { key: 'tiktok', name: 'TikTok', fa: 'fa fa-music', cls: 'icon-tiktok', desc: 'Hitam Resmi (#000000)' },
            { key: 'email', name: 'Email Support', fa: 'fa fa-envelope', cls: 'icon-email', desc: 'Merah Google (#EA4335)' },
            { key: 'phone', name: 'Telepon / WhatsApp Call', fa: 'fa fa-phone', cls: 'icon-phone', desc: 'Hijau Emerald (#10B981)' },
            { key: 'message', name: 'Live Chat / Pesan', fa: 'fa fa-commenting', cls: 'icon-message', desc: 'Biru Chat (#3B82F6)' },
            { key: 'globe', name: 'Website / Help Center', fa: 'fa fa-globe', cls: 'icon-globe', desc: 'Indigo Web (#6366F1)' },
            { key: 'headset', name: 'Headset / Support Care', fa: 'fa fa-headphones', cls: 'icon-headset', desc: 'Ungu Violet (#8B5CF6)' }
        ];

        function getIconInfo(iconKey) {
            for (var i = 0; i < availableIcons.length; i++) {
                if (availableIcons[i].key === iconKey) {
                    return availableIcons[i];
                }
            }
            return availableIcons[0]; // fallback to whatsapp
        }

        // Render Custom Icon Dropdown Options
        function renderCustomIconMenu(selectedKey) {
            var $menu = $('#customIconMenu');
            $menu.empty();

            availableIcons.forEach(function(ico) {
                var isSel = (ico.key === selectedKey);
                var optHtml = '' +
                '<div class="custom-icon-option ' + (isSel ? 'selected' : '') + '" data-key="' + ico.key + '">' +
                    '<div style="display: flex; align-items: center; gap: 10px;">' +
                        '<div class="icon-badge ' + ico.cls + '" style="width: 30px; height: 30px; font-size: 14px; border-radius: 6px;">' +
                            '<i class="' + ico.fa + '"></i>' +
                        '</div>' +
                        '<div>' +
                            '<div style="font-weight: 600; font-size: 13px; color: #1e293b;">' + ico.name + '</div>' +
                            '<div style="font-size: 11px; color: #64748b;">' + ico.desc + '</div>' +
                        '</div>' +
                    '</div>' +
                    (isSel ? '<i class="fa fa-check text-primary" style="font-size: 14px;"></i>' : '') +
                '</div>';
                $menu.append(optHtml);
            });

            // Update Trigger display
            var selInfo = getIconInfo(selectedKey);
            $('#selectedIconPreview').html(
                '<div class="icon-badge ' + selInfo.cls + '" style="width: 28px; height: 28px; font-size: 14px; border-radius: 6px;">' +
                    '<i class="' + selInfo.fa + '"></i>' +
                '</div>' +
                '<span style="font-weight: 600; font-size: 13px; color: #1e293b;">' + selInfo.name + '</span>'
            );
            $('#modalItemIcon').val(selectedKey);
        }

        // Custom Dropdown Trigger Click
        $('#customIconTrigger').on('click', function(e) {
            e.stopPropagation();
            $('#customIconMenu').toggleClass('show');
            $(this).toggleClass('active');
        });

        // Select Option Click
        $(document).on('click', '.custom-icon-option', function(e) {
            e.stopPropagation();
            var key = $(this).data('key');
            renderCustomIconMenu(key);
            $('#customIconMenu').removeClass('show');
            $('#customIconTrigger').removeClass('active');
        });

        // Close dropdown on outside click
        $(document).on('click', function() {
            $('#customIconMenu').removeClass('show');
            $('#customIconTrigger').removeClass('active');
        });

        // Render List of Channels
        function renderItems() {
            var $container = $('#channelsListContainer');
            $container.empty();

            if (!items || items.length === 0) {
                $('#emptyChannelsNotice').show();
            } else {
                $('#emptyChannelsNotice').hide();
                items.forEach(function(item, index) {
                    var iconInfo = getIconInfo(item.icon);
                    var html = '' +
                    '<div class="channel-item-row" data-index="' + index + '">' +
                        '<div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1 1 0%; overflow: hidden;">' +
                            '<div class="icon-badge ' + iconInfo.cls + '">' +
                                '<i class="' + iconInfo.fa + '"></i>' +
                            '</div>' +
                            '<div class="channel-info-box">' +
                                '<h5 style="margin: 0 0 2px 0; font-weight: 700; font-size: 14px; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(item.name) + '</h5>' +
                                '<div class="channel-url-wrap">' +
                                    '<code>' + escapeHtml(item.url) + '</code>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">' +
                            (index > 0 ? '<button type="button" class="btn btn-default btn-xs btn-move-up" data-index="' + index + '" title="Pindah Ke Atas"><i class="fa fa-arrow-up"></i></button>' : '') +
                            (index < items.length - 1 ? '<button type="button" class="btn btn-default btn-xs btn-move-down" data-index="' + index + '" title="Pindah Ke Bawah"><i class="fa fa-arrow-down"></i></button>' : '') +
                            '<button type="button" class="btn btn-info btn-xs btn-edit-item" data-index="' + index + '" title="Edit Saluran"><i class="fa fa-pencil"></i></button>' +
                            '<button type="button" class="btn btn-danger btn-xs btn-delete-item" data-index="' + index + '" title="Hapus Saluran"><i class="fa fa-trash"></i></button>' +
                        '</div>' +
                    '</div>';
                    $container.append(html);
                });
            }

            $('#csItemsJsonInput').val(JSON.stringify(items));
        }

        function escapeHtml(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        // Open Add Modal
        $('#btnOpenAddModal').on('click', function() {
            $('#modalItemId').val('');
            $('#modalItemName').val('');
            $('#modalItemUrl').val('');
            renderCustomIconMenu('whatsapp');
            $('#channelModalTitle').html('<i class="fa fa-plus-circle text-success"></i> Tambah Saluran CS Baru');
            $('#channelModal').modal('show');
        });

        // Edit Item Click
        $(document).on('click', '.btn-edit-item', function() {
            var index = $(this).data('index');
            var item = items[index];
            if (item) {
                $('#modalItemId').val(index);
                $('#modalItemName').val(item.name);
                $('#modalItemUrl').val(item.url);
                renderCustomIconMenu(item.icon || 'whatsapp');
                $('#channelModalTitle').html('<i class="fa fa-pencil text-info"></i> Edit Saluran CS');
                $('#channelModal').modal('show');
            }
        });

        // Delete Item Click with Custom Confirmation Modal
        $(document).on('click', '.btn-delete-item', function() {
            var index = $(this).data('index');
            var item = items[index];
            if (!item) return;

            window.CustomDialog.show({
                title: 'Hapus Saluran CS?',
                text: 'Apakah Anda yakin ingin menghapus saluran "' + item.name + '"? Saluran ini tidak akan ditampilkan lagi di popover bantuan.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus Saluran',
                cancelButtonText: 'Batal'
            }, function () {
                items.splice(index, 1);
                renderItems();
            });
        });

        // Move Up
        $(document).on('click', '.btn-move-up', function() {
            var index = $(this).data('index');
            if (index > 0) {
                var temp = items[index];
                items[index] = items[index - 1];
                items[index - 1] = temp;
                renderItems();
            }
        });

        // Move Down
        $(document).on('click', '.btn-move-down', function() {
            var index = $(this).data('index');
            if (index < items.length - 1) {
                var temp = items[index];
                items[index] = items[index + 1];
                items[index + 1] = temp;
                renderItems();
            }
        });

        // Save in Modal
        $('#btnSaveChannelModal').on('click', function() {
            var name = $.trim($('#modalItemName').val());
            var url = $.trim($('#modalItemUrl').val());
            var icon = $('#modalItemIcon').val() || 'whatsapp';
            var editIndex = $('#modalItemId').val();

            if (!name) {
                alert('Nama saluran wajib diisi.');
                $('#modalItemName').focus();
                return;
            }
            if (!url) {
                alert('URL / Tautan tujuan wajib diisi.');
                $('#modalItemUrl').focus();
                return;
            }

            if (editIndex !== '') {
                // Edit existing
                items[parseInt(editIndex)] = {
                    id: items[parseInt(editIndex)].id || ('item_' + Date.now()),
                    name: name,
                    url: url,
                    icon: icon
                };
            } else {
                // Add new
                items.push({
                    id: 'item_' + Date.now(),
                    name: name,
                    url: url,
                    icon: icon
                });
            }

            renderItems();
            $('#channelModal').modal('hide');
        });

        // Initial render
        renderItems();
    });
</script>
@endsection
