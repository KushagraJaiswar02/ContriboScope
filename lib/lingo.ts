import { LingoDotDevEngine } from 'lingo.dev/sdk';

export const lingoConfig = {
    apiKey: process.env.LINGO_DEV_API_KEY,
};

// Instantiate the actual Lingo.dev Engine
const engine = new LingoDotDevEngine({
    apiKey: lingoConfig.apiKey,
});

export const lingo = {
    // Uses LingoDotDevEngine to natively translate text dynamically
    localizeText: async (text: string, lang: string = "en"): Promise<string> => {
        if (lang === "en") return text;

        try {
            const translatedText = await engine.localizeText(text, {
                sourceLocale: 'en',
                targetLocale: lang
            });
            return translatedText;
        } catch (error) {
            console.error("Lingo.dev Translation error:", error);
            return text; // Fallback to english if API fails
        }
    }
};
