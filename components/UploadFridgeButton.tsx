import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { firebase } from '../firebaseConfig';
import { useAuth } from './AuthProvider';
import { updateUserPostStreak } from './Feed/helpers/updateUserPostStreak';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UploadFridgeButton() {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [selectedImageURI, setSelectedImageURI] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const modalY = useRef(new Animated.Value(1000)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  
  const db = getFirestore(firebase);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  const showModal = () => {
    setModalVisible(true);
    Animated.spring(modalY, {
      toValue: 0,
      velocity: 3,
      tension: 55,
      friction: 11,
      useNativeDriver: true
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalY, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true
    }).start(() => setModalVisible(false));
  };

  const animateSuccess = () => {
    successOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.delay(1000),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      hideModal();
      setSuccess(false);
    });
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset);
        setSelectedImageURI(asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to select image. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!user) {
      setError('You must be signed in to upload a fridge image.');
      return;
    }

    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload image to Firebase Storage
      const storage = getStorage(firebase);
      const timestamp = Date.now();
      const fileName = selectedImage.name;
      const storageRef = ref(storage, `fridges/${user.uid}/${timestamp}_${fileName}`);
      
      // Convert image to blob
      const response = await fetch(selectedImageURI);
      const blob = await response.blob();
      
      // Upload blob to Firebase Storage
      const uploadTask = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Create new fridge document in Firestore
      await addDoc(collection(db, 'fridges'), {
        owner: user.uid,
        imageUrl: downloadURL,
        description: description.trim(),
        averageRating: 0,
        ratingsCount: 0,
        createdAt: Timestamp.now()
      });

      // Update the user's posting streak
      const newStreak = await updateUserPostStreak(user.uid);
      console.log(`Updated user streak: ${newStreak}`);

      // Reset form and show success
      setSuccess(true);
      setDescription('');
      setSelectedImage(null);
      setSelectedImageURI('');
      
      // Animate success message and close modal
      animateSuccess();
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => {
        animateButton();
        setTimeout(showModal, 100);
      }}>
        <Animated.View 
          style={[
            styles.uploadButton,
            {transform: [{ scale: buttonScale }]}
          ]}
        >
          <MaterialCommunityIcons name="fridge" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.uploadButtonText}>Share Your Fridge</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
      
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalView,
                {transform: [{ translateY: modalY }]}
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Share Your Fridge</Text>
                <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                {selectedImageURI ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: selectedImageURI }} 
                      style={styles.imagePreview} 
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      onPress={pickImage} 
                      style={styles.changeImageButton}
                    >
                      <Text style={styles.changeImageText}>Change Photo</Text>
                      <Ionicons name="camera" size={18} color="#FFFFFF" style={{marginLeft: 6}} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.imagePicker} 
                    onPress={pickImage}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imagePickerInner}>
                      <MaterialCommunityIcons name="fridge-outline" size={42} color="#A0D1E6" />
                      <Text style={styles.imagePickerText}>Tap to select a photo</Text>
                      <View style={styles.uploadIconContainer}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#A0D1E6" />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What's in your fridge today?"
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={200}
                  />
                  <Text style={styles.charCount}>
                    {description.length}/200
                  </Text>
                </View>
                
                {error ? 
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#E11D48" style={{marginRight: 6}} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View> 
                : null}
                
                <Animated.View 
                  style={[
                    styles.successContainer,
                    {opacity: successOpacity}
                  ]}
                >
                  <View style={styles.successInner}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                    <Text style={styles.successText}>Upload Successful!</Text>
                  </View>
                  {success && (
                    <View style={styles.confettiContainer}>
                      {/* Imagine confetti animation here */}
                    </View>
                  )}
                </Animated.View>
                
                {!success && (
                  <View style={styles.buttonContainer}>
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#A0D1E6" />
                        <Text style={styles.loadingText}>Uploading...</Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.button, styles.buttonCancel]}
                          onPress={hideModal}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.buttonTextCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.button, 
                            styles.buttonUpload,
                            !selectedImage && styles.buttonDisabled
                          ]}
                          onPress={handleUpload}
                          disabled={!selectedImage}
                          activeOpacity={0.8}
                        >
                          <Text style={[
                            styles.buttonText,
                            !selectedImage && styles.buttonTextDisabled
                          ]}>
                            Share Fridge
                          </Text>
                          <Ionicons name="arrow-forward" size={16} color={selectedImage ? "white" : "#9CA3AF"} style={{marginLeft: 8}} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Color palette
const colors = {
  primary: '#247BA0',       // Cool blue
  secondary: '#A0D1E6',     // Light blue
  accent: '#F3B61F',        // Fridge light yellow
  background: '#F8FAFC',    // Almost white
  steel: '#E7EDF3',         // Stainless steel
  steelDark: '#C7D2DD',     // Darker steel
  text: '#334155',          // Dark blue-gray
  textLight: '#64748B',     // Light text
  success: '#10B981',       // Green
  error: '#E11D48',         // Red
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0, 0, 0, 0.08)'
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Slide up from bottom
  },
  modalView: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.steel,
    backgroundColor: colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 6,
  },
  modalContent: {
    padding: 20,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePreview: {
    width: '100%',
    height: width * 0.6,
    borderRadius: 16,
    backgroundColor: colors.steel,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  imagePicker: {
    width: '100%',
    height: width * 0.6,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  imagePickerInner: {
    flex: 1,
    backgroundColor: colors.steel,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.steelDark,
    borderStyle: 'dashed',
    padding: 24,
  },
  imagePickerText: {
    color: colors.textLight,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  uploadIconContainer: {
    backgroundColor: 'rgba(160, 209, 230, 0.2)',
    padding: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.steel,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: colors.textLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.success,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: '45%',
  },
  buttonUpload: {
    backgroundColor: colors.primary,
    flex: 1,
    marginLeft: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.steel,
  },
  buttonDisabled: {
    backgroundColor: colors.steel,
    shadowOpacity: 0,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: colors.textLight,
  },
  buttonTextCancel: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 16,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: colors.textLight,
    marginTop: 12,
    fontSize: 16,
  }
});