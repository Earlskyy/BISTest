-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Households table
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    head_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20),
    civil_status VARCHAR(50),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    relationship VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resident tags table
CREATE TABLE IF NOT EXISTS resident_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resident tag assignments table
CREATE TABLE IF NOT EXISTS resident_tag_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES resident_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(family_member_id, tag_id)
);

-- Certificate requests table
CREATE TABLE IF NOT EXISTS certificate_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    birth_date DATE,
    age INTEGER,
    civil_status VARCHAR(50),
    purpose TEXT,
    contact_number VARCHAR(20),
    photo_url TEXT,
    profile_photo_url TEXT,
    template_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'released')),
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate templates table (staff-managed)
CREATE TABLE IF NOT EXISTS certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    html_template TEXT NOT NULL,
    logo_url TEXT,
    include_profile_photo BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE certificate_requests
  ADD CONSTRAINT IF NOT EXISTS fk_certificate_requests_template
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE SET NULL;

-- Blotter records table
CREATE TABLE IF NOT EXISTS blotter_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complainant_name VARCHAR(255) NOT NULL,
    respondent_name VARCHAR(255),
    incident_details TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_name VARCHAR(255) NOT NULL,
    reporter_photo_url TEXT,
    incident_photo_url TEXT,
    reported_person VARCHAR(255),
    complaint_details TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'resolved', 'archived')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_households_created_by ON households(created_by);
CREATE INDEX IF NOT EXISTS idx_family_members_household_id ON family_members(household_id);
CREATE INDEX IF NOT EXISTS idx_certificate_requests_status ON certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_certificate_requests_reference_number ON certificate_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_type ON certificate_templates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_blotter_records_created_by ON blotter_records(created_by);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_announcements_posted_by ON announcements(posted_by);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
-- Password hash for 'admin123' using bcrypt (rounds: 10)
-- To generate a new hash, use: bcrypt.hashSync('admin123', 10)
INSERT INTO users (full_name, email, password_hash, role, status)
VALUES (
    'System Administrator',
    'admin@barangaycatarman.gov.ph',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin',
    'active'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default tags
INSERT INTO resident_tags (name, description) VALUES
    ('Senior Citizen', 'Residents aged 60 and above'),
    ('PWD', 'Person with Disability'),
    ('Solo Parent', 'Single parent'),
    ('Indigent', 'Low-income residents'),
    ('OFW', 'Overseas Filipino Worker')
ON CONFLICT (name) DO NOTHING;
