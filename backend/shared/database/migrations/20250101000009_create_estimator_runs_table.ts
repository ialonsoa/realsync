import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('estimator_runs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('property_id').nullable();
    table.uuid('transaction_id').nullable();
    table.uuid('user_id').notNullable(); // Who ran the estimation

    // Inputs
    table.jsonb('inputs').notNullable(); // All input parameters

    // Outputs
    table.decimal('alcabala', 12, 2).nullable();
    table.decimal('impuesto_renta', 12, 2).nullable();
    table.decimal('commission', 12, 2).nullable();
    table.decimal('notary_fees', 12, 2).nullable();
    table.decimal('registry_fees', 12, 2).nullable();
    table.decimal('other_fees', 12, 2).nullable();
    table.decimal('total_deductions', 12, 2).nullable();
    table.decimal('net_profit', 12, 2).nullable();

    table.jsonb('outputs').notNullable(); // Complete output object
    table.jsonb('assumptions').defaultTo('[]'); // Assumptions made
    table.string('version').defaultTo('1.0'); // Calculation version

    table.timestamps(true, true);

    // Foreign keys
    table.foreign('property_id').references('id').inTable('properties').onDelete('CASCADE');
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Indexes
    table.index('property_id');
    table.index('transaction_id');
    table.index('user_id');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('estimator_runs');
}
