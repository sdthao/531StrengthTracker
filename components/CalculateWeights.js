import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import EditLiftModal from './EditLiftModal';
import { updateLift } from '../services/dbService';
import { Lift, WorkSet, TrackingLift } from '../models/liftModels';

const LBS_TO_KG_FACTOR = 0.453592;
const { width: screenWidth } = Dimensions.get('window');

const ITEM_WIDTH_PERCENTAGE = 0.6;
const ITEM_MARGIN_HORIZONTAL = 10;

const ITEM_FULL_WIDTH = screenWidth * ITEM_WIDTH_PERCENTAGE + ITEM_MARGIN_HORIZONTAL * 2;
const PADDING_HORIZONTAL = (screenWidth - ITEM_FULL_WIDTH) / 2;

const trainingCycles = ['Deload', '5/5/5', '3/3/3', '5/3/1'];

/**
 * Calculates the warm-up and working set weights and reps based on the max weight and selected training cycle.
 * @param {number} maxWeight - The maximum weight for the lift in pounds.
 * @param {string} cycle - The selected training cycle (e.g., 'Deload', '5/5/5').
 * @returns {{warmUp: {rpe40: number, rpe50: number, rpe60: number} | null, workingSets: WorkSet | null}}
 * An object containing calculated warm-up weights and a WorkSet object for working sets.
 */
const calculateTrainingWeights = (maxWeight, cycle) => {
  const calculateWeight = (percentage) => maxWeight * (percentage / 100);

  // Standard warm-up percentages (fixed)
  const warmUpPercentages = [40, 50, 60];
  const warmUpReps = [5, 5, 3]; // Fixed reps for warm-up

  let workingSetPercentages = null;
  let workingSetReps = null;

  // Calculate warm-up weights, but only return them if the cycle isn't 'Deload'
  const calculatedWarmUp = {
    rpe40: calculateWeight(warmUpPercentages[0]),
    rpe50: calculateWeight(warmUpPercentages[1]),
    rpe60: calculateWeight(warmUpPercentages[2]),
    reps40: warmUpReps[0],
    reps50: warmUpReps[1],
    reps60: warmUpReps[2]
  };

  switch (cycle) {
    case 'Deload':
      // For Deload, working sets might be the same as warm-up or a specific deload protocol.
      // Your previous logic used standardWarmUpPercentages and standardWarmUpReps for Deload.
      // Let's ensure calculatedWarmUpRPE is null for Deload as per your previous logic.
      workingSetPercentages = [40, 50, 60]; // Or define specific deload percentages
      workingSetReps = [5, 5, 3]; // And deload reps
      break;
    case '5/5/5':
      workingSetPercentages = [65, 75, 85];
      workingSetReps = [5, 5, 5];
      break;
    case '3/3/3':
      workingSetPercentages = [70, 80, 90];
      workingSetReps = [3, 3, 3];
      break;
    case '5/3/1':
      workingSetPercentages = [75, 85, 95];
      workingSetReps = [5, 3, 1];
      break;
    default:
      // Default to 5/3/1 if no cycle is matched
      workingSetPercentages = [75, 85, 95];
      workingSetReps = [5, 3, 1];
      break;
  }

  let calculatedWorkingSets = null;
  if (workingSetPercentages && workingSetReps) {
    calculatedWorkingSets = new WorkSet(
      calculateWeight(workingSetPercentages[0]),
      calculateWeight(workingSetPercentages[1]),
      calculateWeight(workingSetPercentages[2]),
      workingSetReps[0],
      workingSetReps[1],
      workingSetReps[2]
    );
  }

  return {
    warmUp: cycle === 'Deload' ? null : calculatedWarmUp, // Warm-up is null for Deload
    workingSets: calculatedWorkingSets // Always return working sets, even for Deload (which uses its own percentages)
  };
};


const CalculateWeights = ({ lifts, isKg, colors, onLiftsUpdated, selectedCycle, onSelectCycle }) => {
  const [currentLiftIndex, setCurrentLiftIndex] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedLiftForEdit, setSelectedLiftForEdit] = useState(null);
  const flatListRef = useRef(null);

  /**
   * Converts a weight from pounds to the currently selected unit (kg or lbs).
   * @param {number} weightInLbs - The weight value in pounds.
   * @returns {string} The formatted weight in the selected unit.
   */
  const convertWeight = (weightInLbs) => {
    if (isKg) {
      return (weightInLbs * LBS_TO_KG_FACTOR).toFixed(1);
    }
    return weightInLbs.toFixed(1);
  };

  const unitLabel = isKg ? 'kg' : 'lbs';

  /**
   * Scrolls the FlatList to a specific lift item by its index.
   * @param {number} index - The index of the item to scroll to.
   */
  const scrollToIndex = (index) => {
    if (flatListRef.current && lifts.length > 0) {
      const validIndex = Math.max(0, Math.min(index, lifts.length - 1));
      flatListRef.current.scrollToIndex({
        index: validIndex,
        animated: true,
        viewPosition: 0.5,
      });
      setCurrentLiftIndex(validIndex);
    }
  };

  /**
   * Handles the scroll event of the FlatList to determine the currently centered lift.
   * @param {object} event - The native scroll event object.
   */
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round((contentOffsetX + PADDING_HORIZONTAL) / ITEM_FULL_WIDTH);
    if (index !== currentLiftIndex) {
      setCurrentLiftIndex(index);
    }
  };

  /**
   * Effect hook to ensure the FlatList scrolls to the `currentLiftIndex` whenever
   * the `lifts` data or `currentLiftIndex` changes.
   */
  useEffect(() => {
    if (lifts.length > 0) {
      scrollToIndex(currentLiftIndex);
    }
  }, [lifts, currentLiftIndex]);

  // Determine the lift details to display based on currentLiftIndex
  const displayedLiftDetails = lifts[currentLiftIndex];
  let calculatedWarmUp = null; // Renamed from calculatedWarmUpRPE
  let calculatedWorkSets = null; // Renamed from calculatedRpeModel

  if (displayedLiftDetails) {
    const { warmUp, workingSets } = calculateTrainingWeights( // Use the new function name
      displayedLiftDetails.lift.maxWeight,
      selectedCycle
    );
    calculatedWarmUp = warmUp;
    calculatedWorkSets = workingSets;
  }

  /**
   * Opens the EditLiftModal for a specific lift.
   * @param {TrackingLift} lift - The TrackingLift object to be edited.
   */
  const openEditModal = (lift) => {
    setSelectedLiftForEdit(lift);
    setIsEditModalVisible(true);
  };

  /**
   * Callback function for when a lift is saved/updated in the EditLiftModal.
   * It calls the `updateLift` service function and then triggers a refresh
   * of the lifts in the parent component.
   * @param {number} liftId - The ID of the lift that was updated.
   * @param {number} newMaxWeight - The new max weight for the lift in pounds.
   */
  const handleSaveEditedLift = async () => { // Made async as updateLift is async
    if (selectedLiftForEdit && selectedLiftForEdit.id) {
        // The EditLiftModal's onSave now implicitly handles the update within itself,
        // it doesn't pass liftId and newMaxWeight to this function anymore.
        // Instead, onSave in EditLiftModal calls updateLift, and then triggers onSave() prop.
        // So, this function's purpose is just to refresh the list.
        if (onLiftsUpdated) {
            onLiftsUpdated(); // This will trigger a re-fetch of lifts in the parent component
        }
        setIsEditModalVisible(false); // Close the modal after save
    }
  };


  return (
    <View style={styles.container}>
      {lifts.length === 0 ? (
        <Text style={[styles.noLiftsText, { color: colors.subText }]}>No lifts added yet.</Text>
      ) : (
        <>
          <View style={styles.topRowContainer}>
            {Platform.OS === 'web' && currentLiftIndex > 0 && (
              <TouchableOpacity
                onPress={() => scrollToIndex(currentLiftIndex - 1)}
                style={styles.arrowButton}
              >
                <Text style={[styles.arrowText, { color: colors.arrowButton }]}>{'<'}</Text>
              </TouchableOpacity>
            )}

            <FlatList
              ref={flatListRef}
              data={lifts}
              horizontal={true}
              pagingEnabled={false}
              snapToAlignment="center"
              snapToInterval={ITEM_FULL_WIDTH}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={[styles.topLiftItem, { backgroundColor: colors.background }]}
                >
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Text style={[
                      styles.topLiftName,
                      index === currentLiftIndex ? { color: colors.text } : { color: colors.subText }
                    ]}>
                      {item.lift.name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Text style={[
                      styles.topLiftWeight,
                      index === currentLiftIndex ? { color: colors.text } : { color: colors.subText }
                    ]}>
                      {`${convertWeight(item.lift.maxWeight)} ${unitLabel}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.topFlatListContent}
              onMomentumScrollEnd={handleScroll}
            />

            {Platform.OS === 'web' && currentLiftIndex < lifts.length - 1 && (
              <TouchableOpacity
                onPress={() => scrollToIndex(currentLiftIndex + 1)}
                style={styles.arrowButton}
              >
                <Text style={[styles.arrowText, { color: colors.arrowButton }]}>{'>'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.cycleSelectorContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trainingCycles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onSelectCycle(item)}
                  style={styles.cycleButton}
                >
                  <Text
                    style={[
                      styles.cycleButtonText,
                      { color: selectedCycle === item ? colors.primaryRed : colors.subText },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.cycleListContent}
            />
          </View>

          {displayedLiftDetails && (
            <View style={[styles.bottomBlock, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, shadowColor: colors.shadowColor }]}>
              {calculatedWarmUp && ( // Display warm-up only if calculatedWarmUp is not null (i.e., not Deload)
                <View style={[styles.rpeSection, { borderTopColor: colors.rpeSectionBorder }]}>
                  <Text style={[styles.rpeHeader, { color: colors.text }]}>Warm-up</Text>
                  <View style={styles.rpeDetailHeaderRow}>
                    <Text style={[styles.rpeDetailHeader, { color: colors.text }]}>RPE</Text>
                    <Text style={[styles.rpeDetailHeader, { color: colors.text }]}>Weight</Text>
                    <Text style={[styles.rpeDetailHeader, { color: colors.text }]}>Reps</Text>
                  </View>
                  <View style={styles.rpeDetailRow}>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>40%</Text>
                    <Text style={[styles.rpeDetail, { color: colors.primaryRed }]}>{`${convertWeight(calculatedWarmUp.rpe40)} ${unitLabel}`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{calculatedWarmUp.reps40}</Text>
                  </View>
                  <View style={styles.rpeDetailRow}>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>50%</Text>
                    <Text style={[styles.rpeDetail, { color: colors.primaryRed }]}>{`${convertWeight(calculatedWarmUp.rpe50)} ${unitLabel}`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{calculatedWarmUp.reps50}</Text>
                  </View>
                  <View style={styles.rpeDetailRow}>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>60%</Text>
                    <Text style={[styles.rpeDetail, { color: colors.primaryRed }]}>{`${convertWeight(calculatedWarmUp.rpe60)} ${unitLabel}`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{calculatedWarmUp.reps60}</Text>
                  </View>
                </View>
              )}

              {calculatedWorkSets && (
                <View style={[styles.rpeSection, { borderTopColor: colors.rpeSectionBorder }]}>
                  <Text style={[styles.rpeHeader, { color: colors.text }]}>Working Sets</Text>
                  <View style={styles.rpeDetailHeaderRow}>
                    <Text style={[styles.rpeDetailHeader, { color: colors.text }]}>RPE</Text>
                    <Text style={[styles.rpeDetailHeader, { color: colors.text }]}>Weight</Text>
                    <Text style={[styles.rpeDetailHeader, { color: colors.text }]}>Reps</Text>
                  </View>
                  <View style={styles.rpeDetailRow}>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{`${(calculatedWorkSets.repLift1 / displayedLiftDetails.lift.maxWeight * 100).toFixed(0)}%`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.primaryRed }]}>{`${convertWeight(calculatedWorkSets.repLift1)} ${unitLabel}`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{calculatedWorkSets.reps1}</Text>
                  </View>
                  <View style={styles.rpeDetailRow}>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{`${(calculatedWorkSets.repLift2 / displayedLiftDetails.lift.maxWeight * 100).toFixed(0)}%`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.primaryRed }]}>{`${convertWeight(calculatedWorkSets.repLift2)} ${unitLabel}`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{calculatedWorkSets.reps2}</Text>
                  </View>
                  <View style={styles.rpeDetailRow}>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{`${(calculatedWorkSets.repLift3 / displayedLiftDetails.lift.maxWeight * 100).toFixed(0)}%`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.primaryRed }]}>{`${convertWeight(calculatedWorkSets.repLift3)} ${unitLabel}`}</Text>
                    <Text style={[styles.rpeDetail, { color: colors.subText }]}>{calculatedWorkSets.reps3}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/*
           * Modal component for editing lift details.
           * @param {boolean} visible - Controls the visibility of the modal.
           * @param {TrackingLift} lift - The lift object currently being edited.
           * @param {boolean} isKg - Indicates if the current unit is kilograms.
           * @param {object} colors - Theme colors object.
           * @param {function} onClose - Callback to close the modal.
           * @param {function} onSave - Callback triggered when save button is pressed in the modal.
           */}
          <EditLiftModal
            visible={isEditModalVisible}
            lift={selectedLiftForEdit}
            isKg={isKg}
            colors={colors}
            onClose={() => setIsEditModalVisible(false)}
            onSave={handleSaveEditedLift} // This will now just trigger the refresh from LiftList
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  noLiftsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  topRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 100,
    marginBottom: 10,
  },
  arrowButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  topFlatListContent: {
    paddingHorizontal: PADDING_HORIZONTAL,
    alignItems: 'center',
  },
  topLiftItem: {
    width: screenWidth * ITEM_WIDTH_PERCENTAGE,
    marginHorizontal: ITEM_MARGIN_HORIZONTAL,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  topLiftName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  topLiftWeight: {
    fontSize: 16,
  },
  cycleSelectorContainer: {
    width: '100%',
    marginBottom: 20,
  },
  cycleListContent: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  cycleButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  cycleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBlock: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: screenWidth * 0.9,
  },
  rpeSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  rpeHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  rpeDetailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  rpeDetailHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rpeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  rpeDetail: {
    fontSize: 15,
    lineHeight: 24,
    flex: 1,
    textAlign: 'center',
  },
});

export default CalculateWeights;
