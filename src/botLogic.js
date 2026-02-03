import productsData from './data/products.json';

export const products = productsData;

export const quizQuestions = [
    {
        id: 'context',
        text: 'Para quem é o mimo? 🎁',
        options: [
            { label: 'Para Mim 🙋‍♀️', value: 'self', type: 'self' },
            { label: 'Presente 🎁', value: 'gift', type: 'gift' },
        ]
    },
    {
        id: 'vibe',
        text: 'Qual a ocasião?',
        options: [
            { label: 'Festa & Glamour ✨', value: 'festa', type: 'doce' },
            { label: 'Dia a dia & Trabalho 💼', value: 'trabalho', type: 'fresco' },
            { label: 'Relax & Casa 🏠', value: 'casa', type: 'suave' }
        ]
    },
    {
        id: 'smell',
        text: 'Que cheiro você ama?',
        options: [
            { label: 'Doce / Baunilha 🍭', value: 'doce', type: 'doce' },
            { label: 'Madeira / Couro 🪵', value: 'madeirado', type: 'madeirado' },
            { label: 'Frutas / Cítrico 🍋', value: 'fresco', type: 'fresco' }
        ]
    }
];

export const getRecomendations = (answers) => {
    const tags = Object.values(answers).map(a => a.type);

    return products.filter(p => {
        // If user said "Gift", prioritize giftable items
        if (tags.includes('gift') && !p.tags.includes('gift') && !p.tags.includes('festa')) return false;

        // If user said "Self", prioritize self-care or general items
        if (tags.includes('self') && p.tags.includes('gift') && !p.tags.includes('self')) return false;

        // Match other tags (scent, occasion)
        const matchCount = tags.filter(tag => p.tags.includes(tag)).length;
        return matchCount >= 1;
    }).sort((a, b) => {
        // Sort by number of matching tags
        const aMatches = tags.filter(tag => a.tags.includes(tag)).length;
        const bMatches = tags.filter(tag => b.tags.includes(tag)).length;
        return bMatches - aMatches;
    }).slice(0, 5);
};
