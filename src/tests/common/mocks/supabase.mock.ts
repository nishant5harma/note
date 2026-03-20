// src/tests/common/mocks/supabase.mock.ts
import { jest } from "@jest/globals";

// 1. Define an interface to hide the complex 'jest-mock' types
interface SupabaseMock {
  upload: any;
  getPublicUrl: any;
}

// 2. Explicitly type the export using that interface
export const mockSupabase: SupabaseMock = {
  upload: jest.fn<any>(),
  getPublicUrl: jest.fn<any>(),
};

// 3. Mock the module
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: mockSupabase.upload,
        getPublicUrl: mockSupabase.getPublicUrl,
      }),
    },
  }),
}));
