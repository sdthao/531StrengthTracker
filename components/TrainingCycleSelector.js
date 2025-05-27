// components/TrainingCycleSelector.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const trainingCycles = ['Deload', '5/5/5', '3/3/3', '5/3/1'];

const TrainingCycleSelector = ({ selectedCycle, onSelectCycle, colors }) => {
  return (
    <View style={[styles.container, { borderColor: colors.cardBorder }]}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={trainingCycles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelectCycle(item)}
            style={[
              styles.cycleButton,
              { backgroundColor: colors.cardBackground },
              selectedCycle === item && { backgroundColor: colors.primaryRed, borderColor: colors.primaryRed },
            ]}
          >
            <Text
              style={[
                styles.cycleButtonText,
                { color: selectedCycle === item ? colors.text : colors.subText }, // Text color changes if active
                selectedCycle === item && { color: colors.background } // White text on red background
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 25, // Add some spacing below the selector
    width: '90%',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
  },
  flatListContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cycleButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'transparent', // Default transparent border
  },
  cycleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainingCycleSelector;
