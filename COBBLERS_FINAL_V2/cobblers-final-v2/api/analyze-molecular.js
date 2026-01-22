// api/analyze-molecular.js - COBBLERS Backend with Molecular Science
// Powered by proprietary molecular food pairing database
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Step 1: Detect ingredients using Claude Vision
        const detectedIngredients = await detectIngredientsWithClaude(image);

        // Step 2: Enrich with molecular data
        const enrichedIngredients = await enrichWithMolecularData(detectedIngredients);

        // Step 3: Calculate molecular compatibility
        const molecularCompatibility = await calculateMolecularCompatibility(enrichedIngredients);

        // Step 4: Generate cocktail suggestions with science
        const cocktails = await generateScientificCocktails(enrichedIngredients, molecularCompatibility);

        return res.status(200).json({
            ingredients: enrichedIngredients.map(ing => ing.name),
            molecular_analysis: molecularCompatibility,
            cocktails: cocktails
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// ============================================
// STEP 1: Detect Ingredients with Claude Vision
// ============================================
async function detectIngredientsWithClaude(imageBase64) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': process.env.ANTHROPIC_API_KEY
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg',
                                data: imageBase64
                            }
                        },
                        {
                            type: 'text',
                            text: `Analyse cette image et identifie tous les ingrédients de cocktails visibles (spiritueux, mixers, fruits, herbes, épices).

Réponds UNIQUEMENT avec un array JSON de noms d'ingrédients, sans markdown:

["vodka", "citron", "menthe", "sucre"]`
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content.find(block => block.type === 'text')?.text || '[]';
    
    // Parse JSON array
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
}

// ============================================
// STEP 2: Enrich with Molecular Data
// ============================================
async function enrichWithMolecularData(ingredients) {
    // Molecular database (simplified - in production, query from PostgreSQL)
    const molecularDB = {
        'vodka': {
            name: 'Vodka',
            category: 'spirit',
            molecules: [
                { name: 'Éthanol', concentration: 95, family: 'alcool' }
            ],
            flavor_profile: { sweet: 0, sour: 0, bitter: 0, umami: 0 }
        },
        'gin': {
            name: 'Gin',
            category: 'spirit',
            molecules: [
                { name: 'Limonène', concentration: 75, family: 'terpène' },
                { name: 'Pinène', concentration: 60, family: 'terpène' },
                { name: 'Coriandrol', concentration: 55, family: 'terpène' }
            ],
            flavor_profile: { sweet: 1, sour: 0, bitter: 3, umami: 0 }
        },
        'rhum': {
            name: 'Rhum',
            category: 'spirit',
            molecules: [
                { name: "Acétate d'éthyle", concentration: 70, family: 'ester' },
                { name: "Acétate d'isoamyle", concentration: 55, family: 'ester' },
                { name: 'Vanilline', concentration: 40, family: 'phénol' }
            ],
            flavor_profile: { sweet: 5, sour: 0, bitter: 1, umami: 0 }
        },
        'tequila': {
            name: 'Tequila',
            category: 'spirit',
            molecules: [
                { name: 'β-Damascenone', concentration: 65, family: 'terpène' },
                { name: '2-Phenylethanol', concentration: 50, family: 'alcool' },
                { name: 'Linalol', concentration: 45, family: 'terpène' }
            ],
            flavor_profile: { sweet: 3, sour: 0, bitter: 2, umami: 1 }
        },
        'citron': {
            name: 'Citron',
            category: 'fruit',
            molecules: [
                { name: 'Limonène', concentration: 95, family: 'terpène' },
                { name: 'Citral', concentration: 85, family: 'aldéhyde' },
                { name: 'γ-Terpinène', concentration: 40, family: 'terpène' }
            ],
            flavor_profile: { sweet: 2, sour: 9, bitter: 1, umami: 0 }
        },
        'citron vert': {
            name: 'Citron vert',
            category: 'fruit',
            molecules: [
                { name: 'Limonène', concentration: 90, family: 'terpène' },
                { name: 'Citral', concentration: 75, family: 'aldéhyde' }
            ],
            flavor_profile: { sweet: 1, sour: 10, bitter: 1, umami: 0 }
        },
        'menthe': {
            name: 'Menthe',
            category: 'herb',
            molecules: [
                { name: 'Menthol', concentration: 85, family: 'terpène' },
                { name: 'Menthone', concentration: 70, family: 'cétone' },
                { name: 'Limonène', concentration: 45, family: 'terpène' }
            ],
            flavor_profile: { sweet: 2, sour: 0, bitter: 1, umami: 1 }
        },
        'tonic': {
            name: 'Tonic',
            category: 'mixer',
            molecules: [
                { name: 'Quinine', concentration: 80, family: 'alcaloïde' },
                { name: 'Acide citrique', concentration: 60, family: 'acide' }
            ],
            flavor_profile: { sweet: 5, sour: 3, bitter: 7, umami: 0 }
        },
        'sucre': {
            name: 'Sucre',
            category: 'sweetener',
            molecules: [
                { name: 'Saccharose', concentration: 100, family: 'glucide' }
            ],
            flavor_profile: { sweet: 10, sour: 0, bitter: 0, umami: 0 }
        }
    };

    return ingredients.map(ing => {
        const lower = ing.toLowerCase();
        // Find matching entry (fuzzy match)
        for (const [key, data] of Object.entries(molecularDB)) {
            if (lower.includes(key) || key.includes(lower)) {
                return { ...data, detected_name: ing };
            }
        }
        // Default if not found
        return {
            name: ing,
            detected_name: ing,
            category: 'other',
            molecules: [],
            flavor_profile: { sweet: 5, sour: 5, bitter: 5, umami: 5 }
        };
    });
}

// ============================================
// STEP 3: Calculate Molecular Compatibility
// ============================================
async function calculateMolecularCompatibility(ingredients) {
    const pairings = [];

    for (let i = 0; i < ingredients.length; i++) {
        for (let j = i + 1; j < ingredients.length; j++) {
            const ingA = ingredients[i];
            const ingB = ingredients[j];

            // Find shared molecules
            const sharedMolecules = findSharedMolecules(ingA.molecules, ingB.molecules);
            
            // Calculate compatibility score (Jaccard similarity)
            const allMolecules = [...new Set([
                ...ingA.molecules.map(m => m.name),
                ...ingB.molecules.map(m => m.name)
            ])];
            
            const compatibility = allMolecules.length > 0 
                ? sharedMolecules.length / allMolecules.length 
                : 0;

            if (sharedMolecules.length > 0 || compatibility > 0.3) {
                pairings.push({
                    ingredients: [ingA.name, ingB.name],
                    compatibility_score: Math.round(compatibility * 100) / 100,
                    shared_molecules: sharedMolecules
                });
            }
        }
    }

    return pairings.sort((a, b) => b.compatibility_score - a.compatibility_score);
}

function findSharedMolecules(moleculesA, moleculesB) {
    const namesA = new Set(moleculesA.map(m => m.name));
    const namesB = new Set(moleculesB.map(m => m.name));
    return moleculesA
        .filter(m => namesB.has(m.name))
        .map(m => m.name);
}

// ============================================
// STEP 4: Generate Scientific Cocktails
// ============================================
async function generateScientificCocktails(ingredients, compatibility) {
    // Cocktail database with molecular science
    const cocktailsDB = [
        {
            name: 'Mojito',
            required_ingredients: ['rhum', 'menthe', 'citron vert', 'sucre'],
            description: 'Le classique cubain rafraîchissant à base de rhum, menthe et citron vert.',
            difficulty: 'Facile',
            prep_time: 5,
            molecular_harmony_score: 0.875,
            scientific_rationale: "Le Mojito fonctionne grâce à la synergie entre trois familles moléculaires : les esters fruités du rhum (acétate d'isoamyle), le menthol de la menthe, et le limonène/citral du citron vert. Ces molécules partagent des structures aromatiques qui activent les mêmes récepteurs olfactifs, créant une harmonie rafraîchissante.",
            key_molecules: ['Menthol', 'Limonène', "Acétate d'isoamyle"],
            ingredients: [
                { name: 'Rhum blanc', quantity: '50ml' },
                { name: 'Citron vert', quantity: '1 entier' },
                { name: 'Menthe fraîche', quantity: '10 feuilles' },
                { name: 'Sucre', quantity: '2 cuillères' },
                { name: 'Eau gazeuse', quantity: 'Top' }
            ],
            instructions: [
                'Écrase doucement la menthe avec le sucre dans un verre',
                'Ajoute le jus de citron vert frais',
                'Verse le rhum blanc',
                'Remplis de glace pilée',
                'Complète avec eau gazeuse',
                'Décore avec une branche de menthe'
            ]
        },
        {
            name: 'Gin Tonic',
            required_ingredients: ['gin', 'tonic'],
            description: "L'accord parfait entre gin botanique et tonic amer.",
            difficulty: 'Facile',
            prep_time: 3,
            molecular_harmony_score: 0.920,
            scientific_rationale: "Le Gin Tonic illustre le principe du contraste harmonieux. La quinine du tonic (amertume complexe) entre en résonance avec les terpènes du gin (limonène du genièvre, pinène). Ces molécules partagent des structures cycliques similaires qui créent un équilibre amer-aromatique sophistiqué.",
            key_molecules: ['Quinine', 'Limonène', 'Pinène'],
            ingredients: [
                { name: 'Gin', quantity: '50ml' },
                { name: 'Tonic', quantity: '150ml' },
                { name: 'Citron', quantity: '1 tranche' },
                { name: 'Glace', quantity: 'Généreuse' }
            ],
            instructions: [
                'Remplis un verre highball de glace',
                'Verse le gin',
                'Complète doucement avec le tonic',
                'Remue délicatement',
                'Ajoute une tranche de citron'
            ]
        },
        {
            name: 'Vodka Citron',
            required_ingredients: ['vodka', 'citron'],
            description: 'Simplicité rafraîchissante, la neutralité de la vodka sublime le citron.',
            difficulty: 'Facile',
            prep_time: 3,
            molecular_harmony_score: 0.950,
            scientific_rationale: "La vodka, neutre aromatiquement, agit comme une toile vierge. Elle n'interfère pas avec les molécules du citron, permettant au limonène et au citral de dominer et de s'exprimer pleinement. C'est l'harmonie par absence d'interférence.",
            key_molecules: ['Limonène', 'Citral', 'Éthanol'],
            ingredients: [
                { name: 'Vodka', quantity: '50ml' },
                { name: 'Jus de citron', quantity: '25ml' },
                { name: 'Sirop simple', quantity: '15ml' },
                { name: 'Glace', quantity: 'Cube' }
            ],
            instructions: [
                'Remplis un shaker de glace',
                'Ajoute vodka, jus de citron, sirop',
                'Shake vigoureusement 15 secondes',
                'Filtre dans un verre à cocktail',
                'Décore avec zeste de citron'
            ]
        },
        {
            name: 'Tequila Sunrise',
            required_ingredients: ['tequila'],
            description: 'Un lever de soleil dans un verre, fruité et visuel.',
            difficulty: 'Facile',
            prep_time: 4,
            molecular_harmony_score: 0.850,
            scientific_rationale: "Le β-damascenone de la tequila (notes fruitées) s'harmonise naturellement avec les composés du jus d'orange. L'ajout de grenadine crée un contraste visuel et gustatif sophistiqué.",
            key_molecules: ['β-Damascenone', 'Linalol', 'Caroténoïdes'],
            ingredients: [
                { name: 'Tequila', quantity: '45ml' },
                { name: "Jus d'orange", quantity: '90ml' },
                { name: 'Grenadine', quantity: '15ml' },
                { name: 'Glace', quantity: 'Cube' }
            ],
            instructions: [
                'Remplis un verre highball de glace',
                'Verse la tequila',
                "Ajoute le jus d'orange et remue",
                'Verse doucement la grenadine (elle descend)',
                'Décore avec orange et cerise'
            ]
        }
    ];

    // Find matching cocktails
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
    const matches = [];

    for (const cocktail of cocktailsDB) {
        const matchingCount = cocktail.required_ingredients.filter(req => 
            ingredientNames.some(name => name.includes(req) || req.includes(name))
        ).length;

        if (matchingCount > 0) {
            const matchScore = matchingCount / cocktail.required_ingredients.length;
            matches.push({
                ...cocktail,
                match_score: matchScore,
                missing_ingredients: cocktail.required_ingredients.filter(req =>
                    !ingredientNames.some(name => name.includes(req) || req.includes(name))
                )
            });
        }
    }

    // Sort by match score and harmony
    return matches
        .sort((a, b) => {
            if (b.match_score !== a.match_score) {
                return b.match_score - a.match_score;
            }
            return b.molecular_harmony_score - a.molecular_harmony_score;
        })
        .slice(0, 5); // Top 5 cocktails
}
