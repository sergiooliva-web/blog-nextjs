// src/app/api/posts/route.js
import { NextResponse } from 'next/server';
import { postsRepository } from '@/lib/repositories/posts_repository';

// ============================================================
// GET /api/posts
// ============================================================
export async function GET() {
  try {
    const posts = await postsRepository.getAllPosts();
    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении постов' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/posts
// ============================================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, slug, description, content, author } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Заголовок, URL и содержание обязательны' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'URL может содержать только строчные буквы, цифры и дефисы' },
        { status: 400 }
      );
    }

    const newPost = await postsRepository.addPost({
      slug,
      title,
      description,
      content,
      author: author || 'Anonymous',
    });

    return NextResponse.json({
      success: true,
      post: newPost,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании поста' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/posts
// ============================================================
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID поста обязателен' },
        { status: 400 }
      );
    }

    const deleted = await postsRepository.deletePost(Number(id));

    if (!deleted) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/posts error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении поста' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/posts
// ============================================================
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, slug, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID поста обязателен' },
        { status: 400 }
      );
    }

    const updatedPost = await postsRepository.updatePost(Number(id), {
      title,
      slug,
      content,
    });

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error('PUT /api/posts error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении поста' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/posts
// ============================================================
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID поста обязателен' },
        { status: 400 }
      );
    }

    const updatedPost = await postsRepository.updatePost(Number(id), updateData);

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error('PATCH /api/posts error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении поста' },
      { status: 500 }
    );
  }
}