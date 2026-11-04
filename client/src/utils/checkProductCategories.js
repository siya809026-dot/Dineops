
import api from "../api/client";

export const checkProductCategories = async (branchId) => {
  try {
    const response = await api.get("/products", {
      params: branchId ? { branchId } : {},
    });

    const products = Array.isArray(response?.data?.products)
      ? response.data.products
      : [];

    const categories = [
      ...new Set(
        products
          .map((product) => product.category?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));

    const categoryCounts = categories.map((category) => ({
      name: category,
      count: products.filter(
        (product) => product.category?.trim() === category
      ).length,
    }));

    return {
      products,
      categories,
      categoryCounts,
    };
  } catch (error) {
    console.error(
      "Unable to fetch product categories:",
      error.response?.data?.message || error.message
    );

    throw error;
  }
};
