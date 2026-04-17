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
        Schema::create('elysium', function (Blueprint $table) {
            $table->id();
            $table->string('logo');
            $table->string('title');
            $table->string('description');
            $table->string('server_background');
            $table->string('color_meta');
            $table->string('copyright_by');
            $table->string('copyright_link');
            $table->string('copyright_start_year');
            $table->string('announcement_type');
            $table->string('announcement_message');
            $table->string('announcement_closable');
            $table->string('color_information');
            $table->string('color_update');
            $table->string('color_warning');
            $table->string('color_error');
            $table->string('color_console');
            $table->string('color_editor');
            $table->string('color_1');
            $table->string('color_2');
            $table->string('color_3');
            $table->string('color_4');
            $table->string('color_5');
            $table->string('color_6');
            $table->string('color_7');
            $table->string('color_8');
            $table->timestamps();
        });

        DB::table('elysium')->insert(
            array(
                'logo' => '/favicons/android-chrome-512x512.png',
                'title' => 'Pterodactyl Panel',
                'description' => 'Manage your server very easily',
                'color_meta' => '#FF8600',
                'server_background' => 'https://i.postimg.cc/fT8VTfQ1/server-background.jpg',
                'copyright_by' => 'Flydev Studio',
                'copyright_link' => 'https://discord.gg/rBuseTnRBq',
                'copyright_start_year' => '2023',
                'announcement_type' => 'information',
                'announcement_message' => 'Want to get help? Join to Discord!! https://discord.gg/rBuseTnRBq',
                'announcement_closable' => 'enable',
                'color_information' => '#589AFC',
                'color_update' => '#45AF45',
                'color_warning' => '#D53F3F',
                'color_error' => '#DF5438',
                'color_console' => '#1B1C3E',
                'color_editor' => '#1B1C3E',
                'color_1' => '#0C0C2B',
                'color_2' => '#0F1032',
                'color_3' => '#1B1C3E',
                'color_4' => '#303564',
                'color_5' => '#383E70',
                'color_6' => '#2DCE89',
                'color_7' => '#EAB208',
                'color_8' => '#F5365C',
                'created_at' => \Carbon::now(),
            )
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('elysium');
    }
};