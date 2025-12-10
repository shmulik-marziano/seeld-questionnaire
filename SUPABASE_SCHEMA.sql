-- SEELD NOA Database Schema
-- Complete setup for New client Onboarding Assistant
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: agencies
-- ============================================
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1a365d',
  secondary_color VARCHAR(7) DEFAULT '#38a169',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: users (agents)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'agent', -- 'admin', 'agent'
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: clients
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Personal Info (Questions 1-10)
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  id_number VARCHAR(9) UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(10), -- 'male', 'female', 'other'
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address_street VARCHAR(100),
  address_city VARCHAR(50),
  address_zip VARCHAR(10),
  marital_status VARCHAR(20), -- 'single', 'married', 'divorced', 'widowed'
  children_count INTEGER DEFAULT 0,
  
  -- Employment (Questions 11-18)
  employment_status VARCHAR(20), -- 'employed', 'self_employed', 'both', 'unemployed'
  employer_name VARCHAR(100),
  job_title VARCHAR(100),
  salary_gross INTEGER,
  self_employed_income INTEGER,
  years_at_job NUMERIC(4,1),
  business_id VARCHAR(20), -- ח.פ. / עוסק מורשה
  has_additional_income BOOLEAN DEFAULT false,
  
  -- Family (Questions 19-24)
  spouse_name VARCHAR(100),
  spouse_id_number VARCHAR(9),
  spouse_employed BOOLEAN,
  has_other_dependents BOOLEAN DEFAULT false,
  beneficiaries TEXT, -- JSON or comma-separated
  
  -- Financial (Questions 25-31)
  household_income_range VARCHAR(20), -- '5000-10000', '10000-20000', etc.
  monthly_expenses_range VARCHAR(20),
  has_mortgage BOOLEAN DEFAULT false,
  mortgage_payment INTEGER,
  has_other_loans BOOLEAN DEFAULT false,
  total_loan_payments INTEGER,
  has_savings BOOLEAN DEFAULT false,
  
  -- Existing Insurance (Questions 32-39)
  has_pension BOOLEAN DEFAULT false,
  pension_company VARCHAR(50),
  has_managers_insurance BOOLEAN DEFAULT false,
  has_study_fund BOOLEAN DEFAULT false,
  has_life_insurance BOOLEAN DEFAULT false,
  has_health_insurance BOOLEAN DEFAULT false,
  has_disability_insurance BOOLEAN DEFAULT false,
  has_nursing_insurance BOOLEAN DEFAULT false,
  
  -- Health (Questions 40-49)
  height_cm INTEGER,
  weight_kg INTEGER,
  smoking_status VARCHAR(20), -- 'yes', 'no', 'quit'
  has_medical_conditions BOOLEAN DEFAULT false,
  medical_conditions TEXT,
  takes_medications BOOLEAN DEFAULT false,
  medications TEXT,
  recent_hospitalizations BOOLEAN DEFAULT false,
  has_limitations BOOLEAN DEFAULT false,
  family_medical_history BOOLEAN DEFAULT false,
  
  -- Preferences (Questions 50-54)
  risk_level INTEGER, -- 1-5 scale
  preference_return_vs_safety VARCHAR(20), -- 'return', 'balanced', 'safety'
  wants_children_coverage BOOLEAN DEFAULT false,
  wants_tax_exempt BOOLEAN DEFAULT false,
  monthly_budget_range VARCHAR(20),
  
  -- Consents (Questions 55-58)
  consent_marketing BOOLEAN DEFAULT false,
  consent_terms BOOLEAN DEFAULT false,
  consent_privacy BOOLEAN DEFAULT false,
  consent_poa BOOLEAN DEFAULT false,
  
  -- System fields
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'archived'
  questionnaire_progress INTEGER DEFAULT 0, -- 0-100
  unique_link VARCHAR(100) UNIQUE,
  link_expires_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: questionnaire_sessions
-- ============================================
CREATE TABLE questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  answers JSONB, -- Full questionnaire answers as JSON
  current_question INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  ip_address VARCHAR(45),
  user_agent TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Table: documents
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'id_front', 'id_back', 'poa_signed', 'other'
  file_name VARCHAR(255),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(50),
  ocr_data JSONB, -- Extracted data from OCR
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Table: activities
-- ============================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'document_uploaded', 'link_sent', etc.
  description TEXT,
  metadata JSONB, -- Additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: whatsapp_messages
-- ============================================
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  message_type VARCHAR(20), -- 'template', 'text', 'image', etc.
  content TEXT NOT NULL,
  status VARCHAR(20), -- 'sent', 'delivered', 'read', 'failed'
  external_id VARCHAR(100), -- WhatsApp message ID
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_agent ON clients(agent_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_id_number ON clients(id_number);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_questionnaire_sessions_client ON questionnaire_sessions(client_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_activities_client ON activities(client_id);
CREATE INDEX idx_whatsapp_messages_client ON whatsapp_messages(client_id);

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers: Auto-update updated_at
-- ============================================
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) - Basic setup
-- ============================================
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Agencies can see only their own data
CREATE POLICY agencies_isolation ON agencies
  USING (id = (SELECT agency_id FROM users WHERE users.id = auth.uid()));

-- Policy: Users can see only their agency's data
CREATE POLICY users_isolation ON users
  USING (agency_id = (SELECT agency_id FROM users WHERE users.id = auth.uid()));

-- Policy: Clients - agents can see their agency's clients
CREATE POLICY clients_isolation ON clients
  USING (agency_id = (SELECT agency_id FROM users WHERE users.id = auth.uid()));

-- ============================================
-- Sample Data (for testing)
-- ============================================
-- Insert a demo agency
INSERT INTO agencies (name, email, phone) VALUES
  ('Demo Insurance Agency', 'demo@seeld.ai', '050-1234567');

-- Get the agency ID
DO $$
DECLARE
  demo_agency_id UUID;
BEGIN
  SELECT id INTO demo_agency_id FROM agencies WHERE email = 'demo@seeld.ai';
  
  -- Insert a demo user
  INSERT INTO users (agency_id, email, full_name, role, phone) VALUES
    (demo_agency_id, 'agent@seeld.ai', 'Demo Agent', 'agent', '050-9876543');
END $$;

-- ============================================
-- Views for easy querying
-- ============================================

-- View: Complete client overview
CREATE VIEW v_clients_overview AS
SELECT 
  c.id,
  c.first_name || ' ' || c.last_name AS full_name,
  c.id_number,
  c.phone,
  c.email,
  c.status,
  c.questionnaire_progress,
  c.created_at,
  c.completed_at,
  u.full_name AS agent_name,
  a.name AS agency_name,
  (SELECT COUNT(*) FROM documents WHERE client_id = c.id) AS documents_count
FROM clients c
LEFT JOIN users u ON c.agent_id = u.id
LEFT JOIN agencies a ON c.agency_id = a.id;

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ SEELD NOA Database Schema created successfully!';
  RAISE NOTICE '🎯 Tables: agencies, users, clients, questionnaire_sessions, documents, activities, whatsapp_messages';
  RAISE NOTICE '📊 Demo agency created: demo@seeld.ai';
  RAISE NOTICE '👤 Demo agent created: agent@seeld.ai';
  RAISE NOTICE '🚀 Ready to start building!';
END $$;
