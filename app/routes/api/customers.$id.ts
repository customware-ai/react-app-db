import type { LoaderFunctionArgs } from "react-router";
import { getCustomerById } from "~/services/erp";
import type { Customer } from "~/schemas";

export async function loader({ params }: LoaderFunctionArgs): Promise<Customer> {
  const id = parseInt(params.id!);
  const result = await getCustomerById(id);

  if (result.isErr() || !result.value) {
    throw new Response("Customer not found", { status: 404 });
  }

  return result.value;
}
