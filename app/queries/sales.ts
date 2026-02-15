import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";
import type { Customer, CreateCustomer } from "../schemas";

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters?: { status?: "active" | "inactive"; search?: string }) =>
    [...customerKeys.all, "list", filters] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
};

export const leadKeys = {
  all: ["leads"] as const,
  list: () => [...leadKeys.all, "list"] as const,
};

export const quoteKeys = {
  all: ["quotes"] as const,
  list: () => [...quoteKeys.all, "list"] as const,
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
  detail: (id: number): UseQueryOptions<Customer, Error, Customer, ReturnType<typeof customerKeys.detail>> =>
    queryOptions({
      queryKey: customerKeys.detail(id),
      queryFn: async () => {
        const response = await fetch(`/api/customers/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch customer");
        }
        return (await response.json()) as Customer;
      },
    }),
};

export const leadQueries = {
  list: (): UseQueryOptions<
    Array<{
      id: number;
      company_name: string;
      contact_name: string;
      estimated_value: number;
      probability: number;
      stage: string;
      created_at: string;
    }>,
    Error,
    Array<{
      id: number;
      company_name: string;
      contact_name: string;
      estimated_value: number;
      probability: number;
      stage: string;
      created_at: string;
    }>,
    ReturnType<typeof leadKeys.list>
  > =>
    queryOptions({
      queryKey: leadKeys.list(),
      queryFn: async () => {
        const response = await fetch("/api/leads");
        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }
        return response.json();
      },
    }),
};

export const quoteQueries = {
  list: (): UseQueryOptions<
    Array<{
      id: number;
      quote_number: string;
      customer: string;
      amount: number;
      status: string;
      date: string;
      valid_until: string;
    }>,
    Error,
    Array<{
      id: number;
      quote_number: string;
      customer: string;
      amount: number;
      status: string;
      date: string;
      valid_until: string;
    }>,
    ReturnType<typeof quoteKeys.list>
  > =>
    queryOptions({
      queryKey: quoteKeys.list(),
      queryFn: async () => {
        const response = await fetch("/api/quotes");
        if (!response.ok) {
          throw new Error("Failed to fetch quotes");
        }
        return response.json();
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
