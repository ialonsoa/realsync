import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('property_id').notNullable().unique(); // One transaction per property
    table.uuid('buyer_id').nullable();
    table.uuid('agent_id').notNullable();

    // Transaction details
    table.enum('status', ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'], {
      useNative: true,
      enumName: 'transaction_status',
    }).defaultTo('DRAFT');

    table.string('current_stage').defaultTo('preliminary_contracts');
    table.decimal('progress_percent', 5, 2).defaultTo(0);
    table.decimal('final_price', 12, 2).nullable();

    // Important dates
    table.timestamp('started_at').nullable();
    table.timestamp('expected_close_date').nullable();
    table.timestamp('actual_close_date').nullable();

    // Tax estimations (cached)
    table.jsonb('tax_estimates').nullable();

    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('property_id').references('id').inTable('properties').onDelete('CASCADE');
    table.foreign('buyer_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('agent_id').references('id').inTable('users').onDelete('CASCADE');

    // Indexes
    table.index('property_id');
    table.index('buyer_id');
    table.index('agent_id');
    table.index('status');
    table.index('current_stage');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
