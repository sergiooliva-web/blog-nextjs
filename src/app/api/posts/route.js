// ============================================================
// API МАРШРУТ: /api/posts
// ============================================================
// Этот файл обрабатывает все HTTP-запросы к эндпоинту /api/posts
// Поддерживает: GET, POST, DELETE, PUT, PATCH
// ============================================================

// 📦 Импорт утилиты Next.js для создания HTTP-ответов в формате JSON
// NextResponse.json() - сокращение для создания ответов с JSON-телом
import { NextResponse } from 'next/server';

// ============================================================
// 📝 POST /api/posts - СОЗДАНИЕ НОВОГО ПОСТА
// ============================================================
// Назначение: Сохраняет новый пост в posts.json
// Тело запроса: { title, slug, description, content }
// Успешный ответ: 201 Created { success: true, post: {...} }
// Ошибка: 400 Bad Request или 500 Internal Server Error
// ============================================================
export async function POST(request) {
  try {
    // 1️⃣ Извлекаем данные из тела запроса (JSON → объект)
    const body = await request.json();
    const { title, slug, description, content, author } = body;
    
    // 2️⃣ ВАЛИДАЦИЯ: проверяем наличие обязательных полей
    // title - заголовок поста
    // slug - URL-адрес поста (например: "hello-world")
    // content - содержимое поста
    if (!title || !slug || !content) {
      // ❌ Возвращаем ошибку 400 (Bad Request) с пояснением
      return NextResponse.json(
        { error: 'Заголовок, URL и содержание обязательны' },
        { status: 400 } // HTTP статус: неверный запрос
      );
    }

    // 3️⃣ ВАЛИДАЦИЯ: проверяем slug на допустимые символы
    // Регулярное выражение: ^[a-z0-9-]+$
    // ^ - начало строки
    // [a-z0-9-] - разрешены: строчные латинские буквы, цифры, дефис
    // + - один или более символов
    // $ - конец строки
    // Примеры валидных slug: "hello-world", "my-post-123"
    // Примеры невалидных: "Hello World", "post@123", "hello world"
    if (!/^[a-z0-9-]+$/.test(slug)) {
      // ❌ Возвращаем ошибку 400 (Bad Request)
      return NextResponse.json(
        { error: 'URL может содержать только строчные буквы, цифры и дефисы' },
        { status: 400 }
      );
    }
    const { addPost } = await import('@/lib/repositories/posts_repository');
    // 4️⃣ СОХРАНЕНИЕ: вызываем функцию addPost() из lib/posts.js
    // Что делает addPost():
    // - Генерирует новый уникальный ID
    // - Добавляет текущую дату (date)
    // - Добавляет автора (author)
    // - Сохраняет пост в src/data/posts.json
    // - Возвращает созданный объект поста
    const newPost = await addPost({ slug, title, description, content, author });
    
    revalidatePath('/posts');
    // 5️⃣ УСПЕШНЫЙ ОТВЕТ: возвращаем созданный пост
    // Статус 201 (Created) - ресурс успешно создан
    return NextResponse.json({ 
      success: true,  // Флаг успешной операции
      post: newPost   // Данные созданного поста
    }, { status: 201 });
    
  } catch (error) {
    // 6️⃣ ОБРАБОТКА ОШИБОК: что-то пошло не так
    // Примеры: ошибка записи в файл, недостаточно прав, диск полон
    console.error('API Error:', error); // Логируем в консоль для отладки
    
    // Возвращаем ошибку 500 (Internal Server Error)
    return NextResponse.json(
      { error: 'Ошибка при создании поста' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/posts - ПОЛУЧЕНИЕ ВСЕХ ПОСТОВ
// ============================================================
// Назначение: Возвращает массив всех постов из posts.json
// Успешный ответ: 200 OK { posts: [...] }
// Ошибка: 500 Internal Server Error
// ============================================================
export async function GET() {
  try {
    // ДИНАМИЧЕСКИЙ ИМПОРТ: загружаем функцию getAllPosts
    // Используем динамический импорт для оптимизации загрузки
    // Обычный импорт: import { getAllPosts } from '@/lib/posts'
    // Динамический импорт: загружается только когда нужен
    const { getAllPosts } = await import('@/lib/repositories/posts_repository');
    
    // ПОЛУЧЕНИЕ ДАННЫХ: читаем все посты из JSON-файла
    // getAllPosts() возвращает массив объектов постов
    const posts = await getAllPosts();
    
    // УСПЕШНЫЙ ОТВЕТ: возвращаем список постов
    // Статус 200 (OK) - запрос выполнен успешно
    return NextResponse.json({ posts });
    
  } catch (error) {
    // ОБРАБОТКА ОШИБОК: проблема с чтением файла
    // Возвращаем ошибку 500 (Internal Server Error)
    return NextResponse.json(
      { error: 'Ошибка при получении постов' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/posts - УДАЛЕНИЕ ПОСТА
// ============================================================
// Назначение: Удаляет пост из posts.json по ID
// Тело запроса: { id: "1" }
// Успешный ответ: 200 OK { success: true }
// Ошибка: 404 Not Found или 500 Internal Server Error
// ============================================================
export async function DELETE(request) {
  try {
    // ИМПОРТ: загружаем функцию deletePost
    const { deletePost } = await import('@/lib/repositories/posts_repository');
    
    // ПАРСИМ: извлекаем ID из тела запроса
    const body = await request.json();
    const { id } = body; // ID поста для удаления
    
    // УДАЛЕНИЕ: вызываем deletePost() из lib/posts.js
    // deletePost() возвращает:
    // - true - если пост успешно удален
    // - false - если пост с таким ID не найден
    const deleted = await deletePost(id);
    
    // ПРОВЕРКА: если пост не найден - возвращаем 404
    if (!deleted) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 } // HTTP статус: не найдено
      );
    }

    // УСПЕШНЫЙ ОТВЕТ: пост удален
    return NextResponse.json({ success: true });
    
  } catch (error) {
    // ОБРАБОТКА ОШИБОК: проблема с удалением
    return NextResponse.json(
      { error: 'Ошибка при удалении поста' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/posts - ПОЛНОЕ ОБНОВЛЕНИЕ ПОСТА
// ============================================================
// Назначение: Заменяет все данные поста по ID (полное обновление)
// Тело запроса: { id: "1", title, slug, content }
// Успешный ответ: 200 OK { success: true, post: {...} }
// Ошибка: 404 Not Found или 500 Internal Server Error
// ============================================================
export async function PUT(request) {
  try {
    // ИМПОРТ: загружаем функцию updatePost
    const { updatePost } = await import('@/lib/repositories/posts_repository');
    
    // ПАРСИМ: извлекаем данные из тела запроса
    const body = await request.json();
    const { id, title, slug, content } = body;
    
    // ОБНОВЛЕНИЕ: вызываем updatePost() с новыми данными
    // updatePost() находит пост по ID и заменяет его данные
    // Возвращает обновленный пост или null если не найден
    const updatedPost = await updatePost(id, { title, slug, content });
    
    // ПРОВЕРКА: если пост не найден - возвращаем 404
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      );
    }

    // УСПЕШНЫЙ ОТВЕТ: возвращаем обновленный пост
    return NextResponse.json({ 
      success: true, 
      post: updatedPost 
    });
    
  } catch (error) {
    // ОБРАБОТКА ОШИБОК
    return NextResponse.json(
      { error: 'Ошибка при обновлении поста' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/posts - ЧАСТИЧНОЕ ОБНОВЛЕНИЕ ПОСТА
// ============================================================
// Назначение: Обновляет только указанные поля поста по ID
// Тело запроса: { id: "1", title: "Новый заголовок" }
// Успешный ответ: 200 OK { success: true, post: {...} }
// Ошибка: 404 Not Found или 500 Internal Server Error
// ============================================================
export async function PATCH(request) {
  try {
    //  ИМПОРТ: загружаем функцию updatePost
    const { updatePost } = await import('@/lib/repositories/posts_repository');
    
    // ПАРСИМ: извлекаем ID и данные для обновления
    const body = await request.json();
    const { id, ...updateData } = body;
    // ...updateData - собирает все остальные поля в объект
    // Например: { id: "1", title: "Новый заголовок", description: "Новое описание" }
    
    // ОБНОВЛЕНИЕ: передаем только поля, которые нужно изменить
    // В отличие от PUT, PATCH обновляет только переданные поля
    const updatedPost = await updatePost(id, updateData);
    
    // ПРОВЕРКА: если пост не найден - возвращаем 404
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      );
    }
    
    // УСПЕШНЫЙ ОТВЕТ: возвращаем обновленный пост
    return NextResponse.json({ 
      success: true, 
      post: updatedPost 
    });
    
  } catch (error) {
    // ОБРАБОТКА ОШИБОК
    return NextResponse.json(
      { error: 'Ошибка при обновлении поста' },
      { status: 500 }
    );
  }
}