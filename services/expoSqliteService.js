// src/services/expoSqliteService.js

import * as SQLite from 'expo-sqlite';

let db; // This will hold the database instance

/**
 * Initializes the SQLite database for Expo.
 * Opens the database and creates the 'lifts' table if it doesn't exist.
 */
export const initDb = () => {
  return new Promise((resolve, reject) => {
    db = SQLite.openDatabase('lifts.db');

    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS lifts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          maxWeight REAL NOT NULL,
          date TEXT NOT NULL
        );`,
        [],
        () => {
          console.log('Expo SQLite: Lifts table created or already exists.');
          resolve();
        },
        (_, error) => { // Error callback for executeSql
          console.error('Expo SQLite: Error creating lifts table:', error);
          reject(error);
          return true; // Return true to rollback the transaction on error
        }
      );
    },
    (error) => { // Error callback for transaction
      console.error('Expo SQLite: Transaction error during initDb:', error);
      reject(error);
    },
    () => { // Success callback for transaction
      console.log('Expo SQLite: initDb transaction completed successfully.');
      resolve();
    });
  });
};

/**
 * Saves a raw lift object to the Expo SQLite database.
 * @param {Object} rawLiftData - An object with { name, maxWeight, date }.
 * @returns {Promise<number>} A promise that resolves with the ID of the newly inserted row.
 */
export const saveTrackingLift = (rawLiftData) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Expo SQLite: Database not initialized. Call initDb first.');
      return reject(new Error('Database not initialized.'));
    }

    const { name, maxWeight, date } = rawLiftData;

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO lifts (name, maxWeight, date) VALUES (?, ?, ?);',
        [name, maxWeight, date],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log('Expo SQLite: Raw lift saved successfully with ID:', results.insertId);
            resolve(results.insertId);
          } else {
            reject(new Error('Failed to save raw lift to DB.'));
          }
        },
        (_, error) => {
          console.error('Expo SQLite: Error saving raw lift:', error);
          reject(error);
          return true;
        }
      );
    },
    (error) => {
      console.error('Expo SQLite: Transaction error during saveTrackingLift:', error);
      reject(error);
    });
  });
};

/**
 * Fetches all lifts from the Expo SQLite database.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of raw lift objects from the DB.
 */
export const fetchAllLifts = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Expo SQLite: Database not initialized. Call initDb first.');
      return reject(new Error('Database not initialized.'));
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM lifts;',
        [],
        (_, { rows }) => { // Expo SQLite returns results in 'rows' property
          const lifts = rows._array; // Access the array of results
          console.log('Expo SQLite: Lifts fetched (raw):', lifts);
          resolve(lifts);
        },
        (_, error) => {
          console.error('Expo SQLite: Error fetching all lifts:', error);
          reject(error);
          return true;
        }
      );
    },
    (error) => {
      console.error('Expo SQLite: Transaction error during fetchAllLifts:', error);
      reject(error);
    });
  });
};

/**
 * Updates the maximum weight of an existing lift in the Expo SQLite database.
 * @param {number} liftId - The ID of the lift to update.
 * @param {number} newMaxWeight - The new maximum weight for the lift.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 */
export const updateLiftMaxWeight = (liftId, newMaxWeight) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Expo SQLite: Database not initialized. Call initDb first.');
      return reject(new Error('Database not initialized.'));
    }

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE lifts SET maxWeight = ? WHERE id = ?;',
        [newMaxWeight, liftId],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log(`Expo SQLite: Lift with ID ${liftId} updated successfully to ${newMaxWeight}.`);
            resolve(true);
          } else {
            console.log(`Expo SQLite: No lift found with ID ${liftId} to update.`);
            resolve(false);
          }
        },
        (_, error) => {
          console.error(`Expo SQLite: Error updating lift with ID ${liftId}:`, error);
          reject(error);
          return true;
        }
      );
    },
    (error) => {
      console.error('Expo SQLite: Transaction error during updateLiftMaxWeight:', error);
      reject(error);
    });
  });
};

/**
 * Deletes a lift from the Expo SQLite database.
 * @param {number} liftId - The ID of the lift to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful, false otherwise.
 */
export const deleteLiftById = (liftId) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Expo SQLite: Database not initialized. Call initDb first.');
      return reject(new Error('Database not initialized.'));
    }

    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM lifts WHERE id = ?;',
        [liftId],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log(`Expo SQLite: Lift with ID ${liftId} deleted successfully.`);
            resolve(true);
          } else {
            console.log(`Expo SQLite: No lift found with ID ${liftId} to delete.`);
            resolve(false);
          }
        },
        (_, error) => {
          console.error(`Expo SQLite: Error deleting lift with ID ${liftId}:`, error);
          reject(error);
          return true;
        }
      );
    },
    (error) => {
      console.error('Expo SQLite: Transaction error during deleteLiftById:', error);
      reject(error);
    });
  });
};
