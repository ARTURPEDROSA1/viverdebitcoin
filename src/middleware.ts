import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if it's a direct URL to a specific language or a public file
    // We only want to intercept the root path '/' for detection
    // The user said "NEVER override direct URLs", which implies if I ask for /en, I get /en.
    // But if I ask for /, I might get redirected.
    // Also, we should skip internal requests, api, static files.
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('/api/') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return;
    }

    // Only allow redirection from the absolute root '/'
    if (pathname !== '/') {
        return;
    }

    // Check for Googlebot/Crawlers - NEVER redirect them
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i.test(userAgent);

    if (isBot) {
        return;
    }

    // Check if we have a cookie set from a previous visit
    // If the user manually switched language, we might want to respect that?
    // But usage of 'useSettings' sets 'viverdebitcoin_curr_v2'. 
    // We might not have a reliable language cookie yet, but we can set one after redirect.
    // For now, simple "first visit" detection via headers.

    // Cookie check: if 'viverdebitcoin_lang_v2' exists (from our context), use it?
    // The context currently comments out saving to verify source of truth.
    // But if we want to avoid redirect loops or aggressive redirects, we can use a cookie.
    const langCookie = request.cookies.get('viverdebitcoin_pref_lang');
    if (langCookie) {
        // If they have a preference, we *could* redirect to it, 
        // but the requirement "NEVER override direct URLs" suggests 
        // if I type '/' I might want PT if I previously chose PT?
        // Or if I chose EN, should I go to EN?
        // "detect browser language on first visit" implies only when no history.
        return;
    }

    // Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (!acceptLanguage) return;

    // Simple check for 'en' or 'es'
    // This is a naive parser; for production a library like 'negotiator' is better,
    // but a simple regex or substring check usually suffices for basic requirements.
    // We prioritize the first one found.
    const languages = acceptLanguage.split(',');

    for (const lang of languages) {
        const cleanLang = lang.split(';')[0].trim().toLowerCase();
        if (cleanLang.startsWith('en')) {
            const url = request.nextUrl.clone();
            url.pathname = '/en';
            const response = NextResponse.redirect(url);
            response.headers.set('Set-Cookie', 'viverdebitcoin_pref_lang=en; Path=/; Max-Age=31536000; SameSite=Lax');
            return response;
        }
        if (cleanLang.startsWith('es')) {
            const url = request.nextUrl.clone();
            url.pathname = '/es';
            // 302 by default for NextResponse.redirect
            const response = NextResponse.redirect(url);
            response.headers.set('Set-Cookie', 'viverdebitcoin_pref_lang=es; Path=/; Max-Age=31536000; SameSite=Lax');
            return response;
        }
        if (cleanLang.startsWith('pt')) {
            // If PT is preferred, we stay at '/', and set cookie to avoid re-check
            const response = NextResponse.next();
            response.headers.set('Set-Cookie', 'viverdebitcoin_pref_lang=pt; Path=/; Max-Age=31536000; SameSite=Lax');
            return response;
        }
    }

    return;
}

export const config = {
    matcher: ['/'],
};
