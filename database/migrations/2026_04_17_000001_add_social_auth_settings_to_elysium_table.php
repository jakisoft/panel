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
            $table->boolean('google_auth_enabled')->default(false)->after('color_8');
            $table->string('google_client_id')->nullable()->after('google_auth_enabled');
            $table->string('google_client_secret')->nullable()->after('google_client_id');
            $table->string('google_callback_url')->nullable()->after('google_client_secret');
            $table->boolean('github_auth_enabled')->default(false)->after('google_callback_url');
            $table->string('github_client_id')->nullable()->after('github_auth_enabled');
            $table->string('github_client_secret')->nullable()->after('github_client_id');
            $table->string('github_callback_url')->nullable()->after('github_client_secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('elysium', function (Blueprint $table) {
            $table->dropColumn([
                'google_auth_enabled',
                'google_client_id',
                'google_client_secret',
                'google_callback_url',
                'github_auth_enabled',
                'github_client_id',
                'github_client_secret',
                'github_callback_url',
            ]);
        });
    }
};
