-- Создание таблицы sprints
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    goal TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Добавление индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_sprints_child_id ON public.sprints(child_id);
CREATE INDEX IF NOT EXISTS idx_sprints_is_active ON public.sprints(is_active);
CREATE INDEX IF NOT EXISTS idx_sprints_child_active ON public.sprints(child_id, is_active);

-- Добавление поля sprint_id в таблицу tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;

-- Добавление индекса для sprint_id в tasks
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON public.tasks(sprint_id);

-- Включение Row Level Security (RLS)
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать спринты
CREATE POLICY "Enable read access for all users" ON public.sprints
    FOR SELECT USING (true);

-- Политика: все могут создавать спринты
CREATE POLICY "Enable insert access for all users" ON public.sprints
    FOR INSERT WITH CHECK (true);

-- Политика: все могут обновлять спринты
CREATE POLICY "Enable update access for all users" ON public.sprints
    FOR UPDATE USING (true);

-- Политика: все могут удалять спринты
CREATE POLICY "Enable delete access for all users" ON public.sprints
    FOR DELETE USING (true);

-- Комментарии для документации
COMMENT ON TABLE public.sprints IS 'Таблица для хранения недельных спринтов для детей';
COMMENT ON COLUMN public.sprints.id IS 'Уникальный идентификатор спринта';
COMMENT ON COLUMN public.sprints.child_id IS 'ID ребёнка, к которому относится спринт';
COMMENT ON COLUMN public.sprints.name IS 'Название спринта';
COMMENT ON COLUMN public.sprints.start_date IS 'Дата начала спринта';
COMMENT ON COLUMN public.sprints.end_date IS 'Дата окончания спринта';
COMMENT ON COLUMN public.sprints.goal IS 'Цель спринта (необязательно)';
COMMENT ON COLUMN public.sprints.is_active IS 'Флаг активного спринта';
COMMENT ON COLUMN public.sprints.created_at IS 'Дата создания записи';
