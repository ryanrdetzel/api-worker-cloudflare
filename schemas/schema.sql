DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL
);

INSERT INTO users (username, password, email) VALUES ('Alice', 'alicepass', 'alice@example.com');
INSERT INTO users (username, password, email) VALUES ('Bob', 'bobpass', 'bob@example.com');
INSERT INTO users (username, password, email) VALUES ('Charlie', 'charliepass', 'charlie@example.com');
INSERT INTO users (username, password, email) VALUES ('David', 'davidpass', 'david@example.com');
INSERT INTO users (username, password, email) VALUES ('Eva', 'evapass', 'eva@example.com');
INSERT INTO users (username, password, email) VALUES ('Frank', 'frankpass', 'frank@example.com');
INSERT INTO users (username, password, email) VALUES ('Grace', 'gracepass', 'grace@example.com');
INSERT INTO users (username, password, email) VALUES ('Hank', 'hankpass', 'hank@example.com');
INSERT INTO users (username, password, email) VALUES ('Ivy', 'ivypass', 'ivy@example.com');
INSERT INTO users (username, password, email) VALUES ('Jack', 'jackpass', 'jack@example.com');
