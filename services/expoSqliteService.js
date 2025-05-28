// src/services/expoSqliteService.js

import * as SQLite from 'expo-sqlite';

let db = null;
const dbName = "lifts";

/**
 * Initializes the SQLite database for Expo.
 * Opens the database and creates the 'lifts' table if it doesn't exist.
 */
export const initDb = async () => {
  try {
    db = await SQLite.openDatabaseAsync(`${dbName}.db`);
    console.log(`Expo SQLite: Database "${dbName}.db" opened successfully.`);

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ${dbName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        maxWeight REAL NOT NULL,
        date TEXT NOT NULL
      );
    `);
    console.log(`Expo SQLite: "${dbName}" table created or already exists.`);
    return db;
  } catch (error) {
    console.error('Expo SQLite: Error during initDb:', error);
    throw error;
  }
};

/**
 * Saves a raw lift object to the Expo SQLite database.
 * @param {Object} rawLiftData - An object with { name, maxWeight, date }.
 * @returns {Promise<number>} A promise that resolves with the ID of the newly inserted row.
 */
export const saveTrackingLift = async (rawLiftData) => {
  if (!db) {
    console.error('Expo SQLite: Database not initialized. Call initDb first.');
    throw new Error('Database not initialized.');
  }

  const { name, maxWeight, date } = rawLiftData;

  try {
    // INSERT
    const result = await db.runAsync(
      `INSERT INTO ${dbName} (name, maxWeight, date) VALUES (?, ?, ?);`,
      [name, maxWeight, date]
    );
    if (result.lastInsertRowId) {
      console.log(`Expo SQLite: Raw lift saved to "${dbName}" with ID:`, result.lastInsertRowId);
      return result.lastInsertRowId;
    } else {
      throw new Error(`Failed to save raw lift to "${dbName}". No insert ID returned.`);
    }
  } catch (error) {
    console.error(`Expo SQLite: Error saving raw lift to "${dbName}":`, error);
    throw error;
  }
};

/**
 * Fetches all lifts from the Expo SQLite database.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of raw lift objects from the DB.
 */
export const fetchAllLifts = async () => {
  if (!db) {
    console.error('Expo SQLite: Database not initialized. Call initDb first.');
    throw new Error('Database not initialized.');
  }

  try {
    // SELECT
    const lifts = await db.getAllAsync(`SELECT * FROM ${dbName};`);
    console.log(`Expo SQLite: Lifts fetched from "${dbName}":`, lifts);
    return lifts;
  } catch (error) {
    console.error(`Expo SQLite: Error fetching all lifts from "${dbName}":`, error);
    throw error;
  }
};

/**
 * Updates the maximum weight of an existing lift in the Expo SQLite database.
 * @param {number} liftId - The ID of the lift to update.
 * @param {number} newMaxWeight - The new maximum weight for the lift.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 */
export const updateLiftMaxWeight = async (liftId, newMaxWeight) => {
  if (!db) {
    console.error('Expo SQLite: Database not initialized. Call initDb first.');
    throw new Error('Database not initialized.');
  }

  try {
    // UPDATE
    const result = await db.runAsync(
      `UPDATE ${dbName} SET maxWeight = ? WHERE id = ?;`,
      [newMaxWeight, liftId]
    );
    if (result.changes && result.changes > 0) {
      console.log(`Expo SQLite: Lift with ID ${liftId} in "${dbName}" updated successfully to ${newMaxWeight}.`);
      return true;
    } else {
      console.log(`Expo SQLite: No lift found with ID ${liftId} in "${dbName}" to update.`);
      return false;
    }
  } catch (error) {
    console.error(`Expo SQLite: Error updating lift with ID ${liftId} in "${dbName}":`, error);
    throw error;
  }
};

/**
 * Deletes a lift from the Expo SQLite database.
 * @param {number} liftId - The ID of the lift to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful, false otherwise.
 */
export const deleteLiftById = async (liftId) => {
  if (!db) {
    console.error('Expo SQLite: Database not initialized. Call initDb first.');
    throw new Error('Database not initialized.');
  }

  try {
    // DELETE
    const result = await db.runAsync(
      `DELETE FROM ${dbName} WHERE id = ?;`,
      [liftId]
    );
    if (result.changes && result.changes > 0) {
      console.log(`Expo SQLite: Lift with ID ${liftId} deleted from "${dbName}" successfully.`);
      return true;
    } else {
      console.log(`Expo SQLite: No lift found with ID ${liftId} in "${dbName}" to delete.`);
      return false;
    }
  } catch (error) {
    console.error(`Expo SQLite: Error deleting lift with ID ${liftId} from "${dbName}":`, error);
    throw error;
  }
};
