import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle, Modal, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Calendar, X, Check } from 'lucide-react-native';

interface DatePickerInputProps {
  value: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  style?: ViewStyle;
}

export default function DatePickerInput({ 
  value, 
  onDateChange, 
  placeholder = "Select Date", 
  minimumDate = new Date(),
  style 
}: DatePickerInputProps) {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(300))[0];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDone = () => {
    onDateChange(tempDate);
    closeModal();
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    closeModal();
  };

  const openModal = () => {
    setTempDate(value || new Date());
    setShowDatePicker(true);
    
    // Animate modal entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    // Animate modal exit
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDatePicker(false);
    });
  };

  const formatDate = (date: Date): string => {
    if (!date) return '';
    const day = date.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const isDateSelected = value && value.toDateString() !== new Date().toDateString();

  return (
    <View>
      <TouchableOpacity
        style={[styles.input, style]}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <View style={styles.inputContent}>
          <Calendar size={18} color={isDateSelected ? '#fff' : 'rgba(255,255,255,0.4)'} />
          <Text style={[styles.dateText, isDateSelected ? styles.dateTextSelected : styles.dateTextPlaceholder]}>
            {isDateSelected ? formatDate(value) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>
      
      {showDatePicker && (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
        >
          <Animated.View 
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.backdropArea}
              activeOpacity={1}
              onPress={handleCancel}
            />
            <Animated.View 
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              <LinearGradient
                colors={['#1a1a3e', '#16213e']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    onPress={handleCancel}
                    style={styles.headerButton}
                  >
                    <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                      <X size={20} color="#ef4444" />
                    </BlurView>
                  </TouchableOpacity>
                  
                  <Text style={styles.modalTitle}>Select Date</Text>
                  
                  <TouchableOpacity 
                    onPress={handleDone}
                    style={styles.headerButton}
                  >
                    <BlurView intensity={30} tint="dark" style={styles.headerButtonBlur}>
                      <Check size={20} color="#10b981" />
                    </BlurView>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.selectedDatePreview}>
                  <Text style={styles.selectedDateText}>{formatDate(tempDate)}</Text>
                </View>
                
                <View style={styles.pickerWrapper}>
                  <BlurView intensity={20} tint="dark" style={styles.pickerBlur}>
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        minimumDate={minimumDate}
                        style={styles.datePicker}
                        textColor="#ffffff"
                        locale="en"
                        themeVariant="dark"
                      />
                    </View>
                  </BlurView>
                </View>
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  dateTextPlaceholder: {
    color: 'rgba(255,255,255,0.3)',
  },
  dateTextSelected: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropArea: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  modalGradient: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  selectedDatePreview: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a855f7',
  },
  pickerWrapper: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pickerBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    height: 200,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  datePicker: {
    width: Platform.OS === 'ios' ? 320 : '100%',
    height: '100%',
  },
});