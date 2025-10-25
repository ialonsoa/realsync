import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('transaction_id').notNullable();
    table.uuid('author_id').notNullable();
    table.uuid('parent_message_id').nullable(); // For threading

    table.text('body').notNullable();
    table.jsonb('attachments').defaultTo('[]'); // Array of document IDs
    table.jsonb('mentions').defaultTo('[]'); // Array of user IDs
    table.jsonb('reactions').defaultTo('{}'); // {emoji: [user_ids]}

    table.boolean('is_system_message').defaultTo(false);
    table.boolean('is_edited').defaultTo(false);
    table.timestamp('edited_at').nullable();

    table.jsonb('read_by').defaultTo('[]'); // Array of {user_id, read_at}
    table.jsonb('metadata').defaultTo('{}');

    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('author_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('parent_message_id').references('id').inTable('messages').onDelete('CASCADE');

    // Indexes
    table.index('transaction_id');
    table.index('author_id');
    table.index(['transaction_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('messages');
}
