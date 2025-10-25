import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('transaction_id').notNullable();
    table.uuid('uploader_id').notNullable();

    table.string('name').notNullable();
    table.enum('type', ['DNI', 'CONTRACT', 'DEED', 'TAX_FORM', 'BANK_STATEMENT', 'SUNARP_DOCUMENT', 'OTHER'], {
      useNative: true,
      enumName: 'document_type',
    }).notNullable();

    table.string('file_url').notNullable();
    table.string('file_key').notNullable(); // S3 key
    table.string('file_name').notNullable();
    table.string('mime_type').notNullable();
    table.bigInteger('file_size').notNullable(); // in bytes

    table.integer('version').defaultTo(1);
    table.uuid('parent_document_id').nullable(); // For versioning

    table.enum('visibility_scope', ['ALL', 'AGENTS_ONLY', 'OWNER_ONLY', 'BUYER_ONLY'], {
      useNative: true,
      enumName: 'visibility_scope',
    }).defaultTo('ALL');

    table.string('virus_scan_status').defaultTo('PENDING'); // PENDING, CLEAN, INFECTED
    table.timestamp('virus_scanned_at').nullable();

    table.string('approval_status').defaultTo('PENDING'); // PENDING, APPROVED, CHANGES_REQUESTED
    table.uuid('approved_by_id').nullable();
    table.timestamp('approved_at').nullable();
    table.text('approval_notes').nullable();

    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('uploader_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('parent_document_id').references('id').inTable('documents').onDelete('SET NULL');
    table.foreign('approved_by_id').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('transaction_id');
    table.index('uploader_id');
    table.index('type');
    table.index('visibility_scope');
    table.index('approval_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('documents');
}
