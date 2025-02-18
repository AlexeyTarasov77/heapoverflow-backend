BEGIN;
-- Очистка таблиц перед сидированием
TRUNCATE TABLE "saved_answer" CASCADE;
TRUNCATE TABLE "comment" CASCADE;
TRUNCATE TABLE "answer" CASCADE;
TRUNCATE TABLE "question" CASCADE;
TRUNCATE TABLE "collection" CASCADE;
TRUNCATE TABLE "user" CASCADE;

-- Создание пользователей
INSERT INTO "user" (username, email, "passwordHash") VALUES
('user1', 'user1@example.com', 'password1'),
('user2', 'user2@example.com', 'password2'),
('user3', 'user3@example.com', 'password3'),
('user4', 'user4@example.com', 'password4'),
('user5', 'user5@example.com', 'password5'),
('user6', 'user6@example.com', 'password6'),
('user7', 'user7@example.com', 'password7'),
('user8', 'user8@example.com', 'password8'),
('user9', 'user9@example.com', 'password9'),
('user10', 'user10@example.com', 'password10');

-- Создание вопросов
INSERT INTO "question" (title, body, tags, "authorId") VALUES
('What is TypeScript?', 'A brief introduction to TypeScript.', ARRAY['typescript', 'javascript'], 1),
('How to use PostgreSQL?', 'Steps to set up and use PostgreSQL.', ARRAY['postgresql', 'database'], 2),
('What is Docker?', 'An introduction to Docker containers.', ARRAY['docker', 'devops'], 3),
('Understanding REST APIs', 'What are REST APIs and how to use them.', ARRAY['api', 'rest'], 4),
('Basics of Git', 'How to use Git for version control.', ARRAY['git', 'version-control'], 5);

-- Создание ответов
INSERT INTO "answer" (body, "questionId", "authorId", upvotes) VALUES
('TypeScript is a superset of JavaScript.', 1, 2, 10),
('Install PostgreSQL and use pgAdmin for GUI.', 2, 3, 15),
('Docker simplifies containerization.', 3, 4, 20),
('REST APIs use HTTP methods for CRUD operations.', 4, 5, 5),
('Git is a distributed version control system.', 5, 1, 30);

-- Создание комментариев
INSERT INTO "comment" (body, "authorId", "parentCommentId") VALUES
('Great explanation!', 2, NULL),
('Very helpful, thanks!', 3, NULL),
('Can you add more details?', 4, 1),
('This is exactly what I needed.', 5, 2),
('How does this work in practice?', 1, 3);

-- Создание коллекций
INSERT INTO "collection" (name) VALUES
('Favorite Answers'),
('Database Tips'),
('Development Tools'),
('API Guidelines'),
('Version Control Basics');

-- Создание сохраненных ответов
INSERT INTO "saved_answer" ("userId", "answerId", "collectionId") VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5);
COMMIT;
