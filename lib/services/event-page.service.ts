import clientHttp from "@/lib/api/client-http";
import {
  type EventPageApi,
  type EventPageEditorState,
  type PageBlock,
  type PageSeo,
  type PageTheme,
  type PublicEventPage,
  type SlugCheck,
} from "@/lib/types/event-page";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SavePagePayload {
  slug?: string;
  blocks?: PageBlock[];
  theme?: Partial<PageTheme>;
  seo?: PageSeo;
}

export const eventPageService = {
  get: async (eventId: string): Promise<EventPageEditorState> => {
    const response = await clientHttp.get<ApiEnvelope<EventPageEditorState>>(
      `/organizer/events/${eventId}/page`,
    );

    return response.data.data;
  },

  save: async (
    eventId: string,
    payload: SavePagePayload,
  ): Promise<EventPageApi> => {
    const response = await clientHttp.put<ApiEnvelope<EventPageApi>>(
      `/organizer/events/${eventId}/page`,
      payload,
    );

    return response.data.data;
  },

  setStatus: async (
    eventId: string,
    status: "draft" | "published",
  ): Promise<EventPageApi> => {
    const response = await clientHttp.patch<ApiEnvelope<EventPageApi>>(
      `/organizer/events/${eventId}/page/status`,
      { status },
    );

    return response.data.data;
  },

  checkSlug: async (eventId: string, slug: string): Promise<SlugCheck> => {
    const response = await clientHttp.get<ApiEnvelope<SlugCheck>>(
      `/organizer/events/${eventId}/page/slug-check`,
      { params: { slug } },
    );

    return response.data.data;
  },

  getPublic: async (slug: string): Promise<PublicEventPage> => {
    const response = await clientHttp.get<ApiEnvelope<PublicEventPage>>(
      `/pages/${slug}`,
    );

    return response.data.data;
  },
};
