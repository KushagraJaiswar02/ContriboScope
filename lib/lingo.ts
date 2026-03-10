export const lingoConfig = {
    apiKey: process.env.LINGO_DEV_API_KEY,
};

export const lingo = {
    // Mock localizeText method to simulate translating text using Lingo.dev
    localizeText: async (text: string, lang: string = "en"): Promise<string> => {
        if (lang === "en") return text;

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Very simple mock translations for the hackathon
        if (lang === "es") {
            return `[Español] ${text}`;
        }
        if (lang === "fr") {
            return `[Français] ${text}`;
        }

        return `[${lang.toUpperCase()}] ${text}`;
    }
};
