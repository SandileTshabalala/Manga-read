import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface Chapter {
  id: string;
  chapter: string;
  title: string | null;
  publishAt: string;
  pages: number;
  scanlationGroup?: {
    id: string;
    name: string;
  };
}

interface Manga {
  id: string;
  title: string;
  image: string;
  description: string;
  status: string;
  year: number;
  contentRating: string;
  tags: string[];
  authors: string[];
  artists: string[];
  originalLanguage: string;
  publicationDemographic: string;
  chapters: Chapter[];
}

const MANGADEX_API = 'https://api.mangadex.org';

export default function MangaDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMangaDetails();
  }, [id]);

  const fetchMangaDetails = async () => {
    try {
      setLoading(true);
      
      // Get manga details
      const params = {
        'includes[]': ['cover_art', 'author', 'artist']
      };
      const response = await axios.get(`${MANGADEX_API}/manga/${id}`, { params });
      const data = response.data.data;
      const attributes = data.attributes;

      // Get cover art filename and creators
      let coverFilename = null;
      const authors: string[] = [];
      const artists: string[] = [];
      
      for (const relationship of data.relationships) {
        if (relationship.type === 'cover_art') {
          coverFilename = relationship.attributes.fileName;
        } else if (relationship.type === 'author') {
          authors.push(relationship.attributes.name);
        } else if (relationship.type === 'artist') {
          artists.push(relationship.attributes.name);
        }
      }

      // Get chapter list
      const chapterParams = {
        'manga': id,
        'translatedLanguage[]': ['en'],
        'order[chapter]': 'asc',
        'limit': 100,
        'includes[]': ['scanlation_group']
      };
      const chaptersResponse = await axios.get(`${MANGADEX_API}/chapter`, { params: chapterParams });
      const chapters = chaptersResponse.data.data.map((chapter: any) => {
        const scanlationGroup = chapter.relationships.find(
          (rel: any) => rel.type === 'scanlation_group'
        );

        return {
          id: chapter.id,
          chapter: chapter.attributes.chapter,
          title: chapter.attributes.title,
          pages: chapter.attributes.pages,
          publishAt: chapter.attributes.publishAt,
          scanlationGroup: scanlationGroup ? {
            id: scanlationGroup.id,
            name: scanlationGroup.attributes.name,
          } : undefined,
        };
      });

      // Construct manga object
      const mangaData: Manga = {
        id: data.id,
        title: attributes.title.en || Object.values(attributes.title)[0],
        image: `https://uploads.mangadex.org/covers/${data.id}/${coverFilename}`,
        description: attributes.description.en || Object.values(attributes.description)[0],
        status: attributes.status,
        year: attributes.year,
        contentRating: attributes.contentRating,
        tags: attributes.tags.map((tag: any) => tag.attributes.name.en),
        authors,
        artists,
        originalLanguage: attributes.originalLanguage,
        publicationDemographic: attributes.publicationDemographic,
        chapters
      };

      setManga(mangaData);
      setError(null);
    } catch (err) {
      console.error('Error fetching manga details:', err);
      setError('Failed to load manga details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  if (!manga) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Manga not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Image source={{ uri: manga.image }} style={styles.coverImage} />
      <View style={styles.content}>
        <Text style={styles.title}>{manga.title}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{manga.status}</Text>
          </View>
          {manga.year && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Year</Text>
              <Text style={styles.metaValue}>{manga.year}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Language</Text>
            <Text style={styles.metaValue}>{manga.originalLanguage}</Text>
          </View>
          {manga.publicationDemographic && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Demographic</Text>
              <Text style={styles.metaValue}>{manga.publicationDemographic}</Text>
            </View>
          )}
        </View>

        <View style={styles.credits}>
          {manga.authors.length > 0 && (
            <View style={styles.creditSection}>
              <Text style={styles.creditLabel}>Author{manga.authors.length > 1 ? 's' : ''}</Text>
              <Text style={styles.creditValue}>{manga.authors.join(', ')}</Text>
            </View>
          )}
          {manga.artists.length > 0 && (
            <View style={styles.creditSection}>
              <Text style={styles.creditLabel}>Artist{manga.artists.length > 1 ? 's' : ''}</Text>
              <Text style={styles.creditValue}>{manga.artists.join(', ')}</Text>
            </View>
          )}
        </View>

        <View style={styles.tagsContainer}>
          {manga.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.description}>{manga.description}</Text>

        <Text style={styles.sectionTitle}>Chapters</Text>
        <View style={styles.chapterList}>
          {manga.chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={{
                pathname: "/(screens)/read/[chapterId]",
                params: { chapterId: chapter.id }
              }}
              asChild
            >
              <TouchableOpacity style={styles.chapterItem}>
                <View>
                  <Text style={styles.chapterTitle}>
                    Chapter {chapter.chapter}: {chapter.title || 'No Title'}
                  </Text>
                  <Text style={styles.chapterMeta}>
                    {new Date(chapter.publishAt).toLocaleDateString()} • {chapter.pages} pages
                    {chapter.scanlationGroup && ` • Scanlated by ${chapter.scanlationGroup.name}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#888888" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <View style={styles.attribution}>
          <Text style={styles.attributionText}>Powered by MangaDex</Text>
        </View>
      </View>
    </ScrollView>
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
  coverImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  metaInfo: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    color: '#888888',
    fontSize: 14,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  credits: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  creditSection: {
    marginBottom: 8,
  },
  creditLabel: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 4,
  },
  creditValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 24,
  },
  chapterList: {
    marginBottom: 24,
  },
  chapterItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  chapterTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chapterMeta: {
    color: '#888888',
    fontSize: 14,
  },
  attribution: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  attributionText: {
    color: '#888888',
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
});
