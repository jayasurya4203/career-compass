-- Career Compass MySQL Schema

CREATE DATABASE IF NOT EXISTS career_compass;
USE career_compass;

-- User Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile Table
CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(100),
    skills TEXT, -- Comma-separated or JSON
    marks_10th FLOAT,
    marks_12th FLOAT,
    marks_degree FLOAT,
    interests TEXT,
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Aptitude Test Scores
CREATE TABLE IF NOT EXISTS aptitude_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    logical FLOAT DEFAULT 0,
    verbal FLOAT DEFAULT 0,
    quantitative FLOAT DEFAULT 0,
    technical FLOAT DEFAULT 0,
    overall_score FLOAT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Career Predictions
CREATE TABLE IF NOT EXISTS career_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    predicted_role VARCHAR(100),
    match_percentage FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resume Uploads & ATS Results
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    file_path VARCHAR(255),
    extracted_text LONGTEXT,
    ats_score FLOAT,
    parsed_skills TEXT,
    job_role_match VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recommendations (Courses, Projects, Roadmaps)
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('course', 'project', 'roadmap') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
