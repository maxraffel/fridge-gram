import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Share,
  Platform,
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FridgeCard } from '../../components/Feed/FridgeCard';
import { Fridge } from '../../components/Feed/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeProvider';

export default function FridgeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [fridge, setFridge] = useState<Fridge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();
  
  useEffect(() => {
    const fetchFridge = async () => {
      if (!id || Array.isArray(id)) {
        setError('Invalid fridge ID');
        setLoading(false);
        return;
      }
      
      try {
        const fridgeRef = doc(db, 'fridges', id);
        const fridgeDoc = await getDoc(fridgeRef);
        
        if (fridgeDoc.exists()) {
          setFridge({ id: fridgeDoc.id, ...fridgeDoc.data() } as Fridge);
        } else {
          setError('Fridge not found');
        }
      } catch (err) {
        console.error('Error fetching fridge:', err);
        setError('Could not load fridge data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFridge();
  }, [id]);
  
  const handleShare = async () => {
    if (!fridge) return;
    
    // Create a shareable URL for this fridge
    // This would depend on your app's domain configuration
    const shareUrl = `localhost:8081/fridge/${fridge.id}`;
    
    try {
      if (Platform.OS === 'ios') {
        await Share.share({
          url: shareUrl,
          message: '',
          title: 'Check out this fridge on FridgeGram',
        });
      } else {
        await Share.share({
          message: `: ${shareUrl}`,
          title: 'Check out this fridge on FridgeGram',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Fridge Details',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading fridge...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.goBackButton} 
            onPress={() => router.replace('/dashboard')}
          >
            <Text style={styles.goBackText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      ) : fridge ? (
        <View style={styles.fridgeContainer}>
          <FridgeCard fridge={fridge} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#E11D48',
    marginBottom: 24,
  },
  fridgeContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
  goBackButton: {
    backgroundColor: '#247BA0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  goBackText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});