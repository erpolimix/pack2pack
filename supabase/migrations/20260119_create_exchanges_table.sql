-- Migration: Create exchanges table for pack swaps
-- Date: 2026-01-19
-- Description: Sistema de intercambio directo de packs entre usuarios

-- ============================================
-- EXCHANGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Packs involucrados
  pack_offered_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE, -- Pack que ofrece el solicitante
  pack_requested_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE, -- Pack que quiere el solicitante
  
  -- Usuarios
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Quien propone el intercambio
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Dueño del pack solicitado
  
  -- Estado del intercambio
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  
  -- Información de encuentro
  selected_time_window TEXT, -- Franja horaria acordada
  exchange_code VARCHAR(6), -- Código único de validación (6 dígitos)
  
  -- Validaciones (ambos deben validar para completar)
  validated_by_requester BOOLEAN DEFAULT FALSE,
  validated_by_owner BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMPTZ,
  
  -- Mensajes
  requester_message TEXT, -- Mensaje inicial del solicitante
  owner_response TEXT, -- Respuesta del dueño
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days', -- Propuesta expira en 7 días
  
  -- Constraints
  CONSTRAINT different_users CHECK (requester_id != owner_id),
  CONSTRAINT different_packs CHECK (pack_offered_id != pack_requested_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_exchanges_requester_id ON exchanges(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_owner_id ON exchanges(owner_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);
CREATE INDEX IF NOT EXISTS idx_exchanges_pack_offered ON exchanges(pack_offered_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_pack_requested ON exchanges(pack_requested_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_status_expires ON exchanges(status, expires_at) WHERE status = 'pending';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios intercambios (como solicitante o dueño)
CREATE POLICY "Users can view exchanges where they participate"
  ON exchanges FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Solo pueden crear propuestas si son el requester
CREATE POLICY "Users can create exchange proposals"
  ON exchanges FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Pueden actualizar sus propios intercambios
CREATE POLICY "Users can update their exchanges"
  ON exchanges FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Función para generar código de 6 dígitos automáticamente
CREATE OR REPLACE FUNCTION generate_exchange_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.exchange_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar código automáticamente
CREATE TRIGGER set_exchange_code_before_insert
  BEFORE INSERT ON exchanges
  FOR EACH ROW
  EXECUTE FUNCTION generate_exchange_code();

-- Función para actualizar timestamp updated_at
CREATE OR REPLACE FUNCTION update_exchanges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_exchanges_updated_at_trigger
  BEFORE UPDATE ON exchanges
  FOR EACH ROW
  EXECUTE FUNCTION update_exchanges_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE exchanges IS 'Registro de intercambios directos de packs entre usuarios';
COMMENT ON COLUMN exchanges.pack_offered_id IS 'Pack que ofrece el solicitante del intercambio';
COMMENT ON COLUMN exchanges.pack_requested_id IS 'Pack que solicita el requester';
COMMENT ON COLUMN exchanges.exchange_code IS 'Código de 6 dígitos para validación en el encuentro';
COMMENT ON COLUMN exchanges.validated_by_requester IS 'El solicitante validó el intercambio';
COMMENT ON COLUMN exchanges.validated_by_owner IS 'El dueño validó el intercambio';
COMMENT ON COLUMN exchanges.expires_at IS 'Fecha de expiración de la propuesta (7 días)';
