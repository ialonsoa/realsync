import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('transaction_id').notNullable();
    table.uuid('assignee_id').nullable();
    table.uuid('created_by_id').notNullable();

    table.string('title').notNullable();
    table.text('description').nullable();
    table.string('stage').notNullable(); // preliminary_contracts, sunarp_verification, etc.

    table.enum('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'], {
      useNative: true,
      enumName: 'task_status',
    }).defaultTo('PENDING');

    table.timestamp('due_at').nullable();
    table.timestamp('completed_at').nullable();
    table.uuid('completed_by_id').nullable();

    table.integer('order_index').defaultTo(0);
    table.jsonb('dependencies').defaultTo('[]'); // Array of task IDs
    table.jsonb('metadata').defaultTo('{}');

    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('assignee_id').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('created_by_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('completed_by_id').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('transaction_id');
    table.index('assignee_id');
    table.index('status');
    table.index('due_at');
    table.index(['transaction_id', 'stage']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tasks');
}
