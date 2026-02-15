import { queryOptions, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import type { Customer, CreateCustomer } from "../schemas";

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters?: { status?: "active" | "inactive"; search?: string }) =>
    [...customerKeys.all, "list", filters] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
};

export const customerQueries = {
  list: (filters?: {
    status?: "active" | "inactive";
    search?: string;
  }): UseQueryOptions<Customer[], Error, Customer[], ReturnType<typeof customerKeys.list>> =>
    queryOptions({
      queryKey: customerKeys.list(filters),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters?.status) params.set("status", filters.status);
        if (filters?.search) params.set("search", filters.search);

        const response = await fetch(`/api/customers?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        return (await response.json()) as Customer[];
      },
    }),
};

export const createCustomerMutation = {
  mutationFn: async (data: CreateCustomer): Promise<Customer> => {
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error: string; fieldErrors?: Record<string, string[]> };
      throw new Error(errorData.error || "Failed to create customer");
    }

    return (await response.json()) as Customer;
  },
};
