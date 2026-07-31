-- Update guru profile data

UPDATE profiles
SET 
  jawatan = 'Guru',
  opsyen = 'Sains'
WHERE id = 'e154248a-e65a-480e-9d52-5d5d58344bf0';

-- Verify update
SELECT id, role, jawatan, opsyen 
FROM profiles
WHERE id = 'e154248a-e65a-480e-9d52-5d5d58344bf0';