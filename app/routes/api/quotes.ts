import type { LoaderFunctionArgs } from "react-router";
import { getDemoQuotes } from "~/services/erp";

export async function loader({ request: _request }: LoaderFunctionArgs): Promise<Array<{ id: number; quote_number: string; customer: string; amount: number; status: string; date: string; valid_until: string }>> {
  const quotes = await getDemoQuotes();
  return quotes;
}
