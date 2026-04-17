@extends('layouts.admin')

@section('title')
    Pricing Settings
@endsection

@section('content-header')
    <h1>Pricing Settings<small>Configure premium pricing cards for playground and user pricing page.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Pricing</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Pricing</h3>
                </div>
                <form action="{{ route('admin.pricing.update') }}" method="POST">
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

            const readFeatures = (features, type) => {
                if (!Array.isArray(features)) return '';
                return features
                    .filter((feature) => feature && feature.type === type)
                    .map((feature) => feature.text)
                    .filter(Boolean)
                    .join('\n');
            };

            const addPricingItem = (item = { name: '', monthly_price: 15000, cpu: '1 vCPU', memory: '2 GB', disk: '20 GB', description: '', features: [] }) => {
                const index = pricingContainer.querySelectorAll('.pricing-item').length;
                const card = createCardWrapper('Pricing Item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-3"><label>Name</label><input type="text" class="form-control" name="pricing[${index}][name]" value="${item.name || ''}" required></div>
                        <div class="form-group col-md-3"><label>Harga Bulanan (angka)</label><input type="number" min="0" class="form-control" name="pricing[${index}][monthly_price]" value="${Number(item.monthly_price || 0)}" required></div>
                        <div class="form-group col-md-2"><label>CPU</label><input type="text" class="form-control" name="pricing[${index}][cpu]" value="${item.cpu || ''}" required></div>
                        <div class="form-group col-md-2"><label>Memory</label><input type="text" class="form-control" name="pricing[${index}][memory]" value="${item.memory || ''}" required></div>
                        <div class="form-group col-md-2"><label>Disk</label><input type="text" class="form-control" name="pricing[${index}][disk]" value="${item.disk || ''}" required></div>
                        <div class="form-group col-md-12"><label>Description</label><textarea class="form-control" rows="2" name="pricing[${index}][description]">${item.description || ''}</textarea></div>
                        <div class="form-group col-md-6"><label>Included Features (✅, one per line)</label><textarea class="form-control" rows="3" name="pricing[${index}][included_features]">${readFeatures(item.features, 'include')}</textarea></div>
                        <div class="form-group col-md-6"><label>Excluded Features (❌, one per line)</label><textarea class="form-control" rows="3" name="pricing[${index}][excluded_features]">${readFeatures(item.features, 'exclude')}</textarea></div>
                    </div>`;

                pricingContainer.appendChild(card);
            };

            document.getElementById('add_pricing').addEventListener('click', () => addPricingItem());
            (initialPricing.length ? initialPricing : [{ name: '', monthly_price: 15000, cpu: '1 vCPU', memory: '2 GB', disk: '20 GB', description: '', features: [] }]).forEach(addPricingItem);
        })();
    </script>
@endsection
