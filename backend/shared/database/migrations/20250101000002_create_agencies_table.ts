import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('agencies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.text('description').nullable();
    table.string('logo_url').nullable();
    table.string('website').nullable();
    table.string('phone').nullable();
    table.string('email').nullable();
    table.string('address').nullable();
    table.string('city').nullable();
    table.string('country').defaultTo('Peru');

    // Billing
    table.string('billing_plan').defaultTo('starter'); // starter, growth, pro, enterprise
    table.decimal('monthly_price', 10, 2).nullable();
    table.integer('property_limit').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('trial_ends_at').nullable();
    table.timestamp('subscription_ends_at').nullable();

    table.jsonb('settings').defaultTo('{}');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();

    // Indexes
    table.index('slug');
    table.index('is_active');
  });

  // Add foreign key to users table
  return knex.schema.alterTable('users', (table) => {
    table.foreign('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropForeign('agency_id');
  });
  return knex.schema.dropTable('agencies');
}
