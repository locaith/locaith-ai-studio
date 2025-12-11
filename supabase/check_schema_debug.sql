-- CHECK SCHEMA AND POLICIES
-- Run this to see the current state of tables and columns
SELECT 
    table_name, 
    column_name, 
    data_type, 
    udt_name
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name IN ('messages', 'groups', 'group_members', 'appointments')
ORDER BY 
    table_name, column_name;

-- Check existing policies
SELECT 
    tablename, 
    policyname,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    schemaname = 'public'
    AND tablename IN ('messages', 'groups', 'group_members', 'appointments');
