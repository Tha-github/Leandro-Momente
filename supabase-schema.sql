-- =============================================================================
-- LEANDRO MOMENTE — Schema Supabase
-- Execute este arquivo no SQL Editor do painel Supabase
-- (menu lateral: SQL Editor > New query > cole e execute)
-- =============================================================================

-- 1. Tabela principal de notícias
CREATE TABLE IF NOT EXISTS noticias (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            text UNIQUE NOT NULL,
  titulo          text NOT NULL,
  resumo          text,
  conteudo        text,
  imagem_capa     text,
  categoria       text DEFAULT 'Geral',
  autor           text DEFAULT 'Leandro Momente',
  data_publicacao date,
  tempo_leitura   text,
  destaque        boolean DEFAULT false,
  publicado       boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 2. Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_noticias_updated_at
BEFORE UPDATE ON noticias
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Row Level Security
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- Leitura pública: apenas artigos publicados
CREATE POLICY "leitura_publica" ON noticias
  FOR SELECT
  USING (publicado = true);

-- Admin autenticado: acesso total
CREATE POLICY "admin_full_access" ON noticias
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- 4. Bucket de imagens (execute na aba Storage ou via SQL abaixo)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens', 'imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública das imagens
CREATE POLICY "imagens_leitura_publica" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'imagens');

-- Upload apenas para usuários autenticados
CREATE POLICY "imagens_upload_admin" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagens' AND auth.role() = 'authenticated');

-- Exclusão apenas para usuários autenticados
CREATE POLICY "imagens_delete_admin" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagens' AND auth.role() = 'authenticated');

-- =============================================================================
-- 5. Usuário admin
-- Crie o usuário pelo painel: Authentication > Users > Invite User
-- Use o e-mail e senha que o cliente usará para acessar o painel.
-- =============================================================================
