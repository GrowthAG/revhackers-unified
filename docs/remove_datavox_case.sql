-- Remove Datavox Case Study
DELETE FROM cases WHERE client_name ILIKE '%Datavox%' OR slug = 'datavox';
