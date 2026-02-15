/**
 * Tests for Customers Page Route
 *
 * Tests the loader function for the customers list page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoaderArgs } from '../helpers';
import { clientLoader } from '~/routes/sales/customers';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  getCustomers: vi.fn(),
}));

// Mock query client
const mockQueryClient = {
  ensureQueryData: vi.fn(),
};

vi.mock('~/query-client', () => ({
  getQueryClient: (): typeof mockQueryClient => mockQueryClient,
}));

describe('Customers Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('clientLoader', () => {
    it('should prefetch customers data', async () => {
      const request = new Request('http://localhost/sales/customers');
      
      await clientLoader(createLoaderArgs(request));

      // Just verify that ensureQueryData was called
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalled();
    });

    it('should pass search and status parameters to query options', async () => {
      const request = new Request('http://localhost/sales/customers?search=test&status=inactive');
      
      await clientLoader(createLoaderArgs(request));

      // Verify the query options passed contain the correct filters
      const ensureCall = mockQueryClient.ensureQueryData.mock.calls[0][0];
      const queryKey = ensureCall.queryKey;
      
      expect(queryKey).toContain('customers');
      expect(queryKey).toContain('list');
      expect(queryKey[2]).toEqual({
        search: 'test',
        status: 'inactive'
      });
    });
  });
});
