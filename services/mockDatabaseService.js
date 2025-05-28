// src/services/mockLiftService.js

import { Lift, TrackingLift } from '../models/liftModels'; // Needed for creating mock data

let mockLiftsData = []; // This will be our in-memory "database"
let nextMockId = 1;      // To simulate auto-incrementing IDs

const addInitialMockData = () => {
    if (mockLiftsData.length === 0) {
        const date = new Date().toLocaleDateString();
        mockLiftsData.push({ id: nextMockId++, name: "Squat", maxWeight: 225, date: date });
        mockLiftsData.push({ id: nextMockId++, name: "Bench Press", maxWeight: 185, date: date });
        mockLiftsData.push({ id: nextMockId++, name: "Deadlift", maxWeight: 315, date: date });
        console.log("Mock data initialized:", mockLiftsData);
    }
};

/**
 * Initializes the mock in-memory "database."
 */
export const initDb = () => {
    console.log('Mock in-memory database initialized.');
    addInitialMockData();
    return Promise.resolve();
};

/**
 * Saves a TrackingLift object to the in-memory array.
 * @param {TrackingLift} trackingLift - The TrackingLift object to save.
 * @returns {Promise<number>} A promise that resolves with the simulated ID.
 */
export const saveTrackingLift = (trackingLift) => {
    return new Promise((resolve) => {
        const newId = nextMockId++;
        const newRecord = {
            id: newId,
            name: trackingLift.lift.name,
            maxWeight: trackingLift.lift.maxWeight,
            date: trackingLift.date,
        };
        mockLiftsData.push(newRecord);
        console.log('Mock Service: TrackingLift saved successfully with ID:', newId, newRecord);
        resolve(newId);
    });
};

/**
 * Fetches all lifts from the in-memory array.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of raw lift objects.
 */
export const fetchAllLifts = () => {
    return new Promise((resolve) => {
        console.log('Mock Service: Lifts fetched (raw):', mockLiftsData);
        resolve([...mockLiftsData]); // Return a copy to prevent direct modification
    });
};

/**
 * Updates the maximum weight of an existing lift in the in-memory array.
 * @param {number} liftId - The ID of the lift to update.
 * @param {number} newMaxWeight - The new maximum weight for the lift.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 */
export const updateLiftMaxWeight = (liftId, newMaxWeight) => {
    return new Promise((resolve) => {
        const index = mockLiftsData.findIndex(lift => lift.id === liftId);
        if (index !== -1) {
            mockLiftsData[index].maxWeight = newMaxWeight;
            console.log(`Mock Service: Lift with ID ${liftId} updated successfully to ${newMaxWeight}.`);
            resolve(true);
        } else {
            console.log(`Mock Service: No lift found with ID ${liftId} to update.`);
            resolve(false);
        }
    });
};

/**
 * Deletes a lift from the in-memory array.
 * @param {number} liftId - The ID of the lift to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 */
export const deleteLiftById = (liftId) => {
    return new Promise((resolve) => {
        const initialLength = mockLiftsData.length;
        mockLiftsData = mockLiftsData.filter(lift => lift.id !== liftId);
        if (mockLiftsData.length < initialLength) {
            console.log(`Mock Service: Lift with ID ${liftId} deleted successfully.`);
            resolve(true);
        } else {
            console.log(`Mock Service: No lift found with ID ${liftId} to delete.`);
            resolve(false);
        }
    });
};