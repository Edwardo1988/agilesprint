-- ==================================================
-- Добавление эмодзи-аватаров для детей
-- ==================================================

-- Добавляем поле avatar_emoji в таблицу children
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT NULL;

-- Комментарий
COMMENT ON COLUMN public.children.avatar_emoji IS 'Эмодзи для аватара ребёнка (может быть NULL)';

-- Проверка
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'children'
AND column_name = 'avatar_emoji';

-- ==================================================
-- Миграция завершена! ✅
-- ==================================================
