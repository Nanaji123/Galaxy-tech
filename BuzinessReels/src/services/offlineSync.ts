import AsyncStorage from '@react-native-async-storage/async-storage';
import {toggleLike} from './api';

const PENDING_ACTIONS_KEY = '@pending_actions';
const CACHED_REELS_KEY = '@cached_reels';

export interface PendingAction {
  id: string;
  type: 'LIKE' | 'UNLIKE';
  postId: string;
  timestamp: number;
}

export const cacheReels = async (reels: any[]) => {
  try {
    await AsyncStorage.setItem(CACHED_REELS_KEY, JSON.stringify(reels));
  } catch (error) {
    console.error('Failed to cache reels', error);
  }
};

export const getCachedReels = async (): Promise<any[] | null> => {
  try {
    const data = await AsyncStorage.getItem(CACHED_REELS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get cached reels', error);
    return null;
  }
};

export const updateCachedReelLike = async (
  reelId: string,
  isLiked: boolean,
  likesCount: number,
) => {
  try {
    const cached = await getCachedReels();
    if (!cached) return;
    const updated = cached.map((reel: any) => {
      if (reel.id === reelId) {
        return {...reel, isLiked, likesCount};
      }
      return reel;
    });
    await cacheReels(updated);
  } catch (error) {
    console.error('Failed to update cached reel like', error);
  }
};

export const addPendingAction = async (
  action: Omit<PendingAction, 'id' | 'timestamp'>,
) => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    const actions: PendingAction[] = existing ? JSON.parse(existing) : [];

    const filtered = actions.filter(a => a.postId !== action.postId);

    const newAction: PendingAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
    };

    filtered.push(newAction);
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to add pending action', error);
  }
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  try {
    const data = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get pending actions', error);
    return [];
  }
};

export const syncPendingActions = async (): Promise<void> => {
  try {
    const existing = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    if (!existing) return;

    const actions: PendingAction[] = JSON.parse(existing);
    if (actions.length === 0) return;

    console.log(`Syncing ${actions.length} pending action(s)...`);

    const remainingActions: PendingAction[] = [];

    for (const action of actions) {
      try {
        await toggleLike(action.postId);
        console.log(`Synced action: ${action.type} on post ${action.postId}`);
      } catch (error) {
        console.error('Failed to sync action', action.postId, error);
        remainingActions.push(action);
      }
    }

    await AsyncStorage.setItem(
      PENDING_ACTIONS_KEY,
      JSON.stringify(remainingActions),
    );

    if (remainingActions.length === 0) {
      console.log('All pending actions synced successfully.');
    } else {
      console.log(
        `${remainingActions.length} action(s) remain for next sync.`,
      );
    }
  } catch (error) {
    console.error('Failed to run sync process', error);
  }
};
