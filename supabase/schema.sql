-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (synced from Memberstack)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memberstack_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student threads table
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for chat history
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('teacher', 'ai')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curriculum vectors table for embeddings
CREATE TABLE curriculum_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB,
  source_url TEXT,
  grade_level TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_vectors ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = memberstack_id);

-- Teachers can only see their own threads
CREATE POLICY "Teachers can view own threads" ON threads
  FOR ALL USING (teacher_id IN (
    SELECT id FROM users WHERE memberstack_id = auth.uid()::text
  ));

-- Teachers can only see messages from their threads
CREATE POLICY "Teachers can view own thread messages" ON messages
  FOR ALL USING (thread_id IN (
    SELECT t.id FROM threads t
    JOIN users u ON t.teacher_id = u.id
    WHERE u.memberstack_id = auth.uid()::text
  ));

-- Curriculum vectors are readable by all authenticated users
CREATE POLICY "Authenticated users can read curriculum" ON curriculum_vectors
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_threads_teacher_id ON threads(teacher_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_curriculum_vectors_embedding ON curriculum_vectors USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_curriculum_vectors_grade ON curriculum_vectors(grade_level);
CREATE INDEX idx_curriculum_vectors_subject ON curriculum_vectors(subject);

-- Function to search similar curriculum content
CREATE OR REPLACE FUNCTION match_curriculum_vectors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    curriculum_vectors.id,
    curriculum_vectors.content,
    curriculum_vectors.metadata,
    1 - (curriculum_vectors.embedding <=> query_embedding) AS similarity
  FROM curriculum_vectors
  WHERE 1 - (curriculum_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY curriculum_vectors.embedding <=> query_embedding
  LIMIT match_count;
$$;
