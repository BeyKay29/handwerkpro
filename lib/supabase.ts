import { createBrowserClient } from "@supabase/ssr";

let supabaseClient: any = null;

export function createClient() {
    if (supabaseClient) return supabaseClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Security: Check for missing or placeholder credentials
    if (!url || !key || url.includes("your-project") || url === "") {
        if (process.env.NODE_ENV === "development") {
            console.info("Supabase credentials missing. App will run in secure mock mode.");
        }
        return null;
    }

    try {
        supabaseClient = createBrowserClient(url, key);
        return supabaseClient;
    } catch (e) {
        console.error("Failed to initialize Supabase:", e);
        return null;
    }
}
