export async function getUserData(db: D1Database, userId: string) {
  const query = "SELECT * FROM Users WHERE username = ?";
  const params = [userId];

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  return result.results[0];
}

export async function getUserDataByEmail(db: D1Database, email: string) {
  const query = "SELECT * FROM Users WHERE email = ?";
  const params = [email];

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  return result.results[0];
}

export async function createUser(
  db: D1Database,
  userId: string,
  email: string
) {
  const insertQuery =
    "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)";
  const insertParams = [userId, email, ""];

  await db
    .prepare(insertQuery)
    .bind(...insertParams)
    .run();
}

export async function updateUser(
  db: D1Database,
  userId: string,
  email: string
) {
  const updateQuery = "UPDATE Users SET username = ? WHERE email= ?";
  const updateParams = [userId, email];

  await db
    .prepare(updateQuery)
    .bind(...updateParams)
    .run();
}
