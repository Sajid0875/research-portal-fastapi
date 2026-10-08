-- ============================================================
-- Database Schema for Research Opportunity Portal
-- ============================================================

CREATE DATABASE IF NOT EXISTS research_portal;
USE research_portal;

DROP TABLE IF EXISTS opportunities;

CREATE TABLE opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    research_area VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    required_skills TEXT NOT NULL,
    available_positions INT NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Seed Sample Data
-- ============================================================

INSERT INTO opportunities (
    title,
    description,
    research_area,
    faculty_name,
    department,
    required_skills,
    available_positions,
    application_deadline,
    status
) VALUES
(
    'Distributed Consensus in Edge Computing',
    'Investigating lightweight consensus protocols for resource-constrained edge computing environments with intermittent network connectivity.',
    'Distributed Systems',
    'Dr. Aris Thorne',
    'Computer Science',
    'Python, Go, Docker, Network Sockets, Linux',
    3,
    '2026-11-30',
    'Open'
),
(
    'Deep Learning for Medical Image Segmentation',
    'Developing 3D convolutional and transformer-based architectures for rapid MRI scan anomaly detection and semantic segmentation.',
    'Artificial Intelligence',
    'Prof. Elena Rostova',
    'Biomedical Engineering',
    'PyTorch, OpenCV, Python, NumPy, CUDA basics',
    2,
    '2026-12-15',
    'Open'
),
(
    'Quantum Key Distribution Protocol Simulation',
    'Simulation and vulnerability assessment of BB84 and continuous-variable QKD protocols against noise and eavesdropping attacks.',
    'Cybersecurity & Quantum Computing',
    'Dr. Marcus Vance',
    'Information Security',
    'Python, Qiskit, Cryptography, Probability Theory',
    1,
    '2026-10-20',
    'Closed'
);
