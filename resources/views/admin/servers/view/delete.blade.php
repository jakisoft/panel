@extends('layouts.admin')

@section('title')
    Server — {{ $server->name }}: Delete
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>Delete this server from the panel.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">Delete</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Safely Delete Server</h3>
            </div>
            <div class="box-body">
                <p>This action will attempt to delete the server from both the panel and daemon. If either one reports an error the action will be cancelled.</p>
                <p class="text-danger small">Deleting a server is an irreversible action. <strong>All server data</strong> (including files and users) will be removed from the system.</p>
            </div>
            <div class="box-footer">
                <form id="deleteform" action="{{ route('admin.servers.view.delete', $server->id) }}" method="POST">
                    {!! csrf_field() !!}
                    <button id="deletebtn" class="btn btn-danger">Safely Delete This Server</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title">Force Delete Server</h3>
            </div>
            <div class="box-body">
                <p>This action will attempt to delete the server from both the panel and daemon. If the daemon does not respond, or reports an error the deletion will continue.</p>
                <p class="text-danger small">Deleting a server is an irreversible action. <strong>All server data</strong> (including files and users) will be removed from the system. This method may leave dangling files on your daemon if it reports an error.</p>
            </div>
            <div class="box-footer">
                <form id="forcedeleteform" action="{{ route('admin.servers.view.delete', $server->id) }}" method="POST">
                    {!! csrf_field() !!}
                    <input type="hidden" name="force_delete" value="1" />
                    <button id="forcedeletebtn"" class="btn btn-danger">Forcibly Delete This Server</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    $('#deletebtn').click(function (event) {
        event.preventDefault();
        window.CustomDialog.show({
            title: 'Hapus Server Ini?',
            type: 'warning',
            text: 'Apakah Anda yakin ingin menghapus server ini? Tindakan ini tidak dapat dibatalkan, seluruh data server akan dihapus secara permanen.',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus Server',
            cancelButtonText: 'Batal'
        }, function () {
            $('#deleteform').submit();
        });
    });

    $('#forcedeletebtn').click(function (event) {
        event.preventDefault();
        window.CustomDialog.show({
            title: 'Hapus Paksa Server Ini?',
            type: 'warning',
            text: 'PERINGATAN: Tindakan hapus paksa akan menghapus server dari panel meskipun daemon tidak merespons. Seluruh data akan hilang.',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus Paksa',
            cancelButtonText: 'Batal'
        }, function () {
            $('#forcedeleteform').submit();
        });
    });
    </script>
@endsection
