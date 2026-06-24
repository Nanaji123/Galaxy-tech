import axios from 'axios';

const TOKEN = '1KtTgaJHDAdcG59zwGj48fLowu5cCB8e';
const BASE_URL = 'https://devinternal.buziness.ai/api/post/trpc';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const getReels = async (cursor?: string) => {
  const inputPayload: any = {limit: 20};
  if (cursor) {
    inputPayload.cursor = cursor;
  }
  const params = {input: JSON.stringify(inputPayload)};
  console.log('Sending GET /posts.getReels with params:', params);
  try {
    const response = await apiClient.get('/posts.getReels', {params});
    console.log('Received response from /posts.getReels:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      'Error fetching reels:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const toggleLike = async (postId: string) => {
  const payload = {postId};
  console.log('Sending POST /social.toggleLike with payload:', payload);
  try {
    const response = await apiClient.post('/social.toggleLike', payload);
    console.log('Received response from /social.toggleLike:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      'Error toggling like:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export default apiClient;
