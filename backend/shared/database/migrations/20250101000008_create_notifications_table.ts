import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable();
    table.uuid('transaction_id').nullable();

    table.string('title').notNullable();
    table.text('body').notNullable();
    table.string('type').notNullable(); // TASK_REMINDER, DOCUMENT_UPLOADED, STAGE_CHANGE, etc.

    table.enum('channel', ['EMAIL', 'WHATSAPP', 'SMS', 'PUSH', 'IN_APP'], {
      useNative: true,
      enumName: 'notification_channel',
    }).notNullable();

    table.enum('status', ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ'], {
      useNative: true,
      enumName: 'notification_status',
    }).defaultTo('PENDING');

    table.timestamp('scheduled_for').nullable();
    table.timestamp('sent_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('read_at').nullable();
    table.timestamp('failed_at').nullable();

    table.text('failure_reason').nullable();
    table.integer('retry_count').defaultTo(0);
    table.timestamp('next_retry_at').nullable();

    table.string('external_id').nullable(); // Twilio/SendGrid message ID
    table.jsonb('payload').defaultTo('{}');
    table.jsonb('metadata').defaultTo('{}');

    table.timestamps(true, true);

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('transaction_id');
    table.index('status');
    table.index('channel');
    table.index('scheduled_for');
    table.index(['user_id', 'status', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notifications');
}
