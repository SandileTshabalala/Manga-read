import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        title: searchQuery,
        limit: 20,
        'includes[]': ['cover_art'],
        'contentRating[]': ['safe', 'suggestive'],
        order: { relevance: 'desc' },
      };

      const response = await axios.get(`${MANGADEX_API}/manga`, { params });
      const data = response.data;

      const transformedData = data.data.map((item: any) => {
        const attributes = item.attributes;
        let coverFilename = null;
        for (const relationship of item.relationships) {
          if (relationship.type === 'cover_art') {
            coverFilename = relationship.attributes.fileName;
            break;
          }
        }

        const coverUrl = `https://uploads.mangadex.org/covers/${item.id}/${coverFilename}`;

        return {
          id: item.id,
          title: attributes.title.en || Object.values(attributes.title)[0],
          image: coverUrl,
          description: attributes.description.en || Object.values(attributes.description)[0],
          status: attributes.status,
          year: attributes.year,
          contentRating: attributes.contentRating,
          tags: attributes.tags.map((tag: any) => tag.attributes.name.en),
        };
      });

      setSearchResults(transformedData);
    } catch (err) {
      console.error('Error searching manga:', err);
      setError('Failed to search manga. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderMangaCard = ({ item }: { item: Manga }) => (
    <Link href={`/(screens)/details/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
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
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search manga..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4081" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderMangaCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#888888" />
          <Text style={styles.emptyText}>
            {searchQuery.length > 0
              ? 'No results found'
              : 'Search for your favorite manga'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF4081',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
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
});
