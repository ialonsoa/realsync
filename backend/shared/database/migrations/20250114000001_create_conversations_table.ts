import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create conversation_type enum
  await knex.raw(`
    CREATE TYPE conversation_type AS ENUM (
      'PROPERTY_CHAT',
      'DIRECT_MESSAGE',
      'CLIENT_NOTE'
    );
  `);

  return knex.schema.createTable('conversations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Conversation type
    table.specificType('type', 'conversation_type').notNullable();

    // Property chat specific (nullable for DMs and notes)
    table.uuid('property_id').nullable();
    table.uuid('transaction_id').nullable();

    // Participants (JSONB array of user IDs)
    table.jsonb('participants').notNullable().defaultTo('[]');

    // Optional conversation name (for group DMs)
    table.string('name').nullable();

    // Settings (mute, notifications, etc.)
    table.jsonb('settings').defaultTo('{}');

    // Last activity tracking
    table.uuid('last_message_id').nullable();
    table.timestamp('last_activity_at').defaultTo(knex.fn.now());

    // User preferences
    table.boolean('is_archived').defaultTo(false);
    table.jsonb('pinned_by').defaultTo('[]'); // Array of user IDs who pinned this conversation

    // Metadata
    table.jsonb('metadata').defaultTo('{}');

    // Timestamps
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('property_id').references('id').inTable('properties').onDelete('CASCADE');
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('last_message_id').references('id').inTable('messages').onDelete('SET NULL');

    // Indexes
    table.index('type');
    table.index('property_id');
    table.index('transaction_id');
    table.index('last_activity_at');
    table.index('is_archived');

    // GIN index for participants array searches
    table.index('participants', 'conversations_participants_gin_idx', 'GIN');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('conversations');
  await knex.raw('DROP TYPE conversation_type');
}
