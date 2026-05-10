-- Add language column to profiles table
alter table profiles add column language varchar(2) not null default 'EN';

-- Add language column to sessions table
alter table sessions add column language varchar(2) not null default 'EN';
