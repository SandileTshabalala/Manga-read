import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface Manga {
  id: string;
  title: string;
  image: string;
  description: string;
  status: string;
  year: number;
  contentRating: string;
  tags: string[];
}

const MANGADEX_API = 'https://api.mangadex.org';

export default function HomeScreen() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMangaList();
  }, []);

  const fetchMangaList = async () => {
    try {
      // Get trending manga from MangaDex API
      const params = {
        limit: 20,
        'order[rating]': 'desc',
        'includes[]': ['cover_art'],
        'contentRating[]': ['safe', 'suggestive'],
        hasAvailableChapters: true
      };
      const response = await axios.get(`${MANGADEX_API}/manga`, { params });
      const data = response.data;
      
      // Transform the data for our UI
      const transformedData = data.data.map((item: any) => {
        const attributes = item.attributes;
        // Get cover art filename
        let coverFilename = null;
        for (const relationship of item.relationships) {
          if (relationship.type === 'cover_art') {
            coverFilename = relationship.attributes.fileName;
            break;
          }
        }
        
        // Construct cover image URL
        const coverUrl = `https://uploads.mangadex.org/covers/${item.id}/${coverFilename}`;
        
        return {
          id: item.id,
          title: attributes.title.en || Object.values(attributes.title)[0],
          image: coverUrl,
          description: attributes.description.en || Object.values(attributes.description)[0],
          status: attributes.status,
          year: attributes.year,
          contentRating: attributes.contentRating,
          tags: attributes.tags.map((tag: any) => tag.attributes.name.en)
        };
      });

      setMangaList(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching manga list:', err);
      setError('Failed to load manga list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderMangaCard = ({ item }: { item: Manga }) => (
    <Link href={`/(screens)/details/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardStatus}>{item.status}</Text>
            {item.year && <Text style={styles.cardYear}>{item.year}</Text>}
          </View>
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4081" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Popular Manga</Text>
          <Link href="/(screens)/search" asChild>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <FlatList
        data={mangaList}
        renderItem={renderMangaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF4081',
    fontSize: 16,
    textAlign: 'center',
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchButton: {
    padding: 8,
  },
  listContainer: {
    padding: 8,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardStatus: {
    color: '#FF4081',
    fontSize: 14,
    textTransform: 'capitalize',
    marginRight: 8,
  },
  cardYear: {
    color: '#888888',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});
