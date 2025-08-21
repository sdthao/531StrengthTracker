// components/DeleteLiftButton.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { fetchLifts, deleteLift } from '../services/dbService';
import { Picker } from '@react-native-picker/picker';

const DeleteLiftButton = ({ onLiftDeleted, colors }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lifts, setLifts] = useState([]);
  const [selectedLiftId, setSelectedLiftId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load lifts when modal opens
  useEffect(() => {
    if (modalVisible) {
      loadLifts();
    }
  }, [modalVisible]);

  const loadLifts = async () => {
    setLoading(true);
    try {
      const fetchedLifts = await fetchLifts();
      setLifts(fetchedLifts);
      if (fetchedLifts.length > 0) {
        setSelectedLiftId(fetchedLifts[0].id);
      } else {
        setSelectedLiftId(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load lifts.');
    }
    setLoading(false);
  };

  const handleDeleteLift = async () => {
    if (selectedLiftId == null) {
      Alert.alert('No Lift Selected', 'Please select a lift to delete.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this lift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteLift(selectedLiftId);
              if (success) {
                Alert.alert('Success', 'Lift deleted successfully.');
                setModalVisible(false);
                if (onLiftDeleted) onLiftDeleted();
              } else {
                Alert.alert('Error', 'Lift not found or could not be deleted.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lift.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Delete Lift" onPress={() => setModalVisible(true)} color={colors.primaryRed} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalBackground }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
            <Text style={[styles.modalText, { color: colors.text }]}>Select Lift to Delete</Text>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primaryRed} />
            ) : lifts.length === 0 ? (
              <Text style={{ color: colors.text, marginVertical: 20 }}>No lifts available to delete.</Text>
            ) : (
              <Picker
                selectedValue={selectedLiftId}
                onValueChange={(itemValue) => setSelectedLiftId(itemValue)}
                style={{
                  width: '100%',
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 15,
                  ...Platform.select({
                    android: { color: colors.text },
                    ios: {},
                  }),
                }}
                itemStyle={{ color: colors.text }}
              >
                {lifts.map(lift => (
                  <Picker.Item
                    label={`${lift.lift.name} (${lift.lift.maxWeight} lbs)`}
                    value={lift.id}
                    key={lift.id}
                  />
                ))}
              </Picker>
            )}

            <View style={styles.buttonContainer}>
              <Button title="Delete Lift" onPress={handleDeleteLift} color={colors.primaryRed} disabled={lifts.length === 0} />
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default DeleteLiftButton;
