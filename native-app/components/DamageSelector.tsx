
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export interface Damage {
  id: string;
  side: 'front' | 'back' | 'left' | 'right';
  x: number;
  y: number;
  reason: string;
  location: string;
  photoUrl?: string;
}

interface Props {
  viewImages: Record<string, string>;
  damages: Damage[];
  onAddDamage: (damage: Damage) => void;
  onRemoveDamage: (id: string) => void;
  activeSide: 'front' | 'back' | 'left' | 'right';
}

const DamageSelector = ({ viewImages, damages, onAddDamage, onRemoveDamage, activeSide }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentClick, setCurrentClick] = useState<{ x: number; y: number } | null>(null);
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  const handlePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    // We'll need the dimensions of the image container to calculate percentages
    // For now, let's assume a fixed aspect ratio or get layout on the fly
    setCurrentClick({ x: locationX, y: locationY });
    setModalVisible(true);
  };

  const takeDamagePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung', 'Kamerazugriff erforderlich.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0].uri) {
      setTempPhoto(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!reason || !location || !currentClick) {
      Alert.alert('Hinweis', 'Bitte füllen Sie alle Felder aus.');
      return;
    }

    onAddDamage({
      id: Math.random().toString(36).substring(7),
      side: activeSide,
      x: currentClick.x, // Note: This should ideally be percentage
      y: currentClick.y,
      reason,
      location,
      photoUrl: tempPhoto || undefined,
    });

    setModalVisible(false);
    setReason('');
    setLocation('');
    setTempPhoto(null);
    setCurrentClick(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handlePress} 
        style={styles.imageContainer}
      >
        <Image 
          source={{ uri: viewImages[activeSide] || 'https://via.placeholder.com/400x200?text=Car+Side' }} 
          style={styles.carImage} 
          resizeMode="contain"
        />
        
        {/* Render Damage Markers */}
        {damages.filter(d => d.side === activeSide).map(d => (
          <View 
            key={d.id} 
            style={[styles.marker, { left: d.x - 10, top: d.y - 10 }]} 
          >
            <View style={styles.markerInner}>
              <Ionicons name="alert-circle" size={12} color="#fff" />
            </View>
          </View>
        ))}
      </TouchableOpacity>

      <Text style={styles.hint}>Tippen Sie auf das Bild, um einen Schaden zu markieren.</Text>

      {/* Damage List Summary */}
      <View style={styles.damageList}>
        {damages.filter(d => d.side === activeSide).map(d => (
          <View key={d.id} style={styles.damageItem}>
            <View style={styles.damageInfo}>
              <Text style={styles.damageReason}>{d.reason}</Text>
              <Text style={styles.damageLocation}>{d.location}</Text>
            </View>
            <TouchableOpacity onPress={() => onRemoveDamage(d.id)}>
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schaden hinzufügen</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Art des Schadens</Text>
              <View style={styles.chipRow}>
                {['Kratzer', 'Delle', 'Riss', 'Steinschlag', 'Sonstiges'].map(r => (
                  <TouchableOpacity 
                    key={r} 
                    onPress={() => setReason(r)}
                    style={[styles.chip, reason === r && styles.activeChip]}
                  >
                    <Text style={[styles.chipText, reason === r && styles.activeChipText]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Genaue Position</Text>
              <TextInput 
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="z.B. Stoßstange vorne links"
              />

              <Text style={styles.label}>Foto vom Schaden</Text>
              <TouchableOpacity style={styles.photoBtn} onPress={takeDamagePhoto}>
                {tempPhoto ? (
                  <Image source={{ uri: tempPhoto }} style={styles.photoPreview} />
                ) : (
                  <>
                    <Ionicons name="camera" size={32} color="#999" />
                    <Text style={styles.photoBtnText}>Klicken zum Fotografieren</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>HINZUFÜGEN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DamageSelector;

const styles = StyleSheet.create({
  container: { width: '100%' },
  imageContainer: { 
    width: '100%', 
    height: 200, 
    backgroundColor: '#f5f5f5', 
    borderRadius: 16, 
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  carImage: { width: '100%', height: '100%' },
  marker: { position: 'absolute', zIndex: 10 },
  markerInner: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: '#ef4444', 
    borderWidth: 2, 
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
  damageList: { marginTop: 20, gap: 10 },
  damageItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  damageInfo: { flex: 1 },
  damageReason: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  damageLocation: { fontSize: 12, color: '#666' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  activeChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 12, color: '#666' },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: '#f9f9f9' },
  photoBtn: { width: '100%', height: 120, borderWidth: 2, borderStyle: 'dashed', borderColor: '#eee', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10, overflow: 'hidden' },
  photoBtnText: { fontSize: 12, color: '#999', marginTop: 4 },
  photoPreview: { width: '100%', height: '100%' },
  saveBtn: { backgroundColor: '#2563eb', margin: 20, padding: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
