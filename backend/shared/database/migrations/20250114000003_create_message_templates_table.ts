import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('message_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    // Owner
    table.uuid('user_id').notNullable();
    table.uuid('agency_id').nullable(); // For shared agency templates

    // Template content
    table.string('name').notNullable();
    table.text('content').notNullable();
    table.string('category').nullable(); // greeting, follow_up, negotiation, closing, etc.

    // Variable substitution support (e.g., {{client_name}}, {{property_address}})
    table.jsonb('variables').defaultTo('[]'); // [{name: 'client_name', default: ''}]

    // Sharing and usage
    table.boolean('is_shared').defaultTo(false); // Shared with agency
    table.integer('use_count').defaultTo(0);

    // Timestamps
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('agency_id').references('id').inTable('agencies').onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('agency_id');
    table.index('category');
    table.index('is_shared');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('message_templates');
}
