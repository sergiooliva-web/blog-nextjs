BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,             
    title TEXT NOT NULL,                   
    description TEXT,                      
    content TEXT,                          
    date TEXT DEFAULT CURRENT_TIMESTAMP, 
    author TEXT DEFAULT 'Anonymous',

    CONSTRAINT uq_post_slug
        UNIQUE (slug),

    CONSTRAINT ck_post_slug_length_is_bigger_then_3
        CHECK(length(slug) > 3),

    CONSTRAINT ck_post_title_length_is_bigger_then_0
        CHECK(length(title) > 5)

) STRICT;

INSERT INTO posts (slug, title, description, content, date, author) VALUES 
('hello-world', 'Hello World!', 'Мой первый пост в блоге', 'Это мой первый пост! Добро пожаловать в мой блог! Здесь я буду делиться своими мыслями и идеями.', '2024-01-15 00:00:00', 'Иван'),
('nextjs-tutorial', 'Изучаем Next.js', 'Полное руководство по Next.js', 'Next.js - это мощный фреймворк для React, который позволяет создавать серверные и статические приложения. В этом посте мы рассмотрим основные возможности.', '2024-01-20 00:00:00', 'Петр'),
('query', 'Метод QUERY', 'Метод QUERY — это новый стандартный HTTP-метод (утвержден в июне 2026 года), созданный специально для безопасного чтения сложных данных.', 'Он объединяет сильные стороны GET и POST:\n   1. Безопасен как GET: Он только считывает данные и не изменяет состояние на сервере. Его ответы можно кэшировать.\n   2. Вместителен как POST: Он позволяет передавать огромные и сложные фильтры (например, JSON) внутри тела запроса (Body), а не через URL-строку.\n   Зачем он нужен?\n   Раньше для отправки сложных фильтров приходилось использовать POST, что нарушало правила REST API, так как POST должен создавать ресурсы. \n   Метод QUERY решает эту проблему, позволяя делать «тяжелые» запросы на чтение данных красиво и правильно.', '2026-07-13 00:00:00', '');

COMMIT;