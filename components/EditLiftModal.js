// components/EditLiftModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import { addLift, updateLift } from '../services/dbService';
import { Lift, TrackingLift } from '../models/liftModels';

const LBS_TO_KG_FACTOR = 0.453592;

const EditLiftModal = ({ visible, lift, isKg, colors, onClose, onSave }) => {
  const [editedWeight, setEditedWeight] = useState('');
  const [currentUnit, setCurrentUnit] = useState(isKg ? 'kg' : 'lbs');

  /**
   * useEffect hook to update the editedWeight state when the 'lift' prop or 'currentUnit' changes.
   * This ensures the input field correctly displays the lift's maxWeight in the selected unit.
   */
  useEffect(() => {
    if (lift) {
      if (currentUnit === 'kg') {
        setEditedWeight((lift.lift.maxWeight * LBS_TO_KG_FACTOR).toFixed(1));
      } else {
        setEditedWeight(lift.lift.maxWeight.toFixed(1));
      }
    }
  }, [lift, currentUnit]);

  /**
   * Toggles the unit of measurement between 'lbs' and 'kg' for the modal's input and display.
   */
  const toggleModalUnit = () => {
    setCurrentUnit(prevUnit => (prevUnit === 'lbs' ? 'kg' : 'lbs'));
  };

  /**
   * Converts a given weight from its current unit to pounds (lbs).
   * @param {string} weight - The weight value as a string.
   * @param {'lbs' | 'kg'} unit - The unit of the provided weight.
   * @returns {number} The converted weight in pounds.
   */
  const convertInputToLbs = (weight, unit) => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return 0;
    return unit === 'kg' ? numWeight / LBS_TO_KG_FACTOR : numWeight;
  };

  /**
   * Handles incrementing the edited weight by a specified amount.
   * The increment is applied in pounds, then converted back to the current display unit.
   * @param {number} amount - The amount to increment the weight by (in lbs if unit is lbs, or kg if unit is kg).
   */
  const handleIncrement = (amount) => {
    let currentLbs = convertInputToLbs(editedWeight, currentUnit);
    let newWeightLbs = currentLbs + amount;

    if (currentUnit === 'kg') {
      setEditedWeight((newWeightLbs * LBS_TO_KG_FACTOR).toFixed(1));
    } else {
      setEditedWeight(newWeightLbs.toFixed(1));
    }
  };

  /**
   * Handles decrementing the edited weight by a specified amount.
   * The decrement is applied in pounds, then converted back to the current display unit, ensuring it doesn't go below zero.
   * @param {number} amount - The amount to decrement the weight by (in lbs if unit is lbs, or kg if unit is kg).
   */
  const handleDecrement = (amount) => {
    let currentLbs = convertInputToLbs(editedWeight, currentUnit);
    let newWeightLbs = Math.max(0, currentLbs - amount); // Ensure weight doesn't go below 0

    if (currentUnit === 'kg') {
      setEditedWeight((newWeightLbs * LBS_TO_KG_FACTOR).toFixed(1));
    } else {
      setEditedWeight(newWeightLbs.toFixed(1));
    }
  };

  /**
   * Handles saving the changes to the lift's max weight.
   * It validates the input, converts the weight to lbs (as the database stores lbs),
   * and then calls the appropriate service function (updateLift) to persist the change.
   */
  const handleSave = async () => {
    // Convert the editedWeight from its current unit back to LBS for database storage
    const newMaxWeightInLbs = convertInputToLbs(editedWeight, currentUnit);

    if (isNaN(newMaxWeightInLbs) || newMaxWeightInLbs <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid max weight greater than zero.');
      return;
    }

    try {
      if (lift && lift.id) {
        // If 'lift' has an ID, it means we are updating an existing lift
        // Call the 'updateLift' function from dbService
        const success = await updateLift(lift.id, newMaxWeightInLbs);
        if (success) {
          Alert.alert('Success', 'Lift updated successfully!');
        } else {
          Alert.alert('Error', 'Failed to update lift. No lift found with this ID.');
        }
      }

      onSave(); // Callback to notify parent component of successful save
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error saving/updating lift:', error);
      Alert.alert('Error', 'Failed to save lift. Please try again.');
    }
  };

  if (!lift) return null; // Don't render if no lift is provided

  const incrementAmount = currentUnit === 'kg' ? 2.5 : 5;
  const doubleIncrementAmount = currentUnit === 'kg' ? 5 : 10;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.modalBackground }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{`Edit ${lift.lift.name}`}</Text>

          <View style={[styles.unitToggleContainer, { backgroundColor: colors.unitToggleBackground }]}>
            <Text style={[styles.unitText, { color: colors.unitToggleInactive }, currentUnit === 'lbs' && { color: colors.unitToggleActive }]}>LBS</Text>
            <Switch
              trackColor={{ false: colors.unitToggleInactive, true: colors.unitToggleActive }}
              thumbColor={currentUnit === 'kg' ? colors.primaryRed : colors.unitToggleInactive}
              ios_backgroundColor={colors.unitToggleInactive}
              onValueChange={toggleModalUnit}
              value={currentUnit === 'kg'}
            />
            <Text style={[styles.unitText, { color: colors.unitToggleInactive }, currentUnit === 'kg' && { color: colors.unitToggleActive }]}>KG</Text>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder={`Max Weight (${currentUnit.toUpperCase()})`}
            placeholderTextColor={colors.subText}
            value={editedWeight}
            onChangeText={setEditedWeight}
            keyboardType="numeric"
          />

          <View style={styles.incrementButtonRow}>
            <TouchableOpacity onPress={() => handleDecrement(doubleIncrementAmount)} style={[styles.incrementButton, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.incrementText, { color: colors.primaryRed }]}>{`-${doubleIncrementAmount}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDecrement(incrementAmount)} style={[styles.incrementButton, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.incrementText, { color: colors.primaryRed }]}>{`-${incrementAmount}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleIncrement(incrementAmount)} style={[styles.incrementButton, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.incrementText, { color: colors.primaryRed }]}>{`+${incrementAmount}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleIncrement(doubleIncrementAmount)} style={[styles.incrementButton, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.incrementText, { color: colors.primaryRed }]}>{`+${doubleIncrementAmount}`}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Save Changes" onPress={handleSave} color={colors.primaryRed} />
            <Button title="Cancel" onPress={onClose} color={colors.subText} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    width: '100%',
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 15,
    width: '100%',
    fontSize: 18,
    textAlign: 'center',
  },
  incrementButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  incrementButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 70,
    alignItems: 'center',
  },
  incrementText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
});

export default EditLiftModal;
