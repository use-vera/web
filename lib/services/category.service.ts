import clientHttp from "@/lib/api/client-http";
import { type CategoryApi } from "@/lib/types/event";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const categoryService = {
  listCategories: async (): Promise<CategoryApi[]> => {
    const response = await clientHttp.get<ApiEnvelope<CategoryApi[]>>("/categories");
    return response.data.data;
  },
};
