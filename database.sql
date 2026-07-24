-- ============================================================
-- SkillSync Database Schema (Team 4 - C237 CA2)
-- ============================================================
-- Unified schema (2026-07-20): the team's shared resource is
-- `portfolio` (each row = a skill, project, certification, or
-- achievement a student wants to showcase). This table was
-- originally created independently by a teammate directly on
-- the live DB; `userId` was added here to link each entry back
-- to its owner in `users` so login-based ownership/role checks
-- (regular user = own entries only, admin = any entry) work.
-- The older standalone `skills` table has been retired/dropped.
-- ============================================================

DROP TABLE IF EXISTS portfolio;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolio (
    portfolioId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    studentName VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('Skill', 'Project', 'Certification', 'Achievement') NOT NULL,
    description TEXT,
    status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ---- Demo / seed data (for local development + testing only) ----
-- Login password for ALL demo accounts below: password123
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@skillsync.com', '$2b$10$bcdnGU6wJOlRsVymmpG29uSGbArZZ1Fx/3VjvbHozHS.QzxVLqnb6', 'admin'),
('Jane Student', 'jane@skillsync.com', '$2b$10$bcdnGU6wJOlRsVymmpG29uSGbArZZ1Fx/3VjvbHozHS.QzxVLqnb6', 'user'),
('Wei Han', 'weihan@skillsync.com', '$2b$10$bcdnGU6wJOlRsVymmpG29uSGbArZZ1Fx/3VjvbHozHS.QzxVLqnb6', 'user'),
('John', 'john@skillsync.com', '$2b$10$bcdnGU6wJOlRsVymmpG29uSGbArZZ1Fx/3VjvbHozHS.QzxVLqnb6', 'user'),
('Mary', 'mary@skillsync.com', '$2b$10$bcdnGU6wJOlRsVymmpG29uSGbArZZ1Fx/3VjvbHozHS.QzxVLqnb6', 'user');

INSERT INTO portfolio (userId, studentName, title, category, description, status) VALUES
((SELECT id FROM users WHERE email = 'weihan@skillsync.com'), 'Wei Han', 'Java Programming', 'Skill', 'Completed Java Programming module', 'Verified'),
((SELECT id FROM users WHERE email = 'weihan@skillsync.com'), 'Wei Han', 'Adobe Photoshop', 'Skill', 'Poster Design', 'Pending'),
((SELECT id FROM users WHERE email = 'weihan@skillsync.com'), 'Wei Han', 'Portfolio Website', 'Project', 'Personal portfolio website', 'Verified'),
((SELECT id FROM users WHERE email = 'john@skillsync.com'), 'John', 'AWS Cloud Practitioner', 'Certification', 'AWS Certification', 'Verified'),
((SELECT id FROM users WHERE email = 'mary@skillsync.com'), 'Mary', 'RP Hackathon', 'Achievement', 'Top 10 Finalist', 'Pending');
