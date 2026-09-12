-- ==========================================================
-- Careonix Job Portal - MySQL Multi-Database Initialization
-- Automatically executed on first run of MySQL container
-- ==========================================================

-- 1. Main Job Portal Database (Used by job-service, profile-service, notification-service)
CREATE DATABASE IF NOT EXISTS `jobportal_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Subscription & Payment Database (Used by subscription-service)
CREATE DATABASE IF NOT EXISTS `subscriptiondb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Authentication & User Credentials Database (Used by auth-service)
CREATE DATABASE IF NOT EXISTS `authdb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Interview Scheduling Database (Used by interview-service)
CREATE DATABASE IF NOT EXISTS `interviewdb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Permissions & Grants
GRANT ALL PRIVILEGES ON `jobportal_db`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `subscriptiondb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `authdb`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `interviewdb`.* TO 'root'@'%';

GRANT ALL PRIVILEGES ON `subscriptiondb`.* TO 'sub_user'@'%';
GRANT ALL PRIVILEGES ON `jobportal_db`.* TO 'sub_user'@'%';

FLUSH PRIVILEGES;
