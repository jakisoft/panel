@extends('layouts.admin')
@include('partials/admin.elysium.nav', ['activeTab' => 'playground'])

@section('title')
    Elysium Playground Settings
@endsection

@section('content-header')
    <h1>Elysium Playground<small>Customize public playground page content.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Playground</li>
    </ol>
@endsection

@section('content')
    @yield('elysium::nav')
    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Playground Settings</h3>
                </div>
                <form action="{{ route('admin.elysium.playground.update') }}" method="POST">
                    {!! csrf_field() !!}
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Hero Badge</label>
                                <input type="text" class="form-control" name="playground_badge" value="{{ old('playground_badge', $elysium->playground_badge ?? 'Pterodactyl + Elysium Theme') }}" required>
                            </div>
                            <div class="form-group col-md-8">
                                <label class="control-label">Hero Title</label>
                                <input type="text" class="form-control" name="playground_hero_title" value="{{ old('playground_hero_title', $elysium->playground_hero_title ?? 'Kelola Server Lebih Cepat dan Modern.') }}" required>
                            </div>
                            <div class="form-group col-md-12">
                                <label class="control-label">Hero Description</label>
                                <textarea class="form-control" rows="3" name="playground_hero_description">{{ old('playground_hero_description', $elysium->playground_hero_description ?? '') }}</textarea>
                            </div>
                        </div>

                        <hr>
                        <h4>Pricing Section</h4>
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

                        <hr>
                        <h4>FAQ Section</h4>
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">FAQ Badge</label>
                                <input type="text" class="form-control" name="playground_faq_badge" value="{{ old('playground_faq_badge', $elysium->playground_faq_badge ?? 'Pusat Bantuan') }}" required>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">FAQ Title</label>
                                <input type="text" class="form-control" name="playground_faq_title" value="{{ old('playground_faq_title', $elysium->playground_faq_title ?? 'Pertanyaan Populer') }}" required>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">FAQ Subtitle</label>
                                <input type="text" class="form-control" name="playground_faq_subtitle" value="{{ old('playground_faq_subtitle', $elysium->playground_faq_subtitle ?? '') }}">
                            </div>
                        </div>

                        <div id="faq_items"></div>
                        <button type="button" class="btn btn-default btn-sm" id="add_faq">Add FAQ Item</button>

                        <hr>
                        <h4>Asymmetry Visual Cards</h4>
                        <div id="visual_cards"></div>
                        <button type="button" class="btn btn-default btn-sm" id="add_visual">Add Visual Card</button>
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
            const faqContainer = document.getElementById('faq_items');
            const visualContainer = document.getElementById('visual_cards');

            const initialPricing = @json($pricingItems);
            const initialFaq = @json($faqItems);
            const initialVisual = @json($visualCards);

            const createCardWrapper = (title) => {
                const card = document.createElement('div');
                card.className = 'well';
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
                card.classList.add('pricing-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-4">
                            <label>Name</label>
                            <input type="text" class="form-control" name="pricing[${index}][name]" value="${item.name || ''}" required>
                        </div>
                        <div class="form-group col-md-4">
                            <label>Price</label>
                            <input type="text" class="form-control" name="pricing[${index}][price]" value="${item.price || ''}" required>
                        </div>
                        <div class="form-group col-md-4">
                            <label>Description</label>
                            <input type="text" class="form-control" name="pricing[${index}][description]" value="${item.description || ''}">
                        </div>
                        <div class="form-group col-md-12">
                            <label>Features (one per line)</label>
                            <textarea class="form-control" rows="3" name="pricing[${index}][features]">${Array.isArray(item.features) ? item.features.join('\n') : ''}</textarea>
                        </div>
                    </div>
                `;

                pricingContainer.appendChild(card);
            };

            const addFaqItem = (item = { question: '', answer: '' }) => {
                const index = faqContainer.querySelectorAll('.faq-item').length;
                const card = createCardWrapper('FAQ Item');
                card.classList.add('faq-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-5">
                            <label>Question</label>
                            <input type="text" class="form-control" name="faq[${index}][question]" value="${item.question || ''}" required>
                        </div>
                        <div class="form-group col-md-7">
                            <label>Answer</label>
                            <textarea class="form-control" rows="2" name="faq[${index}][answer]" required>${item.answer || ''}</textarea>
                        </div>
                    </div>
                `;

                faqContainer.appendChild(card);
            };

            const addVisualCard = (item = { title: '', value: '', description: '' }) => {
                const index = visualContainer.querySelectorAll('.visual-item').length;
                const card = createCardWrapper('Visual Card');
                card.classList.add('visual-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-4">
                            <label>Title</label>
                            <input type="text" class="form-control" name="visual_cards[${index}][title]" value="${item.title || ''}" required>
                        </div>
                        <div class="form-group col-md-4">
                            <label>Value</label>
                            <input type="text" class="form-control" name="visual_cards[${index}][value]" value="${item.value || ''}" required>
                        </div>
                        <div class="form-group col-md-4">
                            <label>Description</label>
                            <input type="text" class="form-control" name="visual_cards[${index}][description]" value="${item.description || ''}">
                        </div>
                    </div>
                `;

                visualContainer.appendChild(card);
            };

            document.getElementById('add_pricing').addEventListener('click', () => addPricingItem());
            document.getElementById('add_faq').addEventListener('click', () => addFaqItem());
            document.getElementById('add_visual').addEventListener('click', () => addVisualCard());

            (initialPricing.length ? initialPricing : [{ name: '', price: '', description: '', features: [] }]).forEach(addPricingItem);
            (initialFaq.length ? initialFaq : [{ question: '', answer: '' }]).forEach(addFaqItem);
            (initialVisual.length ? initialVisual : [{ title: 'Total Users', value: '0', description: '' }, { title: 'Total Servers', value: '0', description: '' }]).forEach(addVisualCard);
        })();
    </script>
@endsection
