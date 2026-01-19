-- Migration: Fix exchanges notifications and profiles
-- Date: 2026-01-19
-- Description: Agregar tipos de notificación para intercambios

-- ============================================
-- NOTIFICATIONS TABLE - Add Exchange Types
-- ============================================

-- Primero, eliminar el constraint existente
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_type;

-- Agregar el nuevo constraint con todos los tipos incluyendo exchanges
ALTER TABLE notifications ADD CONSTRAINT valid_notification_type CHECK (
  type IN (
    'booking_created',
    'booking_validated_seller',
    'booking_validated_buyer',
    'booking_completed',
    'booking_cancelled',
    'exchange_proposed',
    'exchange_accepted',
    'exchange_rejected',
    'exchange_completed',
    'exchange_cancelled'
  )
);

-- ============================================
-- PROFILES TABLE - Verify/Add avatar_url
-- ============================================

-- Agregar avatar_url si no existe (algunos proyectos usan avatar_url en lugar de image_url)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON CONSTRAINT valid_notification_type ON notifications IS 'Tipos de notificación válidos incluyendo intercambios';
