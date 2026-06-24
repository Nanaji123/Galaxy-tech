import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

export interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  description?: string;
  author?: {
    username: string;
    avatar: string;
  };
}

interface ReelItemProps {
  reel: Reel;
  isVisible: boolean;
  onLikePress: (reelId: string, currentLikedState: boolean) => void;
  itemHeight: number;
  isOffline: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const ReelItem: React.FC<ReelItemProps> = ({
  reel,
  isVisible,
  onLikePress,
  itemHeight,
  isOffline,
}) => {
  const [isPaused, setIsPaused] = useState(!isVisible);
  const [localLiked, setLocalLiked] = useState(reel.isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(reel.likesCount || 0);
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    setLocalLiked(reel.isLiked);
    setLocalLikesCount(reel.likesCount || 0);
  }, [reel.isLiked, reel.likesCount]);

  useEffect(() => {
    if (!isOffline) {
      setVideoKey(prev => prev + 1);
    }
  }, [isOffline]);

  useEffect(() => {
    setIsPaused(!isVisible);
  }, [isVisible]);

  const handlePressLike = () => {
    const newLikedState = !localLiked;
    setLocalLiked(newLikedState);
    setLocalLikesCount(prev =>
      newLikedState ? prev + 1 : Math.max(0, prev - 1),
    );
    onLikePress(reel.id, localLiked);
  };

  return (
    <View style={[styles.container, {height: itemHeight}]}>
      <Video
        key={videoKey}
        source={{uri: reel.videoUrl}}
        style={styles.video}
        resizeMode="cover"
        repeat={true}
        paused={isPaused}
        playInBackground={false}
        playWhenInactive={false}
        poster={reel.thumbnailUrl}
        posterResizeMode="cover"
      />

      <View style={styles.overlay}>
        <View style={styles.bottomSection}>
          <View style={styles.authorContainer}>
            {reel.author?.avatar ? (
              <Image
                source={{uri: reel.author.avatar}}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="account" size={24} color="white" />
              </View>
            )}
            <Text style={styles.author}>
              {reel.author?.username || 'User'}
            </Text>
          </View>
          {reel.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {reel.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.sideSection}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePressLike}>
            <Icon
              name={localLiked ? 'heart' : 'heart-outline'}
              size={36}
              color={localLiked ? '#e74c3c' : 'white'}
            />
            <Text style={styles.iconText}>
              {formatNumber(localLikesCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Icon name="comment-outline" size={34} color="white" />
            <Text style={styles.iconText}>
              {formatNumber(reel.commentsCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Icon name="eye-outline" size={34} color="white" />
            <Text style={styles.iconText}>
              {formatNumber(reel.viewsCount)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: 'black',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  bottomSection: {
    flex: 1,
    marginRight: 20,
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  author: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  sideSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  iconButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: 'white',
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ReelItem;
