import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').notNullable().unique();
    table.string('password_hash').nullable(); // Nullable for OAuth users
    table.string('phone').nullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('role', ['OWNER', 'BUYER', 'AGENT', 'CO_AGENT', 'ADMIN_AGENCY'], {
      useNative: true,
      enumName: 'user_role',
    }).notNullable();
    table.uuid('agency_id').nullable();
    table.string('avatar_url').nullable();
    table.boolean('email_verified').defaultTo(false);
    table.boolean('phone_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at').nullable();
    table.jsonb('preferences').defaultTo('{}');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Indexes
    table.index('email');
    table.index('role');
    table.index('agency_id');
    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
