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
                            <div class="form-group col-md-4">
                                <label class="control-label">Brand Name (Header & Footer)</label>
                                <input type="text" class="form-control" name="playground_brand_name" value="{{ old('playground_brand_name', $elysium->playground_brand_name ?? 'Elysium Panel') }}" required>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Brand Icon (Lucide Name)</label>
                                <input type="text" class="form-control" name="playground_brand_icon" value="{{ old('playground_brand_icon', $elysium->playground_brand_icon ?? 'Server') }}" required>
                                <p class="text-muted"><small>Example: <code>Server</code>, <code>Shield</code>, <code>Rocket</code>, <code>Cloud</code>.</small></p>
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
                        <h4>Asymmetry Visual Cards (Value auto dari API Pterodactyl)</h4>
                        <div id="visual_cards"></div>

                        <hr>
                        <h4>Footer Navigation Links</h4>
                        <div id="footer_links"></div>
                        <button type="button" class="btn btn-default btn-sm" id="add_footer_link">Add Footer Link</button>

                        <hr>
                        <h4>Footer Social Links</h4>
                        <div id="social_links"></div>
                        <button type="button" class="btn btn-default btn-sm" id="add_social_link">Add Social Link</button>
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
            const faqContainer = document.getElementById('faq_items');
            const visualContainer = document.getElementById('visual_cards');
            const footerContainer = document.getElementById('footer_links');
            const socialContainer = document.getElementById('social_links');

            const initialFaq = @json($faqItems);
            const initialVisual = @json($visualCards);
            const initialFooterLinks = @json($footerLinks);
            const initialSocialLinks = @json($socialLinks);

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

            const addFaqItem = (item = { question: '', answer: '' }) => {
                const index = faqContainer.querySelectorAll('.faq-item').length;
                const card = createCardWrapper('FAQ Item');
                card.classList.add('faq-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-5"><label>Question</label><input type="text" class="form-control" name="faq[${index}][question]" value="${item.question || ''}" required></div>
                        <div class="form-group col-md-7"><label>Answer</label><textarea class="form-control" rows="2" name="faq[${index}][answer]" required>${item.answer || ''}</textarea></div>
                    </div>`;

                faqContainer.appendChild(card);
            };

            const addVisualCard = (item = { key: 'total_users', title: '', description: '' }) => {
                const index = visualContainer.querySelectorAll('.visual-item').length;
                const card = createCardWrapper('Visual Card');
                card.classList.add('visual-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-3">
                            <label>Source</label>
                            <select class="form-control" name="visual_cards[${index}][key]" required>
                                <option value="total_users" ${item.key === 'total_users' ? 'selected' : ''}>Total Users</option>
                                <option value="total_servers" ${item.key === 'total_servers' ? 'selected' : ''}>Total Servers</option>
                            </select>
                        </div>
                        <div class="form-group col-md-4"><label>Title</label><input type="text" class="form-control" name="visual_cards[${index}][title]" value="${item.title || ''}" required></div>
                        <div class="form-group col-md-5"><label>Description</label><input type="text" class="form-control" name="visual_cards[${index}][description]" value="${item.description || ''}"></div>
                    </div>`;

                visualContainer.appendChild(card);
            };

            const addFooterLink = (item = { label: '', url: '' }) => {
                const index = footerContainer.querySelectorAll('.footer-link-item').length;
                const card = createCardWrapper('Footer Link');
                card.classList.add('footer-link-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-5"><label>Label</label><input type="text" class="form-control" name="footer_links[${index}][label]" value="${item.label || ''}" required></div>
                        <div class="form-group col-md-7"><label>URL</label><input type="text" class="form-control" name="footer_links[${index}][url]" value="${item.url || ''}" required></div>
                    </div>`;

                footerContainer.appendChild(card);
            };

            const addSocialLink = (item = { label: '', url: '', icon: 'Globe' }) => {
                const index = socialContainer.querySelectorAll('.social-link-item').length;
                const card = createCardWrapper('Social Link');
                card.classList.add('social-link-item');

                card.innerHTML += `
                    <div class="row">
                        <div class="form-group col-md-3"><label>Icon (Lucide)</label><input type="text" class="form-control" name="social_links[${index}][icon]" value="${item.icon || 'Globe'}" required></div>
                        <div class="form-group col-md-3"><label>Label</label><input type="text" class="form-control" name="social_links[${index}][label]" value="${item.label || ''}" required></div>
                        <div class="form-group col-md-6"><label>URL</label><input type="text" class="form-control" name="social_links[${index}][url]" value="${item.url || ''}" required></div>
                    </div>`;

                socialContainer.appendChild(card);
            };

            document.getElementById('add_faq').addEventListener('click', () => addFaqItem());
            document.getElementById('add_footer_link').addEventListener('click', () => addFooterLink());
            document.getElementById('add_social_link').addEventListener('click', () => addSocialLink());

            (initialFaq.length ? initialFaq : [{ question: '', answer: '' }]).forEach(addFaqItem);
            (initialVisual.length ? initialVisual : [{ key: 'total_users', title: 'Total Users', description: '' }, { key: 'total_servers', title: 'Total Servers', description: '' }]).forEach(addVisualCard);
            (initialFooterLinks.length ? initialFooterLinks : [{ label: 'Beranda', url: '#home' }]).forEach(addFooterLink);
            (initialSocialLinks.length ? initialSocialLinks : [{ label: 'Website', url: '#', icon: 'Globe' }]).forEach(addSocialLink);
        })();
    </script>
@endsection
