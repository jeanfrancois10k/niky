-- =============================================
-- SCRIPT SQL - Niky Chemical Product (NCP)
-- Version Idempotente (Peut être exécutée plusieurs fois sans erreur)
-- =============================================

-- 1. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_desc TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  category TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE FORMATIONS
CREATE TABLE IF NOT EXISTS trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  full_description TEXT,
  objectives TEXT[] DEFAULT '{}',
  date_start DATE,
  date_end DATE,
  location TEXT,
  max_seats INTEGER DEFAULT 20,
  current_seats INTEGER DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE COMMANDES
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','delivered','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE INSCRIPTIONS FORMATIONS
CREATE TABLE IF NOT EXISTS training_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
  training_title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  city TEXT DEFAULT 'Port-au-Prince',
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'moncash',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SÉCURITÉ (RLS - Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inscriptions visibles publiquement" ON training_registrations;
CREATE POLICY "Inscriptions visibles publiquement" ON training_registrations
  FOR ALL USING (true) WITH CHECK (true);

-- Politiques de sécurité (Suppression préalable si déjà existante)
DROP POLICY IF EXISTS "Produits visibles publiquement" ON products;
CREATE POLICY "Produits visibles publiquement" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Formations visibles publiquement" ON trainings;
CREATE POLICY "Formations visibles publiquement" ON trainings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tout le monde peut passer commande" ON orders;
CREATE POLICY "Tout le monde peut passer commande" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lecture des commandes" ON orders;
CREATE POLICY "Lecture des commandes" ON orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des produits par admin" ON products;
CREATE POLICY "Gestion des produits par admin" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 5. INSERTION DES DONNÉES INITIALES (Produits)
-- =============================================
INSERT INTO products (name, slug, description, short_desc, price, stock, unit, category, images, is_active) VALUES
('Texapon N70 (SLES)', 'texapon-n70', 'Le Texapon N70 est un tensioactif anionique très utilisé dans la fabrication de détergents liquides, de shampoings et de savons liquides.', 'Tensioactif très moussant pour savons et détergents.', 3500, 250, 'kg', 'Bases Lavantes', ARRAY['https://images.unsplash.com/photo-1611079830811-865ff4428d17?q=80&w=1000&auto=format&fit=crop'], true),
('Comperlan KD', 'comperlan-kd', 'Épaississant et stabilisateur de mousse idéal pour les préparations cosmétiques et les détergents.', 'Épaississant et stabilisateur de mousse.', 4200, 120, 'kg', 'Épaississants', ARRAY['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop'], true),
('Acide Sulfonique', 'acide-sulfonique', 'Matière première de base pour la fabrication de détergents liquides et en poudre. Fort pouvoir dégraissant.', 'Base détergente à fort pouvoir dégraissant.', 2800, 0, 'litre', 'Bases Lavantes', ARRAY['https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1000&auto=format&fit=crop'], true),
('Fragrance (Parfum Citron)', 'fragrance-citron', 'Fragrance concentrée de citron pour détergents et nettoyants multi-surfaces.', 'Fragrance concentrée de citron.', 15000, 20, 'litre', 'Parfums', ARRAY['https://images.unsplash.com/photo-1596755490729-37bd51c144bb?q=80&w=1000&auto=format&fit=crop'], true),
('Pasta', 'pasta', 'Matière première essentielle pour la fabrication de détergents.', 'Idéal pour les détergents.', 3000, 100, 'kg', 'Bases Lavantes', ARRAY['https://images.unsplash.com/photo-1611079830811-865ff4428d17?q=80&w=1000&auto=format&fit=crop'], true),
('Nonil Fenol', 'nonil-fenol', 'Tensioactif non ionique utilisé dans diverses formulations chimiques.', 'Tensioactif non ionique.', 4500, 50, 'litre', 'Tensioactifs', ARRAY['https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1000&auto=format&fit=crop'], true),
('Glycérine', 'glycerine', 'Agent hydratant très utilisé dans les produits cosmétiques et savons.', 'Agent hydratant cosmétique.', 2500, 200, 'litre', 'Bases Lavantes', ARRAY['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop'], true),
('Amonio', 'amonio', 'Composé chimique utilisé pour les produits d''entretien ménager.', 'Pour produits d''entretien.', 1800, 120, 'litre', 'Conservateurs', ARRAY['https://images.unsplash.com/photo-1585644158404-3677b10c660f?q=80&w=1000&auto=format&fit=crop'], true),
('Acetona', 'acetona', 'Solvant puissant pour diverses applications industrielles.', 'Solvant industriel.', 3200, 60, 'litre', 'Bases Lavantes', ARRAY['https://images.unsplash.com/photo-1610364841687-393282eb1102?q=80&w=1000&auto=format&fit=crop'], true),
('Plantarin', 'plantarin', 'Tensioactif doux d''origine végétale pour cosmétiques naturels.', 'Tensioactif végétal doux.', 5500, 40, 'kg', 'Tensioactifs', ARRAY['https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1000&auto=format&fit=crop'], true),
('Betaina', 'betaina', 'Tensioactif amphotère très doux, idéal pour les shampoings.', 'Tensioactif doux pour shampoings.', 4800, 75, 'kg', 'Tensioactifs', ARRAY['https://images.unsplash.com/photo-1611079830811-865ff4428d17?q=80&w=1000&auto=format&fit=crop'], true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_desc = EXCLUDED.short_desc,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  unit = EXCLUDED.unit,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  is_active = EXCLUDED.is_active;

-- =============================================
-- 6. INSERTION DES FORMATIONS INITIALES
-- =============================================
INSERT INTO trainings (title, slug, description, full_description, objectives, date_start, date_end, location, max_seats, current_seats, price, image, is_active) VALUES
(
  'Fabrication de Savon Liquide et Détergent',
  'savon-liquide',
  'Apprenez les techniques professionnelles pour fabriquer du savon liquide et des détergents de haute qualité de A à Z.',
  'Cette formation de 3 jours couvre toutes les étapes de la fabrication de détergents liquides. Vous apprendrez à manipuler les matières premières (Texapon, Acide Sulfonique), à équilibrer le pH, et à créer des formules stables et performantes.',
  ARRAY['Comprendre les différents types de tensioactifs', 'Formuler un savon liquide multi-usages', 'Mesurer et ajuster le pH', 'Techniques de conservation et d''ajout de parfum'],
  '2026-06-15', '2026-06-17',
  'Centre de formation NCP, Pétion-Ville, Haïti',
  20, 5, 75000,
  'https://images.unsplash.com/photo-1585644158404-3677b10c660f?q=80&w=1000&auto=format&fit=crop',
  true
),
(
  'Cosmétique Naturelle : Lait de corps',
  'cosmetique-lait-corps',
  'Formation pratique sur la formulation et la fabrication de laits corporels hydratants et éclaircissants.',
  'Découvrez les secrets de l''émulsion pour créer des crèmes et laits corporels de qualité professionnelle. Une formation 100% pratique encadrée par des chimistes expérimentés.',
  ARRAY['Maîtriser les émulsions eau dans huile et huile dans eau', 'Choix des conservateurs adaptés', 'Incorporation d''actifs naturels'],
  '2026-07-05', '2026-07-06',
  'Centre de formation NCP, Pétion-Ville, Haïti',
  15, 15, 50000,
  'https://images.unsplash.com/photo-1611079830811-865ff4428d17?q=80&w=1000&auto=format&fit=crop',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  full_description = EXCLUDED.full_description,
  objectives = EXCLUDED.objectives,
  date_start = EXCLUDED.date_start,
  date_end = EXCLUDED.date_end,
  location = EXCLUDED.location,
  max_seats = EXCLUDED.max_seats,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  is_active = EXCLUDED.is_active;
