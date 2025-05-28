import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, useColorScheme, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import AddLiftButton from './components/AddLiftButton';
import CalculateWeights from './components/CalculateWeights';
import { fetchLifts, initDb } from './services/dbService';
import { lightColors, darkColors } from './constants/colors';

export default function App() {
  const [lifts, setLifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isKg, setIsKg] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('5/5/5');
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  /**
   * Asynchronously loads lifts from the database using the dbService.
   * Sets the loading state before and after fetching data, and updates
   * the 'lifts' state with the fetched data.
   */
  const loadLifts = async () => {
    try {
      setIsLoading(true);
      const fetchedTrackingLifts = await fetchLifts();
      setLifts(fetchedTrackingLifts);
    }
    catch (error)
    {
      console.error('Failed to load lifts:', error);
      Alert.alert('Error', 'Failed to load lifts. Please try again.');
    }
    finally
    {
      setIsLoading(false);
    }
  };

  /**
   * Toggles the unit of measurement between pounds (lbs) and kilograms (kg).
   */
  const toggleUnit = () => setIsKg(previousState => !previousState);

  /**
   * Callback function triggered when lifts are added or updated.
   * This reloads the list of lifts to reflect the latest changes.
   */
  const handleLiftsUpdated = () => {
    loadLifts();
  };

  /**
   * Callback function to update the currently selected training cycle.
   * @param {string} cycle - The name of the selected training cycle.
   */
  const handleSelectCycle = (cycle) => {
    setSelectedCycle(cycle);
  };

  /**
   * useEffect hook to initialize the database and load lifts when the component mounts.
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDb();
        console.log("Database initialized successfully, now loading lifts...");
      } catch (initError) {
        console.error("Failed to initialize database:", initError);
        Alert.alert("Initialization Failed", `Failed to set up the app: ${initError.message}. Please restart the app.`);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await loadLifts();
        console.log("Lifts loaded successfully!");
      } catch (loadError) {
        console.error("Error during initial lifts loading:", loadError);
        Alert.alert("Lifts Loading Failed", loadError.message);
      } finally {
        setIsLoading(false); 
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primaryRed} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.headerText }]}>531 Strength Tracker</Text>

      <View style={[styles.unitToggleContainer, { backgroundColor: colors.unitToggleBackground }]}>
        <Text style={[styles.unitLabel, { color: colors.text }]}>Units:</Text>
        <Text style={[styles.unitText, { color: colors.unitToggleInactive }, !isKg && { color: colors.unitToggleActive }]}>LBS</Text>
        <Switch
          trackColor={{ false: colors.unitToggleInactive, true: colors.unitToggleActive }}
          thumbColor={isKg ? colors.primaryRed : colors.unitToggleInactive}
          ios_backgroundColor={colors.unitToggleInactive}
          onValueChange={toggleUnit}
          value={isKg}
        />
        <Text style={[styles.unitText, { color: colors.unitToggleInactive }, isKg && { color: colors.unitToggleActive }]}>KG</Text>
      </View>

      {/*
       * Component for adding new lifts.
       * @param {function} onLiftAdded - Callback function to refresh lifts after adding.
       * @param {object} colors - Theme colors for styling.
       */}
      <AddLiftButton onLiftAdded={handleLiftsUpdated} colors={colors} />

      {/*
       * Component for displaying the list of lifts and their calculated weights.
       * @param {Array<TrackingLift>} lifts - Array of lift objects to display.
       * @param {boolean} isKg - Boolean indicating if weights should be displayed in kilograms.
       * @param {object} colors - Theme colors for styling.
       * @param {function} onLiftsUpdated - Callback function to refresh lifts after an update.
       * @param {string} selectedCycle - The currently selected training cycle.
       * @param {function} onSelectCycle - Callback to update the selected training cycle.
       */}
      <CalculateWeights // Renamed from CalculateWeights
        lifts={lifts}
        isKg={isKg}
        colors={colors}
        onLiftsUpdated={handleLiftsUpdated}
        selectedCycle={selectedCycle}
        onSelectCycle={handleSelectCycle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 25,
    fontSize: 16,
    lineHeight: 22,
  },
  subHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  unitLabel: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
});
