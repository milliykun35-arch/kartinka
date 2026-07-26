-- Adminlar jadvali
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS yoqish
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Faqat service role o'qiy oladi
CREATE POLICY "Service role can manage admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Birinchi admin qo'shish (sign up qilganingizdan keyin email'ingizni qo'shing)
-- INSERT INTO admins (email) VALUES ('your-email@example.com');
