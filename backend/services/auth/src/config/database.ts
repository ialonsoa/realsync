import knex from 'knex';
import knexConfig from '../../../shared/database/knexfile';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

export default knex(config);
