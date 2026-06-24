import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import ReelItem, {Reel} from '../components/ReelItem';
import {getReels} from '../services/api';
import {
  cacheReels,
  getCachedReels,
  addPendingAction,
  syncPendingActions,
  updateCachedReelLike,
} from '../services/offlineSync';

const ReelFeedScreen = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [visibleReelId, setVisibleReelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [listHeight, setListHeight] = useState(
    Dimensions.get('window').height,
  );
  const [hasError, setHasError] = useState(false);

  const isLoadingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const nowOnline = !!state.isConnected;
      setIsOffline(!nowOnline);

      if (wasOffline && nowOnline) {
        console.log('Network restored — syncing pending actions');
        syncPendingActions();
      }
    });

    syncPendingActions();
    fetchReels();

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchReels = async (cursor?: string) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (cursor) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }
    setHasError(false);

    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    if (!isConnected) {
      if (!cursor) {
        const cached = await getCachedReels();
        if (cached && cached.length > 0) {
          setReels(cached);
          setVisibleReelId(cached[0].id);
        }
      }
      setIsLoading(false);
      setIsFetchingMore(false);
      isLoadingRef.current = false;
      return;
    }

    try {
      const data = await getReels(cursor);

      const newReels =
        data?.result?.data?.reels ||
        data?.reels ||
        data?.result?.data?.items ||
        data?.items ||
        [];
      const returnedCursor =
        data?.result?.data?.nextCursor || data?.nextCursor || null;

      const mappedReels: Reel[] = newReels.map((item: any) => {
        const videoUrl =
          item.videos?.[0] ||
          item.videoUrl ||
          item.url ||
          item.video?.url ||
          item.mediaUrl ||
          '';
        const thumbnailUrl =
          item.videoThumbnail ||
          item.videoPlayback?.[0]?.thumbnailUrl ||
          '';

        return {
          id: item.id || Math.random().toString(),
          videoUrl,
          thumbnailUrl,
          likesCount: item.likesCount || item.likes || 0,
          commentsCount: item.comments || 0,
          viewsCount: item.views || 0,
          isLiked: item.isLiked || false,
          description: item.description || item.caption || '',
          author: {
            username:
              item.authorUsername || item.authorName || item.author || 'User',
            avatar: item.authorImage || '',
          },
        };
      });

      const allReels = cursor ? [...reels, ...mappedReels] : mappedReels;
      setReels(allReels);
      setNextCursor(returnedCursor);
      cacheReels(allReels);

      if (!cursor && allReels.length > 0) {
        setVisibleReelId(allReels[0].id);
      }
    } catch (error) {
      console.error('Fetch Reels Error:', error);
      setHasError(true);
      if (!cursor) {
        const cached = await getCachedReels();
        if (cached && cached.length > 0) {
          setReels(cached);
          setVisibleReelId(cached[0].id);
        }
      }
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      isLoadingRef.current = false;
    }
  };

  const handleEndReached = () => {
    if (nextCursor && !isOffline && !isLoadingRef.current) {
      fetchReels(nextCursor);
    }
  };

  const handleLikePress = async (
    reelId: string,
    currentLikedState: boolean,
  ) => {
    const actionType = currentLikedState ? 'UNLIKE' : 'LIKE';
    const newLikedState = !currentLikedState;
    const delta = newLikedState ? 1 : -1;

    setReels(prevReels =>
      prevReels.map(r => {
        if (r.id === reelId) {
          const newCount = Math.max(0, r.likesCount + delta);
          updateCachedReelLike(reelId, newLikedState, newCount);
          return {
            ...r,
            isLiked: newLikedState,
            likesCount: newCount,
          };
        }
        return r;
      }),
    );

    await addPendingAction({type: actionType, postId: reelId});

    if (!isOffline) {
      syncPendingActions();
    }
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setVisibleReelId(viewableItems[0].item.id);
    }
  }).current;

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: listHeight,
      offset: listHeight * index,
      index,
    }),
    [listHeight],
  );

  if (isLoading && reels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.statusText}>Loading Reels...</Text>
      </View>
    );
  }

  if (hasError && reels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.statusText}>Something went wrong</Text>
        <Text style={styles.retryText} onPress={() => fetchReels()}>
          Tap to Retry
        </Text>
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>No Reels Found</Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={[styles.footerLoader, {height: listHeight * 0.15}]}>
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  };

  return (
    <View
      style={styles.container}
      onLayout={e => setListHeight(e.nativeEvent.layout.height)}>
      <FlatList
        data={reels}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ReelItem
            reel={item}
            isVisible={item.id === visibleReelId}
            onLikePress={handleLikePress}
            itemHeight={listHeight}
            isOffline={isOffline}
          />
        )}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        windowSize={15}
        initialNumToRender={7}
        maxToRenderPerBatch={7}
        getItemLayout={getItemLayout}
        snapToInterval={listHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 48,
  },
  retryText: {
    color: '#4da6ff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  footerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReelFeedScreen;
