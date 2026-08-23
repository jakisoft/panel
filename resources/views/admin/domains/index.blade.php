@extends('layouts.admin')

@section('title')
    Master Domain & Cloudflare Routing
@endsection

@section('content-header')
    <h1><i class="fa fa-globe text-primary"></i> Master Domain & Cloudflare <small>Kelola domain untuk subdomain server, koneksi Cloudflare, dan status routing.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}"><i class="fa fa-dashboard"></i> Admin</a></li>
        <li class="active">Master Domains</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <ul class="nav nav-tabs" style="padding: 6px 12px 0 12px; font-weight: 600;">
                <li class="active">
                    <a href="#tab_master_domains" data-toggle="tab">
                        <i class="fa fa-list text-primary"></i> Master Domains Pool
                    </a>
                </li>
                <li>
                    <a href="#tab_general_settings" data-toggle="tab">
                        <i class="fa fa-key text-info"></i> Cloudflare API & Pengaturan
                    </a>
                </li>
                <li>
                    <a href="#tab_server_domains" data-toggle="tab">
                        <i class="fa fa-server text-success"></i> Server Routing Overview ({{ count($server_domains) }})
                    </a>
                </li>
            </ul>

            <div class="tab-content" style="padding: 20px;">
                <!-- TAB 1: Master Domains Pool -->
                <div class="tab-pane active" id="tab_master_domains">
                    <div class="row">
                        <!-- Add Form Column -->
                        <div class="col-md-4 col-xs-12">
                            <div class="box box-solid" style="border: 1px solid #e2e8f0; border-radius: 8px;">
                                <div class="box-header with-border" style="background-color: #f8fafc; padding: 14px 16px;">
                                    <h3 class="box-title" style="font-size: 15px; font-weight: 700;">
                                        <i class="fa fa-plus-circle text-success"></i> Tambah Master Domain
                                    </h3>
                                </div>
                                <form action="{{ route('admin.domains.store') }}" method="POST">
                                    <div class="box-body" style="padding: 16px;">
                                        <div class="form-group">
                                            <label class="control-label">Nama Domain Utama</label>
                                            <input type="text" class="form-control" name="domain" placeholder="Contoh: jksoft.cloud" required />
                                        </div>

                                        <div class="form-group">
                                            <label class="control-label">Cloudflare Zone ID</label>
                                            <input type="text" class="form-control" name="zone_id" placeholder="Zone ID dari Cloudflare" required />
                                            <p class="text-muted" style="margin-top: 4px; font-size: 11px;">Ditemukan di halaman Overview domain pada Cloudflare dashboard.</p>
                                        </div>

                                        <div class="form-group">
                                            <label class="control-label">Custom API Token (Opsional)</label>
                                            <input type="password" class="form-control" name="api_token" placeholder="Kosongkan jika pakai Token Global" />
                                        </div>

                                        <div class="row">
                                            <div class="form-group col-xs-6">
                                                <label class="control-label">Record Type</label>
                                                <select name="record_type" class="form-control">
                                                    <option value="CNAME" selected>CNAME</option>
                                                    <option value="A">A Record</option>
                                                </select>
                                            </div>
                                            <div class="form-group col-xs-6">
                                                <label class="control-label">Protokol</label>
                                                <select name="protocol" class="form-control">
                                                    <option value="tcp" selected>TCP (Game)</option>
                                                    <option value="udp">UDP</option>
                                                    <option value="http">HTTP</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="box-footer" style="padding: 12px 16px; background-color: #f8fafc;">
                                        {!! csrf_field() !!}
                                        <button type="submit" class="btn btn-success btn-block" style="font-weight: 600;">
                                            <i class="fa fa-plus"></i> Simpan Master Domain
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Table Column -->
                        <div class="col-md-8 col-xs-12">
                            <div class="box box-solid" style="border: 1px solid #e2e8f0; border-radius: 8px;">
                                <div class="box-header with-border" style="background-color: #f8fafc; padding: 14px 16px;">
                                    <h3 class="box-title" style="font-size: 15px; font-weight: 700;">
                                        <i class="fa fa-list text-primary"></i> Daftar Master Domain
                                    </h3>
                                </div>
                                <div class="box-body no-padding table-responsive">
                                    <table class="table table-hover table-striped">
                                        <thead>
                                            <tr style="background-color: #f8fafc;">
                                                <th style="padding: 12px 16px;">Domain</th>
                                                <th style="padding: 12px 16px;">Zone ID</th>
                                                <th style="padding: 12px 16px;">Tipe / Proto</th>
                                                <th style="padding: 12px 16px;">Server Aktif</th>
                                                <th style="padding: 12px 16px; text-align: right;">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @forelse($domains as $domain)
                                                <tr>
                                                    <td style="padding: 12px 16px; vertical-align: middle;">
                                                        <i class="fa fa-globe text-primary" style="margin-right: 6px;"></i>
                                                        <strong>{{ $domain->domain }}</strong>
                                                    </td>
                                                    <td style="padding: 12px 16px; vertical-align: middle; color: #64748b; font-size: 12px;">
                                                        <code>{{ substr($domain->zone_id, 0, 10) }}...</code>
                                                    </td>
                                                    <td style="padding: 12px 16px; vertical-align: middle;">
                                                        <span class="label label-info">{{ $domain->record_type }}</span>
                                                        <span class="label label-default">{{ strtoupper($domain->protocol) }}</span>
                                                    </td>
                                                    <td style="padding: 12px 16px; vertical-align: middle;">
                                                        <span class="badge bg-green">{{ $domain->server_domains_count }}</span>
                                                    </td>
                                                    <td style="padding: 12px 16px; vertical-align: middle; text-align: right;">
                                                        <button type="button" class="btn btn-sm btn-info btn-test-zone" data-id="{{ $domain->id }}" title="Test Koneksi Cloudflare Zone">
                                                            <i class="fa fa-plug"></i> Test
                                                        </button>
                                                        <form action="{{ route('admin.domains.delete', $domain->id) }}" method="POST" style="display: inline-block;" onsubmit="return confirm('Hapus master domain {{ $domain->domain }}?');">
                                                            {!! csrf_field() !!}
                                                            {!! method_field('DELETE') !!}
                                                            <button type="submit" class="btn btn-sm btn-danger" title="Hapus">
                                                                <i class="fa fa-trash"></i>
                                                            </button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            @empty
                                                <tr>
                                                    <td colspan="5" class="text-center text-muted" style="padding: 36px 16px;">
                                                        <i class="fa fa-globe fa-3x" style="color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
                                                        <p style="font-size: 14px; margin: 0; color: #64748b;">Belum ada master domain yang didaftarkan.</p>
                                                    </td>
                                                </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: Cloudflare API & General Settings -->
                <div class="tab-pane" id="tab_general_settings">
                    <div class="box box-solid" style="border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div class="box-header with-border" style="background-color: #f8fafc; padding: 14px 16px;">
                            <h3 class="box-title" style="font-size: 15px; font-weight: 700;">
                                <i class="fa fa-cogs text-info"></i> Konfigurasi API Cloudflare
                            </h3>
                        </div>
                        <form action="{{ route('admin.domains.global') }}" method="POST">
                            <div class="box-body" style="padding: 16px;">
                                <div class="form-group">
                                    <label class="control-label">Global Cloudflare API Token</label>
                                    <input type="password" id="global_api_token" class="form-control" name="global_api_token" value="{{ old('global_api_token', $global_api_token) }}" placeholder="Contoh: vL7xQ... (Kosongkan jika tidak diubah)" />
                                    <p class="text-muted" style="margin-top: 6px; font-size: 12px;">
                                        Token API ini digunakan untuk otomatisasi pembuatan & penghapusan DNS record subdomain di Cloudflare.
                                    </p>
                                </div>

                                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                    <button type="button" id="btnTestGlobalToken" class="btn btn-default btn-sm">
                                        <i class="fa fa-check-circle"></i> Test Validitas Token Cloudflare
                                    </button>
                                    <span id="globalTokenTestResult" style="font-size: 13px;"></span>
                                </div>
                            </div>
                            <div class="box-footer" style="padding: 12px 16px; background-color: #f8fafc;">
                                {!! csrf_field() !!}
                                <button type="submit" class="btn btn-primary pull-right">
                                    <i class="fa fa-save"></i> Simpan Token Global
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- TAB 3: Server Domains Overview -->
                <div class="tab-pane" id="tab_server_domains">
                    <div class="box box-solid" style="border: 1px solid #e2e8f0; border-radius: 8px;">
                        <div class="box-header with-border" style="background-color: #f8fafc; padding: 14px 16px;">
                            <h3 class="box-title" style="font-size: 15px; font-weight: 700;">
                                <i class="fa fa-server text-success"></i> Server dengan Domain Aktif
                            </h3>
                        </div>
                        <div class="box-body no-padding table-responsive">
                            <table class="table table-hover table-striped">
                                <thead>
                                    <tr style="background-color: #f8fafc;">
                                        <th style="padding: 12px 16px;">Server</th>
                                        <th style="padding: 12px 16px;">Owner</th>
                                        <th style="padding: 12px 16px;">Domain Terhubung</th>
                                        <th style="padding: 12px 16px;">Tipe</th>
                                        <th style="padding: 12px 16px;">Status / Log</th>
                                        <th style="padding: 12px 16px; text-align: right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($server_domains as $sd)
                                        <tr>
                                            <td style="padding: 12px 16px; vertical-align: middle;">
                                                @if($sd->server)
                                                    <a href="{{ route('admin.servers.view', $sd->server->id) }}" target="_blank">
                                                        <strong>{{ $sd->server->name }}</strong>
                                                    </a>
                                                    <span class="text-muted block" style="font-size: 11px;">{{ $sd->server->uuidShort }}</span>
                                                @else
                                                    <span class="text-muted">Server Telah Dihapus</span>
                                                @endif
                                            </td>
                                            <td style="padding: 12px 16px; vertical-align: middle; font-size: 13px;">
                                                {{ $sd->server && $sd->server->user ? $sd->server->user->username : '-' }}
                                            </td>
                                            <td style="padding: 12px 16px; vertical-align: middle;">
                                                <code style="font-weight: 600;">{{ $sd->mode === 'subdomain' ? $sd->full_subdomain : $sd->custom_domain }}</code>
                                            </td>
                                            <td style="padding: 12px 16px; vertical-align: middle;">
                                                @if($sd->mode === 'subdomain')
                                                    <span class="label label-info">SUBDOMAIN</span>
                                                @else
                                                    <span class="label label-warning">CUSTOM TUNNEL</span>
                                                @endif
                                            </td>
                                            <td style="padding: 12px 16px; vertical-align: middle; color: #64748b; font-size: 12px;">
                                                <span class="text-success"><i class="fa fa-check-circle"></i> Aktif</span>
                                            </td>
                                            <td style="padding: 12px 16px; vertical-align: middle; text-align: right;">
                                                <form action="{{ route('admin.domains.server.delete', $sd->id) }}" method="POST" style="display: inline-block;" onsubmit="return confirm('Reset routing domain untuk server ini?');">
                                                    {!! csrf_field() !!}
                                                    {!! method_field('DELETE') !!}
                                                    <button type="submit" class="btn btn-sm btn-danger" title="Reset & Hapus Routing">
                                                        <i class="fa fa-times"></i> Reset
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="6" class="text-center text-muted" style="padding: 36px 16px;">
                                                <i class="fa fa-server fa-3x" style="color: #cbd5e1; margin-bottom: 10px; display: block;"></i>
                                                <p style="font-size: 14px; margin: 0; color: #64748b;">Belum ada server yang mengaktifkan domain.</p>
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
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
        $(document).ready(function () {
            // Test Global Cloudflare API Token
            $('#btnTestGlobalToken').on('click', function () {
                var btn = $(this);
                var resultSpan = $('#globalTokenTestResult');
                btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Memeriksa...');
                resultSpan.html('');

                $.ajax({
                    url: '{{ route('admin.domains.test.global') }}',
                    type: 'POST',
                    data: {
                        _token: '{{ csrf_token() }}',
                        api_token: $('#global_api_token').val()
                    },
                    success: function (res) {
                        if (res.success) {
                            resultSpan.html('<span class="text-success"><i class="fa fa-check-circle"></i> ' + res.message + '</span>');
                        } else {
                            resultSpan.html('<span class="text-danger"><i class="fa fa-times-circle"></i> ' + res.message + '</span>');
                        }
                    },
                    error: function (xhr) {
                        resultSpan.html('<span class="text-danger"><i class="fa fa-times-circle"></i> Gagal menghubungi endpoint server.</span>');
                    },
                    complete: function () {
                        btn.prop('disabled', false).html('<i class="fa fa-check-circle"></i> Test Validitas Token Cloudflare');
                    }
                });
            });

            // Test Master Domain Zone
            $('.btn-test-zone').on('click', function () {
                var btn = $(this);
                var poolId = btn.data('id');
                var origHtml = btn.html();
                btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i>');

                $.ajax({
                    url: '/admin/domains/test/' + poolId,
                    type: 'POST',
                    data: { _token: '{{ csrf_token() }}' },
                    success: function (res) {
                        alert(res.message);
                    },
                    error: function () {
                        alert('Gagal menghubungi Cloudflare untuk zone ini.');
                    },
                    complete: function () {
                        btn.prop('disabled', false).html(origHtml);
                    }
                });
            });
        });
    </script>
@endsection
