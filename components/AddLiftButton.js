// components/AddLiftButton.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addLift } from '../services/dbService';
import { Lift } from '../models/liftModels';

const AddLiftButton = ({ onLiftAdded, colors }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [maxWeight, setMaxWeight] = useState('');

  /**
   * Handles the action of adding a new lift.
   * Performs input validation, creates a new Lift object, and then calls the
   * `addLift` service function to persist it to the database.
   * Resets the form and notifies the parent component on success.
   */
  const handleAddLift = async () => { // Made async to await the service call
    if (name.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a valid lift name.');
      return;
    }

    const parsedMaxWeight = parseFloat(maxWeight);
    if (isNaN(parsedMaxWeight) || parsedMaxWeight <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive max weight.');
      return;
    }

    // Create a Lift object, as the dbService.addLift now expects this.
    const newLift = new Lift(name, parsedMaxWeight);

    try {
      // Call the addLift function from dbService, passing the Lift object
      await addLift(newLift); // Await the asynchronous operation
      Alert.alert('Success', 'Lift added successfully!'); // Provide user feedback

      setModalVisible(false);
      setName('');
      setMaxWeight('');

      if (onLiftAdded) {
        onLiftAdded(); // Notify parent component that a lift has been added
      }
    } catch (error) {
      console.error('Error adding lift:', error);
      Alert.alert('Error', 'Failed to add lift. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/*
       * Button to open the modal for adding a new lift.
       * @param {function} onPress - Callback to set modal visibility to true.
       * @param {string} title - Text displayed on the button.
       * @param {string} color - Color of the button.
       */}
      <Button title="Add Lift" onPress={() => setModalVisible(true)} color={colors.primaryRed} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalBackground }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
            <Text style={[styles.modalText, { color: colors.text }]}>Enter New Lift Information</Text>

            {/*
             * Text input for the lift name.
             * @param {object} style - Styling for the TextInput.
             * @param {string} placeholder - Placeholder text.
             * @param {string} placeholderTextColor - Color of the placeholder text.
             * @param {string} value - Current value of the input.
             * @param {function} onChangeText - Callback function to update the name state.
             */}
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Lift Name"
              placeholderTextColor={colors.subText}
              value={name}
              onChangeText={setName}
            />
            {/*
             * Text input for the max weight.
             * @param {object} style - Styling for the TextInput.
             * @param {string} placeholder - Placeholder text.
             * @param {string} placeholderTextColor - Color of the placeholder text.
             * @param {string} value - Current value of the input.
             * @param {function} onChangeText - Callback function to update the maxWeight state.
             * @param {string} keyboardType - Specifies the type of keyboard to display ('numeric').
             */}
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Max Weight (lbs)"
              placeholderTextColor={colors.subText}
              value={maxWeight}
              onChangeText={setMaxWeight}
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              {/*
               * Button to trigger the add lift action.
               * @param {function} onPress - Callback to call handleAddLift.
               * @param {string} title - Text displayed on the button.
               * @param {string} color - Color of the button.
               */}
              <Button title="Add Lift" onPress={handleAddLift} color={colors.primaryRed} />
              {/*
               * Button to cancel and close the modal.
               * @param {function} onPress - Callback to set modal visibility to false.
               * @param {string} title - Text displayed on the button.
               * @param {string} color - Color of the button.
               */}
              <Button title="Cancel" onPress={() => setModalVisible(false)} color={colors.subText} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default AddLiftButton;
