import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MangaLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        headerTitleStyle: {
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="homescreen"
        options={{
          title: 'Manga Reader',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
      <Stack.Screen
        name="details/[id]"
        options={{
          title: 'Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="read/[chapterId]"
        options={{
          title: 'Read',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
