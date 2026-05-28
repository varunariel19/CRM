/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const POSTGRES_SCHEMA_SQL = `-- ==========================================
-- ArielCRM: PostgreSQL Database Schema Draft
-- Project Name: ArielCRM
-- Tagline: "Real Leads. Real Deals."
-- Target Engine: PostgreSQL 14+
-- ==========================================

-- Enable standard UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- JWT password storage
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Sales Executive', 'Support Agent')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. LEADS TABLE
CREATE TABLE leads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    source VARCHAR(50) NOT NULL CHECK (source IN ('Website', 'Referral', 'LinkedIn', 'Email Campaign')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
    assigned_to VARCHAR(100) NOT NULL, -- Can map to users(id) or string representation of user name
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CONTACTS TABLE
CREATE TABLE contacts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'Staff',
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. DEALS / OPPORTUNITY TABLE
CREATE TABLE deals (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    value NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('Proposal', 'Negotiation', 'Won', 'Lost')),
    close_date DATE NOT NULL,
    assigned_to VARCHAR(100) NOT NULL,
    contact_id VARCHAR(50) REFERENCES contacts(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TASKS KEY FOLLOW-UP TABLE
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Call', 'Email', 'Meeting', 'Demo')),
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Completed')),
    assigned_to VARCHAR(100) NOT NULL,
    lead_id VARCHAR(50) REFERENCES leads(id) ON DELETE SET NULL,
    deal_id VARCHAR(50) REFERENCES deals(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. SUPPORT TICKETS TABLE
CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_to VARCHAR(100) NOT NULL,
    client_id VARCHAR(50) REFERENCES contacts(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. MEETINGS & APPOINTMENT SCHEDULER
CREATE TABLE meetings (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    client VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    lead_id VARCHAR(50) REFERENCES leads(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. NOTES & INTERNAL COMMENTS
CREATE TABLE notes (
    id VARCHAR(50) PRIMARY KEY,
    content TEXT NOT NULL,
    related_to VARCHAR(55) NOT NULL CHECK (related_to IN ('lead', 'contact', 'deal', 'ticket')),
    related_id VARCHAR(50) NOT NULL,
    created_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. AUDITING ACTIVITY LOGS
CREATE TABLE activity_log (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    related_to VARCHAR(55),
    related_id VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- OPTIMIZING PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_lead ON tasks(lead_id);
CREATE INDEX idx_tasks_deal ON tasks(deal_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_notes_lookup ON notes(related_to, related_id);
CREATE INDEX idx_activity_dt ON activity_log(created_at DESC);

-- ==========================================
-- INITIAL ADMINISTRATOR INSERT
-- ==========================================
INSERT INTO users (id, name, email, password_hash, role)
VALUES ('u-1', 'Varun Ariel', 'varunariel@gmail.com', 'admin123', 'Admin');
`;

export const RELATIONSHIPS_DOCUMENTATION = [
  {
    from: 'leads',
    to: 'users',
    type: 'Many-to-One',
    description: 'Leads are assigned to a user (Sales Executive or Manager) for direct followup tracking.',
  },
  {
    from: 'deals',
    to: 'contacts',
    type: 'Many-to-One (Foreign Key)',
    description: 'Deals are associated with a single client Contact profile via contact_id (ON DELETE SET NULL).',
  },
  {
    from: 'tasks',
    to: 'leads / deals',
    type: 'Polymorphic Foreign Key Relationship',
    description: 'Tasks link directly to an active lead_id or deal_id opportunity for streamlined follow-up context.',
  },
  {
    from: 'tickets',
    to: 'contacts',
    type: 'Many-to-One (Foreign Key)',
    description: 'Support tickets are raised for and link back to a specific client Contact (client_id).',
  },
  {
    from: 'meetings',
    to: 'leads',
    type: 'Many-to-One (Foreign Key)',
    description: 'Meetings can be scheduled on behalf of a Lead for direct visibility in the pre-sales process.',
  },
  {
    from: 'notes',
    to: 'multiple entities',
    type: 'Generic Reference Key',
    description: 'Internal comments lookup linked dynamically by combining the related_to category with the target related_id.',
  }
];
