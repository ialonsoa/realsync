import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add new document types for chat
  await knex.raw(`
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'CHAT_ATTACHMENT';
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'VOICE_NOTE';
    ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'CHAT_IMAGE';
  `);

  return knex.schema.alterTable('documents', (table) => {
    // Add message_id for chat attachments (nullable)
    table.uuid('message_id').nullable();

    // Foreign key
    table.foreign('message_id').references('id').inTable('messages').onDelete('CASCADE');

    // Index
    table.index('message_id');
  }).then(() => {
    // Make transaction_id nullable (for chat attachments not tied to transactions)
    return knex.raw('ALTER TABLE documents ALTER COLUMN transaction_id DROP NOT NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('documents', (table) => {
    table.dropForeign(['message_id']);
    table.dropColumn('message_id');
  }).then(() => {
    // Make transaction_id not nullable again
    return knex.raw('ALTER TABLE documents ALTER COLUMN transaction_id SET NOT NULL');
  }).then(() => {
    // Note: Cannot remove enum values in PostgreSQL, would need to recreate the enum
    // This is generally acceptable as the new values won't be used after downgrade
  });
}
