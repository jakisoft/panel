<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('elysium', function (Blueprint $table) {
            $table->string('playground_badge')->default('Pterodactyl + Elysium Theme')->after('color_auth_label_text');
            $table->string('playground_hero_title')->default('Kelola Server Lebih Cepat dan Modern.')->after('playground_badge');
            $table->text('playground_hero_description')->nullable()->after('playground_hero_title');
            $table->string('playground_pricing_title')->default('Paket Pricing Panel')->after('playground_hero_description');
            $table->string('playground_pricing_subtitle')->nullable()->after('playground_pricing_title');
            $table->string('playground_faq_badge')->default('Pusat Bantuan')->after('playground_pricing_subtitle');
            $table->string('playground_faq_title')->default('Pertanyaan Populer')->after('playground_faq_badge');
            $table->string('playground_faq_subtitle')->nullable()->after('playground_faq_title');
            $table->longText('playground_pricing_items')->nullable()->after('playground_faq_subtitle');
            $table->longText('playground_faq_items')->nullable()->after('playground_pricing_items');
            $table->longText('playground_visual_cards')->nullable()->after('playground_faq_items');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('elysium', function (Blueprint $table) {
            $table->dropColumn([
                'playground_badge',
                'playground_hero_title',
                'playground_hero_description',
                'playground_pricing_title',
                'playground_pricing_subtitle',
                'playground_faq_badge',
                'playground_faq_title',
                'playground_faq_subtitle',
                'playground_pricing_items',
                'playground_faq_items',
                'playground_visual_cards',
            ]);
        });
    }
};
