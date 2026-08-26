CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin account
-- Password is 'admin123' hashed with BCrypt
INSERT INTO users (id, email, password, role)
VALUES (
    gen_random_uuid(),
    'admin@flashgear.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGKKPTBaVR1lsL.aVb.2',
    'ADMIN'
);
