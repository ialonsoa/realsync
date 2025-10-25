import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('properties', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('agent_id').notNullable();
    table.uuid('owner_id').nullable();

    // Property details
    table.string('address').notNullable();
    table.string('district').nullable();
    table.string('city').notNullable();
    table.string('region').nullable();
    table.string('postal_code').nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();

    // Property characteristics
    table.string('property_type').nullable(); // house, apartment, land, commercial
    table.decimal('area_sqm', 10, 2).nullable();
    table.integer('bedrooms').nullable();
    table.integer('bathrooms').nullable();
    table.integer('parking_spaces').nullable();

    // Financial
    table.decimal('asking_price', 12, 2).notNullable();
    table.string('currency').defaultTo('PEN');

    // Status
    table.string('status').defaultTo('ACTIVE'); // ACTIVE, UNDER_OFFER, SOLD, WITHDRAWN

    table.text('description').nullable();
    table.jsonb('features').defaultTo('[]');
    table.jsonb('images').defaultTo('[]');
    table.jsonb('metadata').defaultTo('{}');

    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('agent_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('owner_id').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('agent_id');
    table.index('owner_id');
    table.index('city');
    table.index('status');
    table.index(['latitude', 'longitude']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('properties');
}
