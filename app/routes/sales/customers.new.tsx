/**
 * New Customer Form Route
 *
 * Form for creating new customer records.
 * Features:
 * - Comprehensive form with all customer fields
 * - Client-side validation with Zod
 * - Server-side validation and database insertion
 * - Error handling and success feedback
 * - Redirects to customer list after successful creation
 */

import { useState } from "react";
import type { ReactElement, FormEvent } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input, Textarea } from "../../components/ui/Input";
import { CreateCustomerSchema } from "../../schemas";
import { createCustomerMutation, customerKeys } from "../../queries/sales";

export default function NewCustomerPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    ...createCustomerMutation,
    onSuccess: () => {
      // Invalidate cache and redirect
      void queryClient.invalidateQueries({ queryKey: customerKeys.all });
      void navigate("/sales/customers");
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    
    const data = {
      company_name: formData.get("company_name") as string,
      contact_name: (formData.get("contact_name") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      postal_code: (formData.get("postal_code") as string) || null,
      country: (formData.get("country") as string) || "USA",
      tax_id: (formData.get("tax_id") as string) || null,
      payment_terms: parseInt((formData.get("payment_terms") as string) || "30"),
      credit_limit: parseFloat((formData.get("credit_limit") as string) || "0"),
      status: (formData.get("status") as "active" | "inactive") || "active",
      notes: (formData.get("notes") as string) || null,
    };

    // Client-side validation
    const validation = CreateCustomerSchema.safeParse(data);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    mutation.mutate(validation.data);
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Sales & CRM", href: "/sales" },
        { label: "Customers", href: "/sales/customers" },
        { label: "New Customer" },
      ]}
    >
      <PageHeader
        title="New Customer"
        description="Create a new customer record with contact and billing information."
      />

      {/* Error Alert */}
      {mutation.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {mutation.error.message}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="company_name"
                    type="text"
                    required
                    placeholder="Sample Company Inc"
                  />
                  {fieldErrors.company_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.company_name[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Contact Name
                  </label>
                  <Input
                    name="contact_name"
                    type="text"
                    placeholder="Jane Sample"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Tax ID / EIN
                  </label>
                  <Input
                    name="tax_id"
                    type="text"
                    placeholder="12-3456789"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="contact@sample-company.com"
                  />
                   {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.email[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Address
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Street Address
                  </label>
                  <Input
                    name="address"
                    type="text"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                      City
                    </label>
                    <Input
                      name="city"
                      type="text"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                      State
                    </label>
                    <Input
                      name="state"
                      type="text"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                      Postal Code
                    </label>
                    <Input
                      name="postal_code"
                      type="text"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                      Country
                    </label>
                    <Input
                      name="country"
                      type="text"
                      defaultValue="USA"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Payment Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Payment Terms (days)
                  </label>
                  <Input
                    name="payment_terms"
                    type="number"
                    defaultValue="30"
                    min="0"
                    placeholder="30"
                  />
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    Number of days until invoice payment is due
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Credit Limit
                  </label>
                  <Input
                    name="credit_limit"
                    type="number"
                    defaultValue="0"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    Maximum outstanding balance allowed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="w-full px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-100 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                Notes
              </label>
              <Textarea
                name="notes"
                rows={4}
                placeholder="Add any additional notes about this customer..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-surface-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/sales/customers")}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
                loading={mutation.isPending}
              >
                Create Customer
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
