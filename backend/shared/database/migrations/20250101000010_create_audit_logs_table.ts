import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').nullable();
    table.uuid('transaction_id').nullable();

    table.string('action').notNullable(); // CREATE, UPDATE, DELETE, VIEW, DOWNLOAD, etc.
    table.string('entity_type').notNullable(); // Property, Task, Document, etc.
    table.uuid('entity_id').nullable();

    table.jsonb('changes').nullable(); // Before/after for updates
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();
    table.jsonb('metadata').defaultTo('{}');

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('transaction_id');
    table.index('entity_type');
    table.index('entity_id');
    table.index('created_at');
    table.index(['user_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('audit_logs');
}
