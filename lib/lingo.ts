import { LingoDotDevEngine } from 'lingo.dev/sdk';

const engine = new LingoDotDevEngine({
    apiKey: process.env.LINGO_DEV_API_KEY as string,
});

export const lingo = {
    /**
     * Translate all string fields of an object in ONE API call.
     * This is the preferred method — one round-trip instead of N.
     */
    localizeObject: async <T extends Record<string, any>>(obj: T, targetLocale: string = 'en'): Promise<T> => {
        if (targetLocale === 'en') {
            console.log('🌏 [Lingo] Skipping — target is English.');
            return obj;
        }

        console.log(`🌏 [Lingo] localizeObject → targetLocale: "${targetLocale}"`);
        console.log('🌏 [Lingo] Payload keys:', Object.keys(obj));

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10_000);

            const result = await engine.localizeObject(
                obj,
                { sourceLocale: 'en', targetLocale },
                undefined,
                controller.signal
            ) as T;

            clearTimeout(timer);
            console.log('✅ [Lingo] localizeObject succeeded.');
            return result;
        } catch (err: any) {
            console.error(`❌ [Lingo] localizeObject error: ${err.message || err}`);
            return obj; // graceful fallback to English
        }
    },

    /**
     * Translate a single string — kept for compatibility.
     */
    localizeText: async (text: string, targetLocale: string = 'en'): Promise<string> => {
        if (targetLocale === 'en') return text;

        console.log(`🌏 [Lingo] localizeText → targetLocale: "${targetLocale}"`);

        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8_000);

            const result = await engine.localizeText(
                text,
                { sourceLocale: 'en', targetLocale },
                undefined,
                controller.signal
            );

            clearTimeout(timer);
            console.log(`✅ [Lingo] localizeText succeeded: "${result.slice(0, 60)}…"`);
            return result;
        } catch (err: any) {
            console.error(`❌ [Lingo] localizeText error: ${err.message || err}`);
            return text;
        }
    },
};
