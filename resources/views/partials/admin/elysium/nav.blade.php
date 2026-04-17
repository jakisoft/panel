@section('elysium::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom nav-tabs-floating">
                <ul class="nav nav-tabs">
                    <li @if($activeTab === 'general')class="active"@endif><a href="{{ route('admin.elysium') }}">General Settings</a></li>
                    <li @if($activeTab === 'meta')class="active"@endif><a href="{{ route('admin.elysium.meta') }}">Meta Settings</a></li>
                    <li @if($activeTab === 'color')class="active"@endif><a href="{{ route('admin.elysium.color') }}">Color Settings</a></li>
                    <li @if($activeTab === 'auth')class="active"@endif><a href="{{ route('admin.elysium.auth') }}">Auth Settings</a></li>
                    <li @if($activeTab === 'announcement')class="active"@endif><a href="{{ route('admin.elysium.announcement') }}">Announcement Settings</a></li>
                    <li @if($activeTab === 'playground')class="active"@endif><a href="{{ route('admin.elysium.playground') }}">Playground Settings</a></li>
                </ul>
            </div>
        </div>
    </div>
@endsection
