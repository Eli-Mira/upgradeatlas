<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 128)->unique();
            $table->string('slug', 128)->unique();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('component_classes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('component_type', 16);
            $table->string('standard', 64);
            $table->string('form_factor', 64);
            $table->string('protocol', 32)->nullable();
            $table->integer('capacity_gb')->nullable();
            $table->json('attributes')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('cpus', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('maker', 64);
            $table->string('model', 128);
            $table->string('architecture', 64)->nullable();
            $table->integer('cores')->nullable();
            $table->integer('threads')->nullable();
            $table->integer('tdp_w')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->unique(['maker', 'model'], 'uq_cpus_identity');
        });

        Schema::create('displays', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->decimal('diagonal_inches', 4, 2);
            $table->integer('resolution_width');
            $table->integer('resolution_height');
            $table->decimal('refresh_hz', 6, 2)->nullable();
            $table->string('panel_type', 64)->nullable();
            $table->string('color_gamut', 64)->nullable();
            $table->integer('brightness_nits')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('gpus', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('maker', 64);
            $table->string('model', 128);
            $table->integer('vram_gb')->nullable();
            $table->integer('tgp_w')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->unique(['maker', 'model'], 'uq_gpus_identity');
        });

        Schema::create('retailers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 128)->unique();
            $table->text('website_url');
            $table->string('country', 8);
            $table->string('status', 16);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('sources', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('url')->unique();
            $table->string('source_type', 64);
            $table->string('publisher', 256)->nullable();
            $table->string('usage_permission_status', 24);
            $table->timestampTz('last_accessed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();

        });

        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('email', 320)->unique();
            $table->string('hashed_password', 512)->nullable();
            $table->string('external_auth_id', 256)->nullable();
            $table->string('display_name', 128)->nullable();
            $table->string('locale', 8);
            $table->string('role', 16);
            $table->timestamp('deleted_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();

        });

        Schema::create('audit_events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('entity_name', 128);
            $table->string('entity_pk', 128);
            $table->string('operation', 32);
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->timestampTz('occurred_at');
            $table->foreign(['actor_id'])->references(['id'])->on('users')->nullOnDelete();
        });

        Schema::create('conflict_flags', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('entity_type', 64);
            $table->unsignedBigInteger('entity_id');
            $table->string('field_name', 128);
            $table->text('evidence_ids');
            $table->string('status', 16);
            $table->text('resolution_notes')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign(['resolved_by'])->references(['id'])->on('users')->nullOnDelete();
        });

        Schema::create('evidence', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('source_id');
            $table->text('locator')->nullable();
            $table->text('concise_paraphrase');
            $table->text('fact_scope');
            $table->timestampTz('observed_at');
            $table->string('verification_status', 40);
            $table->unsignedBigInteger('reviewer_id')->nullable();
            $table->unsignedBigInteger('superseded_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign(['reviewer_id'])->references(['id'])->on('users')->nullOnDelete();
            $table->foreign(['source_id'])->references(['id'])->on('sources')->restrictOnDelete();
            $table->foreign(['superseded_by'])->references(['id'])->on('evidence')->nullOnDelete();
        });

        Schema::create('laptop_families', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('brand_id');
            $table->string('family_name', 256);
            $table->string('slug', 256);
            $table->integer('launch_year')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->foreign(['brand_id'])->references(['id'])->on('brands')->restrictOnDelete();
            $table->unique(['brand_id', 'slug'], 'uq_laptop_families_brand_slug');
        });

        Schema::create('recommendation_sessions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('preferences')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->foreign(['user_id'])->references(['id'])->on('users')->nullOnDelete();
        });

        Schema::create('saved_comparisons', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('title', 256)->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->foreign(['user_id'])->references(['id'])->on('users')->cascadeOnDelete();
        });

        Schema::create('laptop_variants', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('family_id');
            $table->string('manufacturer_model_code', 128);
            $table->string('region_code', 32)->nullable();
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->foreign(['family_id'])->references(['id'])->on('laptop_families')->restrictOnDelete();
            $table->unique(['family_id', 'manufacturer_model_code', 'region_code'], 'uq_laptop_variants_identity');
        });

        Schema::create('laptop_skus', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('variant_id');
            $table->string('manufacturer_part_number', 128)->unique();
            $table->string('display_name', 256);
            $table->unsignedBigInteger('cpu_id')->nullable();
            $table->unsignedBigInteger('gpu_id')->nullable();
            $table->unsignedBigInteger('display_id')->nullable();
            $table->integer('base_ram_gb')->nullable();
            $table->integer('base_storage_gb')->nullable();
            $table->integer('mass_g')->nullable();
            $table->string('status', 16);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();




            $table->foreign(['cpu_id'])->references(['id'])->on('cpus')->nullOnDelete();
            $table->foreign(['display_id'])->references(['id'])->on('displays')->nullOnDelete();
            $table->foreign(['gpu_id'])->references(['id'])->on('gpus')->nullOnDelete();
            $table->foreign(['variant_id'])->references(['id'])->on('laptop_variants')->restrictOnDelete();
        });

        Schema::create('compatibility_assertions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('sku_id');
            $table->unsignedBigInteger('component_class_id');
            $table->string('outcome', 16);
            $table->text('reason');
            $table->text('scope_notes')->nullable();
            $table->string('confidence_level', 32);
            $table->unsignedBigInteger('evidence_id');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();


            $table->foreign(['component_class_id'])->references(['id'])->on('component_classes')->restrictOnDelete();
            $table->foreign(['evidence_id'])->references(['id'])->on('evidence')->restrictOnDelete();
            $table->foreign(['reviewed_by'])->references(['id'])->on('users')->nullOnDelete();
            $table->foreign(['sku_id'])->references(['id'])->on('laptop_skus')->restrictOnDelete();
            $table->unique(['sku_id', 'component_class_id', 'evidence_id'], 'uq_compat_sku_component_evidence');
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('sku_id');
            $table->timestampTz('created_at')->useCurrent();
            $table->primary(['user_id', 'sku_id']);
            $table->foreign(['sku_id'])->references(['id'])->on('laptop_skus')->cascadeOnDelete();
            $table->foreign(['user_id'])->references(['id'])->on('users')->cascadeOnDelete();
        });

        Schema::create('ram_configurations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('sku_id');
            $table->integer('soldered_gb')->nullable();
            $table->integer('slot_count')->nullable();
            $table->integer('occupied_slot_count')->nullable();
            $table->string('standard', 64)->nullable();
            $table->integer('documented_max_gb')->nullable();
            $table->string('max_meaning', 32);
            $table->text('disassembly_risk_notes')->nullable();
            $table->text('warranty_notes')->nullable();
            $table->unsignedBigInteger('evidence_id')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();





            $table->foreign(['evidence_id'])->references(['id'])->on('evidence')->nullOnDelete();
            $table->foreign(['sku_id'])->references(['id'])->on('laptop_skus')->restrictOnDelete();
            $table->unique('sku_id');
        });

        Schema::create('retailer_offers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('sku_id');
            $table->unsignedBigInteger('retailer_id');
            $table->string('retailer_sku', 128)->nullable();
            $table->text('product_url');
            $table->string('currency', 8);
            $table->decimal('displayed_price_egp', 12, 2)->nullable();
            $table->string('available_status', 16);
            $table->timestamp('observed_at')->nullable();
            $table->timestampTz('recorded_at');
            $table->unsignedBigInteger('source_id');
            $table->boolean('active');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();


            $table->foreign(['retailer_id'])->references(['id'])->on('retailers')->restrictOnDelete();
            $table->foreign(['sku_id'])->references(['id'])->on('laptop_skus')->restrictOnDelete();
            $table->foreign(['source_id'])->references(['id'])->on('sources')->restrictOnDelete();
        });

        Schema::create('saved_comparison_items', function (Blueprint $table) {
            $table->unsignedBigInteger('comparison_id');
            $table->unsignedBigInteger('sku_id');
            $table->primary(['comparison_id', 'sku_id']);
            $table->foreign(['comparison_id'])->references(['id'])->on('saved_comparisons')->cascadeOnDelete();
            $table->foreign(['sku_id'])->references(['id'])->on('laptop_skus')->cascadeOnDelete();
        });

        Schema::create('storage_slots', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('sku_id');
            $table->integer('slot_index');
            $table->string('form_factor', 32)->nullable();
            $table->string('protocol', 16);
            $table->string('pcie_generation', 16)->nullable();
            $table->string('occupied_status', 16);
            $table->text('constraints_text')->nullable();
            $table->unsignedBigInteger('evidence_id')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();


            $table->foreign(['evidence_id'])->references(['id'])->on('evidence')->nullOnDelete();
            $table->foreign(['sku_id'])->references(['id'])->on('laptop_skus')->restrictOnDelete();
            $table->unique(['sku_id', 'slot_index'], 'uq_storage_slots_sku_index');
        });

        Schema::create('offer_price_observations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('offer_id');
            $table->decimal('price_egp', 12, 2)->nullable();
            $table->string('stock_status', 16);
            $table->timestampTz('observed_at');
            $table->unsignedBigInteger('source_id');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();


            $table->foreign(['offer_id'])->references(['id'])->on('retailer_offers')->cascadeOnDelete();
            $table->foreign(['source_id'])->references(['id'])->on('sources')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offer_price_observations');
        Schema::dropIfExists('storage_slots');
        Schema::dropIfExists('saved_comparison_items');
        Schema::dropIfExists('retailer_offers');
        Schema::dropIfExists('ram_configurations');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('compatibility_assertions');
        Schema::dropIfExists('laptop_skus');
        Schema::dropIfExists('laptop_variants');
        Schema::dropIfExists('saved_comparisons');
        Schema::dropIfExists('recommendation_sessions');
        Schema::dropIfExists('laptop_families');
        Schema::dropIfExists('evidence');
        Schema::dropIfExists('conflict_flags');
        Schema::dropIfExists('audit_events');
        Schema::dropIfExists('users');
        Schema::dropIfExists('sources');
        Schema::dropIfExists('retailers');
        Schema::dropIfExists('gpus');
        Schema::dropIfExists('displays');
        Schema::dropIfExists('cpus');
        Schema::dropIfExists('component_classes');
        Schema::dropIfExists('brands');
    }
};