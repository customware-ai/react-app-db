import type { LoaderFunctionArgs } from "react-router";
import { getDemoLeads } from "~/services/erp";

export async function loader({ request: _request }: LoaderFunctionArgs): Promise<Array<{ id: number; company_name: string; contact_name: string; estimated_value: number; probability: number; stage: string; created_at: string }>> {
  const leads = await getDemoLeads();
  return leads;
}
