import { categoryService } from "@/lib/services/category.service";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories", "list"],
    queryFn: categoryService.listCategories,
    staleTime: 10 * 60 * 1000,
  });
