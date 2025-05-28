// src/services/dbServices.js

// --- Configuration for switching between services ---
const USE_MOCK_SERVICE = false; // Set to false to use Expo SQLite
// ---------------------------------------------------

// --- Configuration for switching between services ---
import { Platform } from 'react-native';
const isWeb = Platform.OS === 'web';
// ---------------------------------------------------

// Note: expo-sqlite's .openDatabase() is not supported on web.
// The web platform typically relies on deprecated Web SQL or IndexedDB,
// which behave differently and are not fully compatible with native SQLite.
// Therefore, the mock service is used for web to ensure functionality.
if (isWeb)
  USE_MOCK_SERVICE = true;

import { Lift, TrackingLift } from '../models/liftModels';

let lowLevelDbService; // This variable will hold either mockDatabaseService or expoSqliteService

if (USE_MOCK_SERVICE) {
  console.log("Using Mock Database Service for data operations.");
  lowLevelDbService = require('./mockDatabaseService');
} else {
  console.log("Using Expo SQLite Service for data operations.");
  lowLevelDbService = require('./expoSqliteService');
}

/**
 * Initializes the underlying data storage (either Expo SQLite or in-memory mock).
 */
export const initDb = () => {
  return lowLevelDbService.initDb();
};

/**
 * Adds a new lift to the data store via the selected service.
 * @param {Lift} liftData - The Lift object containing name and maxWeight.
 * @returns {Promise<TrackingLift>} A promise that resolves with the newly created TrackingLift (with ID).
 */
export const addLift = async (liftData) => {
  try {
    const newTrackingLift = new TrackingLift(
      liftData,
      new Date().toLocaleDateString()
    );

    // Pass only the raw data needed by the low-level service
    const rawDataToSave = {
        name: newTrackingLift.lift.name,
        maxWeight: newTrackingLift.lift.maxWeight,
        date: newTrackingLift.date,
    };

    const newLiftId = await lowLevelDbService.saveTrackingLift(rawDataToSave);
    newTrackingLift.id = newLiftId;
    return newTrackingLift;
  } catch (error) {
    console.error('Error in addLift service:', error);
    throw error;
  }
};

/**
 * Fetches all lifts from the data store via the selected service.
 * @returns {Promise<Array<TrackingLift>>} A promise that resolves with an array of TrackingLift objects.
 */
export const fetchLifts = async () => {
  try {
    const rawLifts = await lowLevelDbService.fetchAllLifts();
    const trackingLifts = rawLifts.map(item => {
      const lift = new Lift(item.name, item.maxWeight);
      return new TrackingLift(
        lift,
        item.date,
        item.id
      );
    });
    console.log('TrackingLifts fetched successfully:', trackingLifts);
    return trackingLifts;
  } catch (error) {
    console.error('Error in fetchLifts service:', error);
    throw error;
  }
};

/**
 * Updates the maximum weight of an existing lift in the data store via the selected service.
 * @param {number} liftId - The ID of the lift to update.
 * @param {number} newMaxWeight - The new maximum weight for the lift.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 */
export const updateLift = async (liftId, newMaxWeight) => {
  try {
    const success = await lowLevelDbService.updateLiftMaxWeight(liftId, newMaxWeight);
    if (success) {
      console.log(`Lift with ID ${liftId} updated successfully to ${newMaxWeight}`);
      return true;
    } else {
      console.warn(`Lift with ID ${liftId} not found or not updated.`);
      return false;
    }
  } catch (error) {
    console.error(`Error in updateLift service for ID ${liftId}:`, error);
    throw error;
  }
};

/**
 * Deletes a lift from the data store via the selected service.
 * @param {number} liftId - The ID of the lift to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful, false otherwise.
 */
export const deleteLift = async (liftId) => {
  try {
    const success = await lowLevelDbService.deleteLiftById(liftId);
    if (success) {
      console.log(`Lift with ID ${liftId} deleted successfully.`);
      return true;
    } else {
      console.warn(`Lift with ID ${liftId} not found or not deleted.`);
      return false;
    }
  } catch (error) {
    console.error(`Error in deleteLift service for ID ${liftId}:`, error);
    throw error;
  }
};