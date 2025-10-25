-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create enum types
CREATE TYPE user_role AS ENUM ('OWNER', 'BUYER', 'AGENT', 'CO_AGENT', 'ADMIN_AGENCY');
CREATE TYPE transaction_status AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
CREATE TYPE document_type AS ENUM ('DNI', 'CONTRACT', 'DEED', 'TAX_FORM', 'BANK_STATEMENT', 'SUNARP_DOCUMENT', 'OTHER');
CREATE TYPE visibility_scope AS ENUM ('ALL', 'AGENTS_ONLY', 'OWNER_ONLY', 'BUYER_ONLY');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'PUSH', 'IN_APP');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- Set default timezone
SET timezone = 'America/Lima';
