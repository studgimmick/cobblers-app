# 🧬 COBBLERS - Base de Données Moléculaire pour Cocktails
# Basée sur notre base de données propriétaire + FlavorDB + Spoonacular

## Structure de la Base de Données Scientifique

### Contexte
Notre base de données catalogue les accords gustatifs basés sur les molécules aromatiques partagées.
Cette base enrichit COBBLERS avec la science du food pairing appliquée aux cocktails.

---

## 🗄️ SCHEMA SQL COMPLET

```sql
-- ============================================
-- TABLE 1: FAMILLES MOLÉCULAIRES
-- ============================================
CREATE TABLE molecule_families (
    family_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    typical_aroma VARCHAR(255),
    examples JSONB  -- ["Limonene", "Pinene", "Myrcene"]
);

-- Données initiales
INSERT INTO molecule_families (name, description, typical_aroma, examples) VALUES
('Terpènes', 'Composés aromatiques présents dans les plantes', 'Citronné, pin, herbacé', '["Limonène", "Pinène", "Myrcène", "Linalol"]'),
('Esters', 'Molécules responsables des arômes fruités', 'Fruité, floral, sucré', '["Acétate d''isoamyle", "Acétate d''éthyle", "Butyrate d''éthyle"]'),
('Aldéhydes', 'Arômes verts et frais', 'Herbacé, vert, frais', '["Hexanal", "Décanal", "Citral"]'),
('Cétones', 'Notes crémeuses et boisées', 'Crémeux, beurré, boisé', '["Diacétyle", "2-Heptanone", "β-Ionone"]'),
('Pyrazines', 'Arômes torréfiés et terreux', 'Torréfié, noisette, terreux', '["2-Méthoxypyrazine", "2-Éthyl-3-méthoxypyrazine"]'),
('Phénols', 'Notes épicées et fumées', 'Épicé, fumé, médicinal', '["Eugénol", "Gaïacol", "Vanilline"]'),
('Lactones', 'Arômes sucrés et fruités', 'Noix de coco, pêche, crème', '["γ-Décalactone", "δ-Décalactone", "Massoia lactone"]'),
('Thiols', 'Arômes soufrés, tropicaux', 'Pamplemousse, passion, cassis', '["3-Mercaptohexanol", "4-Mercapto-4-méthylpentan-2-one"]');


-- ============================================
-- TABLE 2: MOLÉCULES AROMATIQUES
-- ============================================
CREATE TABLE aromatic_molecules (
    molecule_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    chemical_formula VARCHAR(50),
    cas_number VARCHAR(20),  -- Chemical Abstracts Service number
    family_id INTEGER REFERENCES molecule_families(family_id),
    
    -- Profil sensoriel (0-10)
    aroma_profile JSONB,  -- {"fruity": 8, "floral": 3, "woody": 5, "citrus": 9}
    
    -- Descripteurs aromatiques
    primary_aroma VARCHAR(100),
    secondary_aromas TEXT[],
    
    -- Seuil de détection (en ppm - parties par million)
    detection_threshold DECIMAL(10,6),
    
    -- Compatibilités
    synergistic_molecules INTEGER[],  -- IDs de molécules synergiques
    incompatible_molecules INTEGER[], -- IDs de molécules incompatibles
    
    -- Métadonnées
    source_reference VARCHAR(255),
    flavordb_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_molecules_family ON aromatic_molecules(family_id);
CREATE INDEX idx_molecules_name ON aromatic_molecules(name);


-- ============================================
-- TABLE 3: INGRÉDIENTS ENRICHIS
-- ============================================
CREATE TABLE ingredients_molecular (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(100),
    
    -- Catégorisation
    category VARCHAR(50),  -- 'spirit', 'mixer', 'fruit', 'herb', 'spice'
    subcategory VARCHAR(50),
    
    -- Profil moléculaire
    dominant_molecules JSONB,  -- [{"molecule_id": 1, "concentration": 85, "molecule_name": "Limonène"}]
    secondary_molecules JSONB,
    trace_molecules JSONB,
    
    -- Profil sensoriel global
    flavor_profile JSONB,  -- {"sweet": 3, "sour": 7, "bitter": 2, "umami": 0, "salty": 1}
    aroma_intensity INTEGER CHECK (aroma_intensity >= 0 AND aroma_intensity <= 10),
    
    -- Caractéristiques physico-chimiques
    ph_level DECIMAL(3,2),
    alcohol_content DECIMAL(5,2),  -- % ABV
    sugar_content DECIMAL(5,2),    -- g/L
    
    -- Food pairing (du livre)
    classic_pairings TEXT[],
    modern_pairings TEXT[],
    
    -- Métadonnées
    season VARCHAR(20),  -- 'spring', 'summer', 'fall', 'winter', 'all'
    availability VARCHAR(20),  -- 'common', 'seasonal', 'rare'
    price_range INTEGER CHECK (price_range >= 1 AND price_range <= 5),
    
    -- Sources scientifiques
    flavordb_id VARCHAR(50),
    spoonacular_id INTEGER,
    repertoire_page INTEGER,  -- Page du livre
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ingredients_category ON ingredients_molecular(category);
CREATE INDEX idx_ingredients_name ON ingredients_molecular(name);


-- ============================================
-- TABLE 4: PAIRINGS MOLÉCULAIRES
-- ============================================
CREATE TABLE molecular_pairings (
    pairing_id SERIAL PRIMARY KEY,
    ingredient_a_id INTEGER REFERENCES ingredients_molecular(ingredient_id),
    ingredient_b_id INTEGER REFERENCES ingredients_molecular(ingredient_id),
    
    -- Score de compatibilité (0.00 à 1.00)
    compatibility_score DECIMAL(4,3) NOT NULL,
    
    -- Analyse moléculaire
    shared_molecules JSONB,  -- [{"molecule_id": 1, "name": "Limonène", "weight": 0.85}]
    complementary_molecules JSONB,
    synergy_explanation TEXT,
    
    -- Validation
    scientific_sources TEXT[],
    traditional_pairing BOOLEAN DEFAULT FALSE,  -- Accord traditionnel connu
    innovative_pairing BOOLEAN DEFAULT FALSE,   -- Accord innovant/expérimental
    
    -- Contexte d'utilisation
    recommended_ratio VARCHAR(50),  -- "1:2", "equal parts", etc.
    best_for VARCHAR(100),  -- "aperitif", "digestif", "summer", etc.
    
    -- Métadonnées
    validation_method VARCHAR(50),  -- 'flavordb', 'repertoire', 'spoonacular', 'manual'
    confidence_level DECIMAL(3,2),  -- 0.00 à 1.00
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Contrainte d'unicité
    UNIQUE(ingredient_a_id, ingredient_b_id)
);

CREATE INDEX idx_pairings_score ON molecular_pairings(compatibility_score DESC);
CREATE INDEX idx_pairings_ingredients ON molecular_pairings(ingredient_a_id, ingredient_b_id);


-- ============================================
-- TABLE 5: COCKTAILS AVEC ANALYSE SCIENTIFIQUE
-- ============================================
CREATE TABLE cocktails_scientific (
    cocktail_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    name_en VARCHAR(150),
    description TEXT,
    
    -- Classification
    category VARCHAR(50),  -- 'classic', 'modern', 'experimental'
    style VARCHAR(50),     -- 'sour', 'stirred', 'highball', etc.
    difficulty VARCHAR(20) CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
    
    -- Analyse moléculaire du cocktail
    molecular_harmony_score DECIMAL(4,3),  -- Score global 0.000 à 1.000
    dominant_molecule_families VARCHAR(100)[],  -- ['Terpènes', 'Esters']
    
    -- Profil sensoriel du résultat
    final_flavor_profile JSONB,
    aromatic_complexity INTEGER CHECK (aromatic_complexity >= 1 AND aromatic_complexity <= 10),
    balance_score DECIMAL(3,2),  -- Équilibre sucré/acide/amer
    
    -- Explication scientifique
    scientific_rationale TEXT,  -- Pourquoi ce cocktail fonctionne
    key_molecular_interactions TEXT[],
    
    -- Métadonnées cocktail
    origin VARCHAR(100),
    year_created INTEGER,
    creator VARCHAR(100),
    
    -- Caractéristiques
    prep_time INTEGER,  -- minutes
    complexity_level INTEGER CHECK (complexity_level >= 1 AND complexity_level <= 10),
    abv DECIMAL(4,2),   -- Alcohol by volume du cocktail final
    
    -- Occasion/contexte
    best_served VARCHAR(50),  -- 'aperitif', 'digestif', 'evening', etc.
    season_recommendation VARCHAR(20),
    
    -- Métadonnées
    popularity_score INTEGER DEFAULT 0,
    user_rating DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cocktails_harmony ON cocktails_scientific(molecular_harmony_score DESC);
CREATE INDEX idx_cocktails_name ON cocktails_scientific(name);


-- ============================================
-- TABLE 6: INGRÉDIENTS PAR COCKTAIL
-- ============================================
CREATE TABLE cocktail_ingredients (
    id SERIAL PRIMARY KEY,
    cocktail_id INTEGER REFERENCES cocktails_scientific(cocktail_id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients_molecular(ingredient_id),
    
    -- Quantité
    quantity DECIMAL(6,2),
    unit VARCHAR(20),  -- 'ml', 'cl', 'oz', 'dash', 'leaf', etc.
    quantity_display VARCHAR(50),  -- "50ml", "2 dashes", "1 slice"
    
    -- Rôle dans le cocktail
    role VARCHAR(50),  -- 'base', 'modifier', 'accent', 'garnish'
    optional BOOLEAN DEFAULT FALSE,
    
    -- Alternatives
    substitute_ingredient_id INTEGER REFERENCES ingredients_molecular(ingredient_id),
    substitute_reason TEXT,
    
    -- Ordre de préparation
    preparation_order INTEGER,
    preparation_method VARCHAR(100),  -- 'muddle', 'shake', 'stir', 'layer'
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cocktail_ingredients ON cocktail_ingredients(cocktail_id);


-- ============================================
-- TABLE 7: INSTRUCTIONS DE PRÉPARATION
-- ============================================
CREATE TABLE cocktail_instructions (
    instruction_id SERIAL PRIMARY KEY,
    cocktail_id INTEGER REFERENCES cocktails_scientific(cocktail_id) ON DELETE CASCADE,
    
    step_number INTEGER NOT NULL,
    instruction_text TEXT NOT NULL,
    
    -- Détails techniques
    technique VARCHAR(50),  -- 'shake', 'stir', 'muddle', 'layer', etc.
    duration INTEGER,       -- secondes
    temperature VARCHAR(20), -- 'cold', 'room', 'warm'
    
    -- Explication scientifique de l'étape
    scientific_reason TEXT,
    molecular_impact TEXT,  -- Impact sur les molécules
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(cocktail_id, step_number)
);


-- ============================================
-- TABLE 8: HISTORIQUE UTILISATEUR
-- ============================================
CREATE TABLE user_analyses (
    analysis_id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),  -- Anonymous ID ou user ID
    session_id VARCHAR(100),
    
    -- Analyse d'image
    image_url TEXT,
    detected_ingredients JSONB,  -- [{"name": "vodka", "confidence": 0.95, "ingredient_id": 1}]
    
    -- Suggestions générées
    suggested_cocktails INTEGER[],  -- IDs des cocktails suggérés
    selected_cocktail_id INTEGER REFERENCES cocktails_scientific(cocktail_id),
    
    -- Métadonnées
    analysis_duration INTEGER,  -- ms
    api_cost DECIMAL(6,4),      -- coût en $
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_analyses_user ON user_analyses(user_id);
CREATE INDEX idx_user_analyses_date ON user_analyses(created_at DESC);


-- ============================================
-- TABLE 9: FAVORIS UTILISATEUR
-- ============================================
CREATE TABLE user_favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    cocktail_id INTEGER REFERENCES cocktails_scientific(cocktail_id),
    
    -- Notes personnelles
    personal_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Modifications
    modifications JSONB,  -- {"ingredient": "lime", "change": "reduced to 15ml"}
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, cocktail_id)
);


-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Top pairings moléculaires
CREATE VIEW top_molecular_pairings AS
SELECT 
    p.pairing_id,
    ia.name as ingredient_a,
    ib.name as ingredient_b,
    p.compatibility_score,
    p.synergy_explanation,
    p.traditional_pairing,
    p.innovative_pairing
FROM molecular_pairings p
JOIN ingredients_molecular ia ON p.ingredient_a_id = ia.ingredient_id
JOIN ingredients_molecular ib ON p.ingredient_b_id = ib.ingredient_id
ORDER BY p.compatibility_score DESC;


-- Vue: Cocktails avec leurs ingrédients
CREATE VIEW cocktails_full AS
SELECT 
    c.cocktail_id,
    c.name,
    c.molecular_harmony_score,
    c.scientific_rationale,
    json_agg(json_build_object(
        'ingredient', i.name,
        'quantity', ci.quantity_display,
        'role', ci.role
    ) ORDER BY ci.preparation_order) as ingredients
FROM cocktails_scientific c
JOIN cocktail_ingredients ci ON c.cocktail_id = ci.cocktail_id
JOIN ingredients_molecular i ON ci.ingredient_id = i.ingredient_id
GROUP BY c.cocktail_id, c.name, c.molecular_harmony_score, c.scientific_rationale;


-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Fonction: Calculer le score de compatibilité moléculaire
CREATE OR REPLACE FUNCTION calculate_molecular_compatibility(
    ing_a_id INTEGER,
    ing_b_id INTEGER
) RETURNS DECIMAL(4,3) AS $$
DECLARE
    shared_count INTEGER;
    total_molecules INTEGER;
    compatibility DECIMAL(4,3);
BEGIN
    -- Logique simplifiée - à enrichir avec vraies données moléculaires
    -- Compte les molécules partagées
    SELECT COUNT(DISTINCT molecule_id) INTO shared_count
    FROM (
        SELECT jsonb_array_elements(dominant_molecules)->>'molecule_id' as molecule_id
        FROM ingredients_molecular
        WHERE ingredient_id = ing_a_id
        INTERSECT
        SELECT jsonb_array_elements(dominant_molecules)->>'molecule_id' as molecule_id
        FROM ingredients_molecular
        WHERE ingredient_id = ing_b_id
    ) shared;
    
    -- Compte total des molécules uniques
    SELECT COUNT(DISTINCT molecule_id) INTO total_molecules
    FROM (
        SELECT jsonb_array_elements(dominant_molecules)->>'molecule_id' as molecule_id
        FROM ingredients_molecular
        WHERE ingredient_id IN (ing_a_id, ing_b_id)
    ) all_molecules;
    
    -- Calcule le score (Jaccard similarity)
    IF total_molecules > 0 THEN
        compatibility := shared_count::DECIMAL / total_molecules::DECIMAL;
    ELSE
        compatibility := 0;
    END IF;
    
    RETURN ROUND(compatibility, 3);
END;
$$ LANGUAGE plpgsql;


-- Fonction: Suggérer des cocktails basés sur ingrédients
CREATE OR REPLACE FUNCTION suggest_cocktails_by_ingredients(
    ingredient_ids INTEGER[]
) RETURNS TABLE (
    cocktail_id INTEGER,
    name VARCHAR,
    harmony_score DECIMAL,
    matching_ingredients INTEGER,
    missing_ingredients INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.cocktail_id,
        c.name,
        c.molecular_harmony_score,
        COUNT(DISTINCT CASE WHEN ci.ingredient_id = ANY(ingredient_ids) THEN ci.ingredient_id END)::INTEGER as matching,
        COUNT(DISTINCT CASE WHEN NOT ci.ingredient_id = ANY(ingredient_ids) THEN ci.ingredient_id END)::INTEGER as missing
    FROM cocktails_scientific c
    JOIN cocktail_ingredients ci ON c.cocktail_id = ci.cocktail_id
    GROUP BY c.cocktail_id, c.name, c.molecular_harmony_score
    HAVING COUNT(DISTINCT CASE WHEN ci.ingredient_id = ANY(ingredient_ids) THEN ci.ingredient_id END) > 0
    ORDER BY matching DESC, c.molecular_harmony_score DESC, missing ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

---

## 📚 DONNÉES D'EXEMPLE (Seed Data)

Basées sur notre recherche propriétaire et adaptées aux cocktails :

```sql
-- ============================================
-- EXEMPLES D'INGRÉDIENTS MOLÉCULAIRES
-- ============================================

INSERT INTO ingredients_molecular (
    name, name_en, category, subcategory,
    dominant_molecules, flavor_profile, aroma_intensity,
    classic_pairings, flavordb_id
) VALUES

-- SPIRITUEUX
(
    'Gin', 'Gin', 'spirit', 'botanical',
    '[
        {"molecule_id": 1, "molecule_name": "Limonène", "concentration": 75, "aroma": "citrus"},
        {"molecule_id": 2, "molecule_name": "Pinène", "concentration": 60, "aroma": "pine"},
        {"molecule_id": 3, "molecule_name": "Coriandrol", "concentration": 55, "aroma": "herbaceous"}
    ]'::jsonb,
    '{"sweet": 1, "sour": 0, "bitter": 3, "umami": 0, "salty": 0}'::jsonb,
    8,
    ARRAY['citron', 'concombre', 'genièvre', 'tonic'],
    'gin_001'
),

(
    'Vodka', 'Vodka', 'spirit', 'neutral',
    '[
        {"molecule_id": 10, "molecule_name": "Éthanol", "concentration": 95, "aroma": "neutral"},
        {"molecule_id": 11, "molecule_name": "Traces céréales", "concentration": 5, "aroma": "grainy"}
    ]'::jsonb,
    '{"sweet": 0, "sour": 0, "bitter": 0, "umami": 0, "salty": 0}'::jsonb,
    2,
    ARRAY['citron', 'cranberry', 'tomate', 'tout'],
    'vodka_001'
),

(
    'Rhum blanc', 'White Rum', 'spirit', 'cane',
    '[
        {"molecule_id": 15, "molecule_name": "Acétate d''éthyle", "concentration": 70, "aroma": "fruity"},
        {"molecule_id": 16, "molecule_name": "Acétate d''isoamyle", "concentration": 55, "aroma": "banana"},
        {"molecule_id": 17, "molecule_name": "Vanilline", "concentration": 40, "aroma": "vanilla"}
    ]'::jsonb,
    '{"sweet": 5, "sour": 0, "bitter": 1, "umami": 0, "salty": 0}'::jsonb,
    6,
    ARRAY['menthe', 'citron vert', 'sucre de canne', 'ananas'],
    'rum_white_001'
),

(
    'Tequila', 'Tequila', 'spirit', 'agave',
    '[
        {"molecule_id": 20, "molecule_name": "β-Damascenone", "concentration": 65, "aroma": "fruity"},
        {"molecule_id": 21, "molecule_name": "2-Phenylethanol", "concentration": 50, "aroma": "floral"},
        {"molecule_id": 22, "molecule_name": "Linalol", "concentration": 45, "aroma": "citrus floral"}
    ]'::jsonb,
    '{"sweet": 3, "sour": 0, "bitter": 2, "umami": 1, "salty": 0}'::jsonb,
    7,
    ARRAY['citron vert', 'sel', 'pamplemousse', 'jalapeño'],
    'tequila_001'
),

-- AGRUMES
(
    'Citron', 'Lemon', 'fruit', 'citrus',
    '[
        {"molecule_id": 1, "molecule_name": "Limonène", "concentration": 95, "aroma": "lemon"},
        {"molecule_id": 30, "molecule_name": "Citral", "concentration": 85, "aroma": "lemon zest"},
        {"molecule_id": 31, "molecule_name": "γ-Terpinène", "concentration": 40, "aroma": "herbal"}
    ]'::jsonb,
    '{"sweet": 2, "sour": 9, "bitter": 1, "umami": 0, "salty": 0}'::jsonb,
    9,
    ARRAY['gin', 'vodka', 'menthe', 'miel', 'framboise'],
    'lemon_001'
),

(
    'Citron vert', 'Lime', 'fruit', 'citrus',
    '[
        {"molecule_id": 1, "molecule_name": "Limonène", "concentration": 90, "aroma": "lime"},
        {"molecule_id": 30, "molecule_name": "Citral", "concentration": 75, "aroma": "lime zest"},
        {"molecule_id": 32, "molecule_name": "β-Pinène", "concentration": 35, "aroma": "green"}
    ]'::jsonb,
    '{"sweet": 1, "sour": 10, "bitter": 1, "umami": 0, "salty": 0}'::jsonb,
    9,
    ARRAY['rhum', 'tequila', 'menthe', 'gingembre', 'noix de coco'],
    'lime_001'
),

-- HERBES
(
    'Menthe fraîche', 'Fresh Mint', 'herb', 'aromatic',
    '[
        {"molecule_id": 40, "molecule_name": "Menthol", "concentration": 85, "aroma": "mint cool"},
        {"molecule_id": 41, "molecule_name": "Menthone", "concentration": 70, "aroma": "mint"},
        {"molecule_id": 1, "molecule_name": "Limonène", "concentration": 45, "aroma": "citrus"}
    ]'::jsonb,
    '{"sweet": 2, "sour": 0, "bitter": 1, "umami": 1, "salty": 0}'::jsonb,
    9,
    ARRAY['citron vert', 'rhum', 'concombre', 'fraise', 'chocolat'],
    'mint_001'
),

-- MIXERS
(
    'Tonic', 'Tonic Water', 'mixer', 'carbonated',
    '[
        {"molecule_id": 50, "molecule_name": "Quinine", "concentration": 80, "aroma": "bitter"},
        {"molecule_id": 51, "molecule_name": "Acide citrique", "concentration": 60, "aroma": "sour"}
    ]'::jsonb,
    '{"sweet": 5, "sour": 3, "bitter": 7, "umami": 0, "salty": 0}'::jsonb,
    6,
    ARRAY['gin', 'vodka', 'citron', 'concombre'],
    'tonic_001'
),

(
    'Sirop de sucre', 'Simple Syrup', 'mixer', 'sweetener',
    '[
        {"molecule_id": 60, "molecule_name": "Saccharose", "concentration": 100, "aroma": "sweet"}
    ]'::jsonb,
    '{"sweet": 10, "sour": 0, "bitter": 0, "umami": 0, "salty": 0}'::jsonb,
    2,
    ARRAY['tout'],
    'sugar_001'
);


-- ============================================
-- PAIRINGS MOLÉCULAIRES
-- ============================================

INSERT INTO molecular_pairings (
    ingredient_a_id, ingredient_b_id, compatibility_score,
    shared_molecules, synergy_explanation,
    traditional_pairing, validation_method
) VALUES

-- Gin + Citron (Classique - GT, Gin Fizz)
(
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Gin'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Citron'),
    0.875,
    '[
        {"molecule_name": "Limonène", "presence_in_both": true, "synergy_level": "high"}
    ]'::jsonb,
    'Le limonène présent dans le gin (genièvre) et le citron crée une harmonie naturelle. Les notes de pin du gin (pinène) complètent l''acidité du citron.',
    true,
    'repertoire'
),

-- Rhum + Menthe + Citron vert (Mojito)
(
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Rhum blanc'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Menthe fraîche'),
    0.820,
    '[
        {"molecule_name": "Acétate d''éthyle", "creates": "fresh fruity notes"},
        {"molecule_name": "Limonène", "shared": true, "enhances": "citrus freshness"}
    ]'::jsonb,
    'Les esters fruités du rhum (acétate d''isoamyle) s''harmonisent avec le menthol de la menthe. Le limonène commun amplifie la fraîcheur.',
    true,
    'repertoire'
),

-- Vodka + Citron (Très compatible - base neutre)
(
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Vodka'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Citron'),
    0.950,
    '[
        {"explanation": "La neutralité de la vodka permet au limonène du citron de s''exprimer pleinement"}
    ]'::jsonb,
    'La vodka, neutre aromatiquement, agit comme une toile vierge. Elle n''interfère pas avec les molécules du citron, permettant au limonène et au citral de dominer.',
    true,
    'spoonacular'
),

-- Gin + Tonic (LE classique)
(
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Gin'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Tonic'),
    0.915,
    '[
        {"molecule_interaction": "Quinine + Terpènes du gin", "result": "Équilibre amer-aromatique parfait"}
    ]'::jsonb,
    'La quinine du tonic (amertume) contraste harmonieusement avec les terpènes botaniques du gin (limonène, pinène). L''acidité du tonic révèle les notes citronnées.',
    true,
    'repertoire'
),

-- Tequila + Citron vert (Margarita)
(
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Tequila'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Citron vert'),
    0.890,
    '[
        {"shared_molecules": ["Limonène", "Linalol"], "synergy": "Les notes florales de la tequila (2-phenylethanol) se marient avec l''acidité vive du citron vert"}
    ]'::jsonb,
    'Le β-damascenone de la tequila (notes fruitées) et le citral du citron vert créent une synergie. Le linalol (présent dans les deux) harmonise le tout.',
    true,
    'repertoire'
);


-- ============================================
-- COCKTAILS SCIENTIFIQUES
-- ============================================

INSERT INTO cocktails_scientific (
    name, name_en, description, category, style, difficulty,
    molecular_harmony_score, dominant_molecule_families,
    scientific_rationale, key_molecular_interactions,
    prep_time, complexity_level, best_served
) VALUES

(
    'Mojito', 'Mojito', 
    'Le classique cubain rafraîchissant à base de rhum, menthe et citron vert.',
    'classic', 'muddled', 'facile',
    0.875,
    ARRAY['Terpènes', 'Esters', 'Aldéhydes'],
    'Le Mojito fonctionne grâce à la synergie entre trois familles moléculaires : les esters fruités du rhum (acétate d''isoamyle), le menthol de la menthe, et le limonène/citral du citron vert. Ces molécules partagent des structures aromatiques qui activent les mêmes récepteurs olfactifs, créant une harmonie rafraîchissante.',
    ARRAY[
        'Menthol (menthe) + Limonène (citron vert) = Fraîcheur amplifiée',
        'Acétate d''isoamyle (rhum) + Menthone (menthe) = Notes fruitées-herbacées',
        'Sucre + Acidité citrique = Équilibre gustatif'
    ],
    5, 3, 'aperitif'
),

(
    'Gin Tonic', 'Gin & Tonic',
    'L''accord parfait entre gin botanique et tonic amer.',
    'classic', 'highball', 'facile',
    0.920,
    ARRAY['Terpènes', 'Aldéhydes'],
    'Le Gin Tonic illustre parfaitement le principe du contraste harmonieux. La quinine du tonic (amertume complexe) entre en résonance avec les terpènes du gin (limonène du genièvre, pinène). Ces molécules partagent des structures cycliques similaires qui créent un équilibre amer-aromatique sophistiqué.',
    ARRAY[
        'Quinine (tonic) + Pinène (gin) = Complexité amère-résineuse',
        'Limonène (gin) + Citral (citron) = Notes citronnées amplifiées',
        'CO2 (bulles) + Terpènes volatils = Libération aromatique optimale'
    ],
    3, 2, 'aperitif'
),

(
    'Margarita', 'Margarita',
    'Le cocktail mexicain emblématique, équilibre parfait entre doux, acide et salé.',
    'classic', 'sour', 'moyen',
    0.890,
    ARRAY['Terpènes', 'Esters', 'Phénols'],
    'La Margarita démontre l''art de l''équilibre moléculaire. Le β-damascenone de la tequila (fruité) se marie avec le citral du citron vert (acidité citronnée). Le sel amplifie la perception des arômes en stimulant les récepteurs gustatifs. Le triple sec ajoute des notes d''écorce d''orange (limonène) qui harmonisent l''ensemble.',
    ARRAY[
        'β-Damascenone (tequila) + Citral (citron vert) = Fruité-acidulé',
        'Linalol (tequila) + Limonène (triple sec) = Harmonie florale-citronnée',
        'NaCl (sel) + Acide citrique = Exaltation des saveurs'
    ],
    7, 4, 'aperitif'
);


-- ============================================
-- INGRÉDIENTS PAR COCKTAIL
-- ============================================

-- MOJITO
INSERT INTO cocktail_ingredients (
    cocktail_id, ingredient_id, quantity, unit, quantity_display, role, preparation_order
) VALUES
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Rhum blanc'),
    50, 'ml', '50ml', 'base', 3
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Citron vert'),
    25, 'ml', '25ml (1 citron)', 'modifier', 2
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Menthe fraîche'),
    10, 'leaves', '10 feuilles', 'accent', 1
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Sirop de sucre'),
    20, 'ml', '20ml', 'modifier', 2
);

-- GIN TONIC
INSERT INTO cocktail_ingredients (
    cocktail_id, ingredient_id, quantity, unit, quantity_display, role, preparation_order
) VALUES
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Gin Tonic'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Gin'),
    50, 'ml', '50ml', 'base', 1
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Gin Tonic'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Tonic'),
    150, 'ml', '150ml', 'modifier', 2
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Gin Tonic'),
    (SELECT ingredient_id FROM ingredients_molecular WHERE name = 'Citron'),
    1, 'slice', '1 tranche', 'garnish', 3
);


-- ============================================
-- INSTRUCTIONS
-- ============================================

-- MOJITO
INSERT INTO cocktail_instructions (
    cocktail_id, step_number, instruction_text, technique, duration, scientific_reason
) VALUES
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    1,
    'Dans un verre, écrase doucement les feuilles de menthe avec le sucre',
    'muddle', 15,
    'Le muddling libère les cellules végétales de la menthe, permettant au menthol et à la menthone de s''échapper. Le sucre agit comme abrasif doux et aide à extraire les huiles essentielles.'
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    2,
    'Ajoute le jus de citron vert frais',
    'add', 5,
    'L''acide citrique du citron vert (pH ~2) préserve la couleur verte de la menthe en stabilisant la chlorophylle.'
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    3,
    'Verse le rhum blanc',
    'add', 5,
    'Le rhum apporte ses esters fruités (acétate d''isoamyle) qui se mélangent avec les terpènes de la menthe.'
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    4,
    'Remplis le verre de glace pilée',
    'add', 5,
    'La glace pilée augmente la surface de contact, refroidissant rapidement le cocktail tout en diluant légèrement pour équilibrer les saveurs.'
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    5,
    'Complète avec de l''eau gazeuse',
    'top', 5,
    'Le CO2 de l''eau gazeuse aide à volatiliser les molécules aromatiques, amplifiant la perception olfactive. L''effervescence rafraîchit également.'
),
(
    (SELECT cocktail_id FROM cocktails_scientific WHERE name = 'Mojito'),
    6,
    'Décore avec une branche de menthe',
    'garnish', 5,
    'La branche de menthe continue de libérer des arômes, créant une expérience olfactive qui précède et accompagne la dégustation.'
);
```

---

## 🔌 INTÉGRATION DES APIs

### Configuration des APIs externes :

```javascript
// api-config.js

const API_KEYS = {
    flavordb: process.env.FLAVORDB_API_KEY,
    spoonacular: process.env.SPOONACULAR_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY
};

const API_ENDPOINTS = {
    flavordb: {
        base: 'https://cosylab.iiitd.edu.in/flavordb/api',
        search: '/search_compound',
        pairing: '/pairing_prediction'
    },
    spoonacular: {
        base: 'https://api.spoonacular.com',
        ingredients: '/food/ingredients',
        pairing: '/food/ingredients/{id}/information',
        taste: '/recipes/{id}/tasteWidget.json'
    }
};

module.exports = { API_KEYS, API_ENDPOINTS };
```

---

## 📊 Utilisation dans l'app

### Endpoint enrichi avec science moléculaire :

```javascript
// api/analyze-with-science.js

export default async function handler(req, res) {
    const { image } = req.body;
    
    // 1. Détection ingrédients (Claude Vision)
    const detectedIngredients = await detectIngredients(image);
    
    // 2. Enrichissement moléculaire (FlavorDB + notre DB)
    const enrichedIngredients = await enrichWithMolecularData(detectedIngredients);
    
    // 3. Calcul des compatibilités
    const pairings = await calculateMolecularPairings(enrichedIngredients);
    
    // 4. Suggestion cocktails avec scores scientifiques
    const cocktails = await suggestScientificCocktails(enrichedIngredients, pairings);
    
    return res.json({
        ingredients: enrichedIngredients,
        molecular_analysis: pairings,
        cocktails: cocktails
    });
}
```

---

Cette base de données est prête à être enrichie avec les données extraites de ton PDF !
```
