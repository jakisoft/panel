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
            $table->string('playground_brand_name')->default('Elysium Panel')->after('playground_badge');
            $table->string('playground_brand_icon')->default('Server')->after('playground_brand_name');
            $table->longText('playground_footer_links')->nullable()->after('playground_visual_cards');
            $table->longText('playground_social_links')->nullable()->after('playground_footer_links');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('elysium', function (Blueprint $table) {
            $table->dropColumn([
                'playground_brand_name',
                'playground_brand_icon',
                'playground_footer_links',
                'playground_social_links',
            ]);
        });
    }
};
