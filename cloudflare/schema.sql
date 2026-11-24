create table if not exists visits (day text primary key, n integer not null);
create table if not exists messages (id integer primary key autoincrement, at text not null, name text not null, email text not null, message text not null, read integer not null default 0);
create table if not exists chats (id integer primary key autoincrement, at text not null, session text not null, role text not null, text text not null);
create index if not exists chats_session on chats (session, id);
create table if not exists hits (key text primary key, n integer not null, until integer not null);
