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

    .icon-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        color: white;
        font-size: 16px;
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

    .channel-item-row {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        transition: all 0.2s ease;
    }
    .channel-item-row:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
                        <input type="text" class="form-control" name="cs_subtitle" value="{{ old('cs_subtitle', $cs['subtitle']) }}" placeholder="Butuh bantuan? Hubungi kami" />
                        <p class="text-muted"><small>Keterangan singkat / jam operasional bantuan.</small></p>
                    </div>

                    <div class="alert alert-info" style="margin-top: 15px; margin-bottom: 0; font-size: 12px; border-radius: 6px;">
                        <i class="fa fa-info-circle"></i> Tombol mengambang ini hanya akan tampil di <strong>halaman utama (Dashboard)</strong> panel untuk memudahkan klien mendapatkan bantuan.
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 2: Kelola Saluran Kontak CS Dinamis (Tambah, Edit, Hapus) -->
        <div class="col-xs-12 col-md-7">
            <div class="box box-info" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div class="box-header with-border" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 class="box-title" style="font-weight: 700; font-size: 16px;">
                            <i class="fa fa-list-ul text-info"></i> Daftar Saluran CS Dinamis
                        </h3>
                        <p class="text-muted" style="margin: 2px 0 0 0; font-size: 13px;">Tambah, edit, dan atur tautan bantuan support Anda.</p>
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

                <!-- Nama Saluran -->
                <div class="form-group">
                    <label class="control-label">Nama Saluran CS <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="modalItemName" placeholder="Contoh: WhatsApp CS 1, Telegram Owner, Discord Support..." required>
                    <p class="text-muted"><small>Label yang akan dilihat pengguna pada daftar kontak.</small></p>
                </div>

                <!-- URL Saluran -->
                <div class="form-group">
                    <label class="control-label">URL / Tautan Tujuan <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="modalItemUrl" placeholder="Contoh: https://wa.me/6281234567890 atau https://t.me/CS_Official..." required>
                    <p class="text-muted"><small>Tautan lengkap (https://wa.me/..., https://t.me/..., https://discord.gg/..., mailto:..., tel:...)</small></p>
                </div>

                <!-- Pilih Icon -->
                <div class="form-group">
                    <label class="control-label">Pilih Icon Brand <span class="text-danger">*</span></label>
                    <select class="form-control" id="modalItemIcon">
                        <option value="whatsapp" data-color="#25D366">🟢 WhatsApp</option>
                        <option value="telegram" data-color="#229ED9">🔵 Telegram</option>
                        <option value="discord" data-color="#5865F2">🟣 Discord</option>
                        <option value="instagram" data-color="#E4405F">📸 Instagram</option>
                        <option value="tiktok" data-color="#000000">🎵 TikTok</option>
                        <option value="email" data-color="#EA4335">🔴 Email Support</option>
                        <option value="phone" data-color="#10B981">📞 Telepon / Panggilan</option>
                        <option value="message" data-color="#3B82F6">💬 Live Chat / Pesan</option>
                        <option value="globe" data-color="#6366F1">🌐 Website / Help Center</option>
                        <option value="headset" data-color="#8B5CF6">🎧 Headset / Helpdesk</option>
                    </select>
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

        function getIconFa(iconKey) {
            switch(iconKey) {
                case 'whatsapp': return { fa: 'fa fa-whatsapp', cls: 'icon-whatsapp', label: 'WhatsApp' };
                case 'telegram': return { fa: 'fa fa-paper-plane', cls: 'icon-telegram', label: 'Telegram' };
                case 'discord': return { fa: 'fa fa-comments', cls: 'icon-discord', label: 'Discord' };
                case 'instagram': return { fa: 'fa fa-instagram', cls: 'icon-instagram', label: 'Instagram' };
                case 'tiktok': return { fa: 'fa fa-music', cls: 'icon-tiktok', label: 'TikTok' };
                case 'email': return { fa: 'fa fa-envelope', cls: 'icon-email', label: 'Email' };
                case 'phone': return { fa: 'fa fa-phone', cls: 'icon-phone', label: 'Telepon' };
                case 'message': return { fa: 'fa fa-commenting', cls: 'icon-message', label: 'Chat' };
                case 'globe': return { fa: 'fa fa-globe', cls: 'icon-globe', label: 'Web' };
                default: return { fa: 'fa fa-headphones', cls: 'icon-headset', label: 'Support' };
            }
        }

        function renderItems() {
            var $container = $('#channelsListContainer');
            $container.empty();

            if (!items || items.length === 0) {
                $('#emptyChannelsNotice').show();
            } else {
                $('#emptyChannelsNotice').hide();
                items.forEach(function(item, index) {
                    var iconInfo = getIconFa(item.icon);
                    var html = '' +
                    '<div class="channel-item-row" data-index="' + index + '">' +
                        '<div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">' +
                            '<div class="icon-badge ' + iconInfo.cls + '">' +
                                '<i class="' + iconInfo.fa + '"></i>' +
                            '</div>' +
                            '<div style="min-width: 0; flex: 1;">' +
                                '<h5 style="margin: 0 0 3px 0; font-weight: 700; font-size: 14px; color: #1e293b;" class="truncate">' + escapeHtml(item.name) + '</h5>' +
                                '<p style="margin: 0; font-size: 12px; color: #64748b;" class="truncate"><code>' + escapeHtml(item.url) + '</code></p>' +
                            '</div>' +
                        '</div>' +
                        '<div style="display: flex; align-items: center; gap: 6px; shrink: 0;">' +
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
            $('#modalItemIcon').val('whatsapp');
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
                $('#modalItemIcon').val(item.icon || 'whatsapp');
                $('#channelModalTitle').html('<i class="fa fa-pencil text-info"></i> Edit Saluran CS');
                $('#channelModal').modal('show');
            }
        });

        // Delete Item Click
        $(document).on('click', '.btn-delete-item', function() {
            var index = $(this).data('index');
            if (confirm('Apakah Anda yakin ingin menghapus saluran CS ini?')) {
                items.splice(index, 1);
                renderItems();
            }
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
            var icon = $('#modalItemIcon').val();
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
