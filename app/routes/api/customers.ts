import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getCustomers, createCustomer } from "~/services/erp";
import { CreateCustomerSchema, type Customer } from "~/schemas";

export async function loader({ request }: LoaderFunctionArgs): Promise<Customer[]> {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const status = (url.searchParams.get("status") as "active" | "inactive") || undefined;

  const result = await getCustomers({ search, status });

  if (result.isErr()) {
    throw new Response(result.error.message, { status: 500 });
  }

  return result.value;
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const data = await request.json();
    const validation = CreateCustomerSchema.safeParse(data);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          fieldErrors: validation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await createCustomer(validation.data);

    if (result.isErr()) {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(result.value), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
