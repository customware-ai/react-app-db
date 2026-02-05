/**
 * Financial Reports Route
 *
 * Generates and displays financial reports:
 * - Balance Sheet (Assets = Liabilities + Equity)
 * - Income Statement (Revenue - Expenses = Net Income)
 * - Cash Flow Statement
 * - Aged Receivables Report
 *
 * Features:
 * - Select report type
 * - Choose date range
 * - Generate report
 * - Export to PDF/CSV
 * - Print-friendly view
 */

import type { ReactElement } from "react";
import { useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";

/**
 * Report type definitions
 */
const reportTypes = [
  {
    value: "balance_sheet",
    label: "Balance Sheet",
    description: "Assets, Liabilities, and Equity at a point in time",
  },
  {
    value: "income_statement",
    label: "Income Statement",
    description: "Revenue and Expenses over a period",
  },
  {
    value: "cash_flow",
    label: "Cash Flow Statement",
    description: "Cash inflows and outflows",
  },
  {
    value: "aged_receivables",
    label: "Aged Receivables",
    description: "Outstanding invoices by age",
  },
];

export default function ReportsPage(): ReactElement {
  const [selectedReport, setSelectedReport] = useState("balance_sheet");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Accounting", href: "/accounting" },
        { label: "Reports" },
      ]}
    >
      <PageHeader
        title="Financial Reports"
        description="Generate and view financial statements and analytics."
      />

      {/* Report Selection */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Generate Report</h3>

        <div className="space-y-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Report Type
            </label>
            <Select
              options={reportTypes.map((r) => ({
                label: r.label,
                value: r.value,
              }))}
              value={selectedReport}
              onChange={setSelectedReport}
            />
            <p className="mt-1 text-sm text-surface-600">
              {reportTypes.find((r) => r.value === selectedReport)?.description}
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

        </div>
      </Card>

      {/* Report Display */}
      <Card>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No Report Generated</h3>
          <p className="text-surface-600">Select report parameters and click Generate Report</p>
        </div>
      </Card>
    </PageLayout>
  );
}
