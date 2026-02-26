import { createBrowserClient } from "@supabase/ssr";

let supabaseClient: any = null;

export function createClient() {
    if (supabaseClient) return supabaseClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes("your-project")) {
        console.warn("Supabase credentials missing. App will run in mock mode.");
        return null;
    }

    supabaseClient = createBrowserClient(url, key);
    return supabaseClient;
}
