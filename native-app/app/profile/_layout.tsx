import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="edit" options={{ headerTitle: 'Profil bearbeiten' }} />
      <Stack.Screen name="password" options={{ headerTitle: 'Passwort ändern' }} />
      <Stack.Screen name="documents" options={{ headerTitle: 'Meine Dokumente' }} />
    </Stack>
  );
}
