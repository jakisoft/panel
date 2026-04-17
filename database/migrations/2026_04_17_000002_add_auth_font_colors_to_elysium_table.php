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
            $table->string('color_auth_input_text')->default('#F8FAFC')->after('color_8');
            $table->string('color_auth_input_placeholder')->default('#94A3B8')->after('color_auth_input_text');
            $table->string('color_auth_label_text')->default('#9CA3AF')->after('color_auth_input_placeholder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('elysium', function (Blueprint $table) {
            $table->dropColumn(['color_auth_input_text', 'color_auth_input_placeholder', 'color_auth_label_text']);
        });
    }
};
