import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('messages', (table) => {
    // Add conversation_id (nullable for backward compatibility with existing transaction messages)
    table.uuid('conversation_id').nullable();

    // Pinned messages
    table.boolean('is_pinned').defaultTo(false);
    table.timestamp('pinned_at').nullable();
    table.uuid('pinned_by').nullable();

    // Voice notes
    table.string('voice_note_url').nullable();
    table.integer('voice_note_duration').nullable(); // Duration in seconds

    // Timeline event link
    table.uuid('linked_timeline_event_id').nullable();

    // Foreign keys
    table.foreign('conversation_id').references('id').inTable('conversations').onDelete('CASCADE');
    table.foreign('pinned_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('linked_timeline_event_id').references('id').inTable('timeline_events').onDelete('SET NULL');

    // Indexes
    table.index('conversation_id');
    table.index('is_pinned');
    table.index(['conversation_id', 'created_at']);
  }).then(() => {
    // Make transaction_id nullable (for DMs and client notes)
    return knex.raw('ALTER TABLE messages ALTER COLUMN transaction_id DROP NOT NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('messages', (table) => {
    table.dropForeign(['conversation_id']);
    table.dropForeign(['pinned_by']);
    table.dropForeign(['linked_timeline_event_id']);

    table.dropColumn('conversation_id');
    table.dropColumn('is_pinned');
    table.dropColumn('pinned_at');
    table.dropColumn('pinned_by');
    table.dropColumn('voice_note_url');
    table.dropColumn('voice_note_duration');
    table.dropColumn('linked_timeline_event_id');
  }).then(() => {
    // Make transaction_id not nullable again
    return knex.raw('ALTER TABLE messages ALTER COLUMN transaction_id SET NOT NULL');
  });
}
