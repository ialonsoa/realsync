import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('typing_indicators', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Conversation and user
    table.uuid('conversation_id').notNullable();
    table.uuid('user_id').notNullable();

    // Timing
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable(); // Auto-expire after 5 seconds

    // Foreign keys
    table.foreign('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Indexes
    table.index(['conversation_id', 'expires_at']);

    // Unique constraint: One typing indicator per user per conversation
    table.unique(['conversation_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('typing_indicators');
}
