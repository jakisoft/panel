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
        if (!Schema::hasTable('domain_pools')) {
            Schema::create('domain_pools', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('domain')->unique();
                $table->string('zone_id');
                $table->string('api_token')->nullable();
                $table->string('record_type')->default('CNAME');
                $table->string('protocol')->default('tcp');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('server_domains')) {
            Schema::create('server_domains', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedInteger('server_id')->unique();
                $table->string('mode')->default('none'); // 'none', 'subdomain', 'custom'
                $table->unsignedBigInteger('domain_pool_id')->nullable();
                $table->string('subdomain')->nullable();
                $table->string('full_subdomain')->nullable();
                $table->string('dns_record_id')->nullable();
                $table->string('srv_record_id')->nullable();
                $table->string('custom_domain')->nullable();
                $table->text('tunnel_token')->nullable();
                $table->string('tunnel_id')->nullable();
                $table->string('tunnel_account_id')->nullable();
                $table->boolean('is_active')->default(false);
                $table->text('last_log')->nullable();
                $table->timestamps();

                $table->foreign('server_id')->references('id')->on('servers')->onDelete('cascade');
                $table->foreign('domain_pool_id')->references('id')->on('domain_pools')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('server_domains');
        Schema::dropIfExists('domain_pools');
    }
};
