import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Get all distinct transactions that have messages
  const transactions = await knex('messages')
    .distinct('transaction_id')
    .whereNotNull('transaction_id')
    .orderBy('transaction_id');

  console.log(`Found ${transactions.length} transactions with messages to migrate`);

  for (const { transaction_id } of transactions) {
    try {
      // Get transaction details
      const transaction = await knex('transactions')
        .where('id', transaction_id)
        .first();

      if (!transaction) {
        console.warn(`Transaction ${transaction_id} not found, skipping`);
        continue;
      }

      // Get property details to find owner
      const property = await knex('properties')
        .where('id', transaction.property_id)
        .first();

      if (!property) {
        console.warn(`Property ${transaction.property_id} not found for transaction ${transaction_id}, skipping`);
        continue;
      }

      // Build participants list (agent, buyer, owner)
      const participants = [
        transaction.agent_id,
        transaction.buyer_id,
        property.owner_id,
      ].filter(Boolean); // Remove nulls

      // Create conversation for this transaction
      const [conversation] = await knex('conversations')
        .insert({
          type: 'PROPERTY_CHAT',
          property_id: transaction.property_id,
          transaction_id: transaction_id,
          participants: JSON.stringify(participants),
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning('id');

      // Update all messages for this transaction with the conversation_id
      const messageCount = await knex('messages')
        .where('transaction_id', transaction_id)
        .update({ conversation_id: conversation.id });

      // Update conversation's last_message_id and last_activity_at
      const lastMessage = await knex('messages')
        .where('conversation_id', conversation.id)
        .orderBy('created_at', 'desc')
        .first();

      if (lastMessage) {
        await knex('conversations')
          .where('id', conversation.id)
          .update({
            last_message_id: lastMessage.id,
            last_activity_at: lastMessage.created_at,
          });
      }

      console.log(`Migrated ${messageCount} messages for transaction ${transaction_id} to conversation ${conversation.id}`);
    } catch (error) {
      console.error(`Error migrating transaction ${transaction_id}:`, error);
      // Continue with next transaction
    }
  }

  console.log('Message migration completed');
}

export async function down(knex: Knex): Promise<void> {
  // Remove all conversation_id references from messages
  await knex('messages').update({ conversation_id: null });

  // Delete all PROPERTY_CHAT conversations (created by this migration)
  await knex('conversations')
    .where('type', 'PROPERTY_CHAT')
    .del();

  console.log('Message migration rolled back');
}
