import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export interface Post {
  id: string;
  authorId?: string;
  authorName?: string;
  authorImage?: string;
  isAnonymous?: boolean;
  content: string;
  timestamp: string;
  likeCount: number;
  isLiked?: boolean;
}

interface PostState {
  posts: Post[];
  myPosts: Post[];
  loading: boolean;
  fetchFeed: () => Promise<void>;
  fetchMyPosts: () => Promise<void>;
  createPost: (content: string, isAnonymous: boolean) => Promise<Post | null>;
  toggleLike: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  myPosts: [],
  loading: false,

  fetchFeed: async () => {
    set({ loading: true });
    try {
      const data = await apiClient.get<{ posts: any[] }>('/posts');
      const mappedPosts: Post[] = (data.posts || []).map((p) => ({
        id: p.id,
        authorId: p.author_id,
        authorName: p.author_name || undefined,
        authorImage: p.author_avatar || undefined,
        isAnonymous: p.is_anonymous,
        content: p.body,
        timestamp: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        likeCount: p.like_count || 0,
        isLiked: false,
      }));
      set({ posts: mappedPosts, loading: false });
    } catch (err) {
      console.warn('Fetch feed warning:', err);
      set({ loading: false });
    }
  },

  fetchMyPosts: async () => {
    try {
      const data = await apiClient.get<any[]>('/users/me/posts');
      const mappedMyPosts: Post[] = (data || []).map((p) => ({
        id: p.id,
        authorId: p.author_id,
        authorName: p.author_name || undefined,
        authorImage: p.author_avatar || undefined,
        isAnonymous: p.is_anonymous,
        content: p.body,
        timestamp: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        likeCount: p.like_count || 0,
        isLiked: false,
      }));
      set({ myPosts: mappedMyPosts });
    } catch (err) {
      console.warn('Fetch my posts error:', err);
    }
  },

  createPost: async (content: string, isAnonymous: boolean) => {
    try {
      const created = await apiClient.post<any>('/posts', {
        body: content,
        isAnonymous,
      });

      const newPost: Post = {
        id: created.id,
        authorId: created.author_id,
        authorName: isAnonymous ? undefined : 'You',
        isAnonymous: created.is_anonymous,
        content: created.body,
        timestamp: 'Just now',
        likeCount: 0,
        isLiked: false,
      };

      set((state) => ({
        posts: [newPost, ...state.posts],
        myPosts: [newPost, ...state.myPosts],
      }));

      return newPost;
    } catch (err) {
      console.error('Create post error:', err);
      return null;
    }
  },

  toggleLike: async (postId: string) => {
    const post = get().posts.find((p) => p.id === postId) || get().myPosts.find((p) => p.id === postId);
    if (!post) return;

    const newIsLiked = !post.isLiked;

    // Optimistic UI update
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: newIsLiked,
            likeCount: newIsLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
          };
        }
        return p;
      }),
      myPosts: state.myPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: newIsLiked,
            likeCount: newIsLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
          };
        }
        return p;
      }),
    }));

    try {
      if (newIsLiked) {
        const res = await apiClient.post<{ likeCount: number }>(`/posts/${postId}/like`, {});
        set((state) => ({
          posts: state.posts.map((p) => p.id === postId ? { ...p, likeCount: res.likeCount } : p),
          myPosts: state.myPosts.map((p) => p.id === postId ? { ...p, likeCount: res.likeCount } : p),
        }));
      } else {
        const res = await apiClient.delete<{ likeCount: number }>(`/posts/${postId}/like`);
        set((state) => ({
          posts: state.posts.map((p) => p.id === postId ? { ...p, likeCount: res.likeCount } : p),
          myPosts: state.myPosts.map((p) => p.id === postId ? { ...p, likeCount: res.likeCount } : p),
        }));
      }
    } catch (err) {
      console.warn('Toggle like error:', err);
    }
  },
}));
