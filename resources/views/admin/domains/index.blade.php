@extends('layouts.admin')

@section('title')
    Master Domain Manager
@endsection

@section('content-header')
    <h1><i class="fa fa-globe text-primary"></i> Master Domain & Cloudflare <small>Kelola domain untuk subdomain server & token API Cloudflare.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}"><i class="fa fa-dashboard"></i> Admin</a></li>
        <li class="active">Master Domains</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <!-- Global Cloudflare Settings -->
    <div class="col-xs-12">
        <div class="box box-info" style="border-radius: 8px;">
            <div class="box-header with-border" style="padding: 16px;">
                <h3 class="box-title" style="font-weight: 700;">
                    <i class="fa fa-key text-info"></i> Global Cloudflare API Token
                </h3>
                <p class="text-muted" style="margin: 4px 0 0 0; font-size: 13px;">
                    Token API Cloudflare default yang digunakan untuk membuat dan menghapus DNS Record subdomain secara otomatis.
                </p>
            </div>
            <form action="{{ route('admin.domains.global') }}" method="POST">
                <div class="box-body" style="padding: 16px;">
                    <div class="form-group">
                        <label class="control-label">Cloudflare API Token (Zone.DNS Edit & Zone Read Permission)</label>
                        <input type="password" class="form-control" name="global_api_token" value="{{ old('global_api_token', $global_api_token) }}" placeholder="Contoh: vL7x... (Kosongkan jika tidak diubah)" />
                        <p class="text-muted" style="margin-top: 5px; font-size: 12px;">
                            Buat API Token di Cloudflare Dashboard ➔ <strong>My Profile ➔ API Tokens ➔ Create Custom Token</strong> (Permissions: <code>Zone:DNS:Edit</code>, <code>Zone:Zone:Read</code>).
                        </p>
                    </div>
                </div>
                <div class="box-footer" style="padding: 12px 16px;">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-primary pull-right">
                        <i class="fa fa-save"></i> Simpan Token Global
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add New Master Domain Form -->
    <div class="col-md-5 col-xs-12">
        <div class="box box-success" style="border-radius: 8px;">
            <div class="box-header with-border" style="padding: 16px;">
                <h3 class="box-title" style="font-weight: 700;">
                    <i class="fa fa-plus-circle text-success"></i> Tambah Master Domain
                </h3>
                <p class="text-muted" style="margin: 4px 0 0 0; font-size: 13px;">
                    Daftarkan domain yang dapat dipilih oleh user untuk membuat subdomain.
                </p>
            </div>
            <form action="{{ route('admin.domains.store') }}" method="POST">
                <div class="box-body" style="padding: 16px;">
                    <div class="form-group">
                        <label class="control-label">Nama Domain Utama</label>
                        <input type="text" class="form-control" name="domain" placeholder="Contoh: jksoft.cloud atau lapakgratis.eu.cc" required />
                    </div>

                    <div class="form-group">
                        <label class="control-label">Cloudflare Zone ID</label>
                        <input type="text" class="form-control" name="zone_id" placeholder="Contoh: c4b1c2d3e4f5..." required />
                        <p class="text-muted" style="margin-top: 4px; font-size: 12px;">Ditemukan di halaman Overview domain pada Cloudflare dashboard.</p>
                    </div>

                    <div class="form-group">
                        <label class="control-label">Custom API Token (Opsional)</label>
                        <input type="password" class="form-control" name="api_token" placeholder="Kosongkan jika menggunakan Token Global di atas" />
                    </div>

                    <div class="row">
                        <div class="form-group col-sm-6">
                            <label class="control-label">Tipe Record Utama</label>
                            <select name="record_type" class="form-control">
                                <option value="CNAME" selected>CNAME (Rekomendasi)</option>
                                <option value="A">A Record (Direct IP)</option>
                            </select>
                        </div>
                        <div class="form-group col-sm-6">
                            <label class="control-label">Protokol Game / App</label>
                            <select name="protocol" class="form-control">
                                <option value="tcp" selected>TCP (Minecraft / Steam)</option>
                                <option value="udp">UDP (SA-MP / Voice)</option>
                                <option value="http">HTTP / HTTPS (Web / API)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="box-footer" style="padding: 12px 16px;">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-success btn-block" style="font-weight: 600;">
                        <i class="fa fa-plus"></i> Tambahkan Master Domain
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Master Domains List Table -->
    <div class="col-md-7 col-xs-12">
        <div class="box box-primary" style="border-radius: 8px;">
            <div class="box-header with-border" style="padding: 16px;">
                <h3 class="box-title" style="font-weight: 700;">
                    <i class="fa fa-list text-primary"></i> Daftar Master Domain
                </h3>
                <p class="text-muted" style="margin: 4px 0 0 0; font-size: 13px;">
                    Domain yang saat ini aktif dan siap digunakan untuk subdomain server.
                </p>
            </div>
            <div class="box-body no-padding table-responsive">
                <table class="table table-hover table-striped">
                    <thead>
                        <tr style="background-color: #f8fafc;">
                            <th style="padding: 14px 16px;">Domain</th>
                            <th style="padding: 14px 16px;">Zone ID</th>
                            <th style="padding: 14px 16px;">Record / Proto</th>
                            <th style="padding: 14px 16px;">Server Aktif</th>
                            <th style="padding: 14px 16px; text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($domains as $domain)
                            <tr>
                                <td style="padding: 14px 16px; vertical-align: middle;">
                                    <i class="fa fa-globe text-primary" style="margin-right: 6px;"></i>
                                    <strong>{{ $domain->domain }}</strong>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle; color: #64748b; font-size: 12px;">
                                    <code>{{ substr($domain->zone_id, 0, 12) }}...</code>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle;">
                                    <span class="label label-info">{{ $domain->record_type }}</span>
                                    <span class="label label-default">{{ strtoupper($domain->protocol) }}</span>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle;">
                                    <span class="badge bg-green">{{ $domain->server_domains_count }}</span>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: middle; text-align: right;">
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
                                    <p style="font-size: 14px; margin: 0; color: #64748b;">Belum ada master domain yang ditambahkan.</p>
                                    <p style="font-size: 12px; color: #94a3b8;">Gunakan formulir di samping untuk menambahkan domain pertama Anda.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
