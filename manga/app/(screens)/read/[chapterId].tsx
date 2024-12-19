import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const MANGADEX_API = 'https://api.mangadex.org';

interface ChapterData {
  hash: string;
  data: string[];
  dataSaver: string[];
  scanlationGroup?: {
    id: string;
    name: string;
  };
}

export default function ReadScreen() {
  const { chapterId } = useLocalSearchParams();
  const router = useRouter();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchChapterData();
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      // Get chapter data with scanlation group info
      const chapterResponse = await axios.get(
        `${MANGADEX_API}/chapter/${chapterId}?includes[]=scanlation_group`
      );
      
      const chapterInfo = chapterResponse.data.data;
      const scanlationGroup = chapterInfo.relationships.find(
        (rel: any) => rel.type === 'scanlation_group'
      );

      // Get chapter pages
      const atHomeResponse = await axios.get(
        `${MANGADEX_API}/at-home/server/${chapterId}`
      );

      setChapterData({
        hash: atHomeResponse.data.chapter.hash,
        data: atHomeResponse.data.chapter.data,
        dataSaver: atHomeResponse.data.chapter.dataSaver,
        scanlationGroup: scanlationGroup ? {
          id: scanlationGroup.id,
          name: scanlationGroup.attributes.name,
        } : undefined,
      });
    } catch (err) {
      console.error('Error fetching chapter:', err);
      setError('Failed to load chapter. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = ({ item, index }: { item: string; index: number }) => {
    const imageUrl = `https://uploads.mangadex.org/data/${chapterData?.hash}/${item}`;

    return (
      <View style={styles.pageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.pageImage}
          resizeMode="contain"
        />
        <View style={styles.pageInfo}>
          <Text style={styles.pageNumber}>
            {index + 1} / {chapterData?.data.length}
          </Text>
          {chapterData?.scanlationGroup && (
            <Text style={styles.scanlationCredit}>
              Scanlated by {chapterData.scanlationGroup.name}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF4081" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchChapterData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {chapterData && (
        <FlatList
          data={chapterData.data}
          renderItem={renderPage}
          keyExtractor={(item, index) => `page-${index}`}
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newPage = Math.round(
              e.nativeEvent.contentOffset.x / Dimensions.get('window').width
            );
            setCurrentPage(newPage);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  backButton: {
    padding: 8,
  },
  pageContainer: {
    width: Dimensions.get('window').width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageImage: {
    width: '100%',
    height: '90%',
  },
  pageInfo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  pageNumber: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  scanlationCredit: {
    color: '#FF4081',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF4081',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
