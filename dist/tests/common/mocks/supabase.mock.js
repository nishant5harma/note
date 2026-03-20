// src/tests/common/mocks/supabase.mock.ts
import { jest } from "@jest/globals";
// 2. Explicitly type the export using that interface
export const mockSupabase = {
    upload: jest.fn(),
    getPublicUrl: jest.fn(),
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
//# sourceMappingURL=supabase.mock.js.map