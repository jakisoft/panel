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
        if (Schema::hasTable('servers') && !Schema::hasColumn('servers', 'domain_feature_enabled')) {
            Schema::table('servers', function (Blueprint $table) {
                $table->boolean('domain_feature_enabled')->default(true)->after('backup_limit');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('servers') && Schema::hasColumn('servers', 'domain_feature_enabled')) {
            Schema::table('servers', function (Blueprint $table) {
                $table->dropColumn('domain_feature_enabled');
            });
        }
    }
};
