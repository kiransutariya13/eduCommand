-- Insert sample schools
INSERT INTO schools (name, address, principal_name, contact_number, email, total_students, total_teachers) VALUES
('Bhavnagar Primary School 1', 'Station Road, Bhavnagar', 'Dr. Rajesh Patel', '9876543210', 'bps1@bhavnagar.gov.in', 450, 18),
('Bhavnagar Primary School 2', 'College Road, Bhavnagar', 'Mrs. Priya Shah', '9876543211', 'bps2@bhavnagar.gov.in', 380, 15),
('Bhavnagar High School 1', 'Gandhi Chowk, Bhavnagar', 'Mr. Kiran Modi', '9876543212', 'bhs1@bhavnagar.gov.in', 650, 25),
('Bhavnagar High School 2', 'Market Area, Bhavnagar', 'Mrs. Sunita Joshi', '9876543213', 'bhs2@bhavnagar.gov.in', 580, 22),
('Bhavnagar Secondary School', 'New Area, Bhavnagar', 'Dr. Amit Desai', '9876543214', 'bss@bhavnagar.gov.in', 720, 28);

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, phone) VALUES
('admin@bhavnagar.gov.in', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'System Administrator', 'admin', '9876543200');

-- Insert sample teachers
INSERT INTO users (email, password_hash, full_name, role, school_id, phone) VALUES
('teacher1@bhavnagar.gov.in', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Ramesh Kumar', 'teacher', 1, '9876543201'),
('teacher2@bhavnagar.gov.in', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Meera Patel', 'teacher', 2, '9876543202'),
('teacher3@bhavnagar.gov.in', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Suresh Joshi', 'teacher', 3, '9876543203');
