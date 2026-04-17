@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'pricing'])

@section('title')
    Elysium Pricing Settings
@endsection

@section('content-header')
    <h1>Elysium Pricing<small>Configure pricing cards for playground & user pricing page.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Pricing</li>
    </ol>
@endsection

@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Pricing Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.pricing.update') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">Pricing Title</label>
                                <input type="text" class="form-control" name="playground_pricing_title" value="{{ old('playground_pricing_title', $elysium->playground_pricing_title ?? 'Paket Pricing Panel') }}" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">Pricing Subtitle</label>
                                <input type="text" class="form-control" name="playground_pricing_subtitle" value="{{ old('playground_pricing_subtitle', $elysium->playground_pricing_subtitle ?? '') }}">
                            </div>
                        </div>

                        <div id="pricing_items"></div>
                        <button type="button" class="btn btn-default btn-sm" id="add_pricing">Add Pricing Item</button>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary btn-sm pull-right">Save</button>
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
            const pricingContainer = document.getElementById('pricing_items');
            const initialPricing = @json($pricingItems);

            const createCardWrapper = (title) => {
                const card = document.createElement('div');
                card.className = 'well pricing-item';
                card.style.marginBottom = '10px';

                const header = document.createElement('div');
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';
                header.style.marginBottom = '10px';
                header.innerHTML = `<strong>${title}</strong>`;

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'btn btn-xs btn-danger';
                removeButton.innerText = 'Remove';
                removeButton.addEventListener('click', () => card.remove());
                header.appendChild(removeButton);

                card.appendChild(header);
                return card;
            };

            const addPricingItem = (item = { name: '', price: '', description: '', features: [] }) => {
                const index = pricingContainer.querySelectorAll('.pricing-item').length;
                const card = createCardWrapper('Pricing Item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-4"><label>Name</label><input type="text" class="form-control" name="pricing[${index}][name]" value="${item.name || ''}" required></div>
                        <div class="form-group col-md-4"><label>Price</label><input type="text" class="form-control" name="pricing[${index}][price]" value="${item.price || ''}" required></div>
                        <div class="form-group col-md-4"><label>Description</label><input type="text" class="form-control" name="pricing[${index}][description]" value="${item.description || ''}"></div>
                        <div class="form-group col-md-12"><label>Features (one per line)</label><textarea class="form-control" rows="3" name="pricing[${index}][features]">${Array.isArray(item.features) ? item.features.join('\n') : ''}</textarea></div>
                    </div>`;

                pricingContainer.appendChild(card);
            };

            document.getElementById('add_pricing').addEventListener('click', () => addPricingItem());
            (initialPricing.length ? initialPricing : [{ name: '', price: '', description: '', features: [] }]).forEach(addPricingItem);
        })();
    </script>
@endsection
