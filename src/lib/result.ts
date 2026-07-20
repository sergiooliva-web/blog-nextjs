/**
 * Контейнер успешного выполнения операции.
 * Гарантирует наличие запрошенных данных и строгий флаг `isSuccess: true`.
 */
export type Success<T> = {
  isSuccess: true;
  data: T;
};

/**
 * Контейнер неудачного выполнения операции.
 * Содержит строго типизированную доменную ошибку и флаг `isSuccess: false`.
 */
export type Failure<E> = {
  isSuccess: false;
  error: E;
};
/**
 * Универсальный контракт для возврата результатов из слоя бизнес-логики.
 * Реализует паттерн Result (Railway Oriented Programming).
 *
 * ЗАЧЕМ НУЖЕН:
 * 1. Заменяет непредсказуемый механизм `throw / try-catch`.
 * 2. Делает все возможные ошибки явными на уровне сигнатуры функции.
 * 3. Заставляет вызывающий код явно обработать ошибку перед тем,
 *    как TypeScript разрешит обратиться к данным.
 *
 * @example
 * const result = await postService.getPost("hello");
 *
 * if (result.isSuccess) {
 *   // TypeScript автоматически отсекает тип Failure. Здесь безопасно использовать result.data
 *   return NextResponse.json(result.data);
 * }
 *
 * // Если код дошел сюда, TypeScript знает, что это Failure. Доступно только result.error
 * switch (result.error.code) { ... }
 */
export type AppResult<T, E> = Success<T> | Failure<E>;

/**
 * Вспомогательная фабрика для создания успешного результата.
 *
 * @param data - Данные, которые будут переданы вызывающему коду.
 *               Если тип `T` равен `void`, параметр можно не передавать.
 */
export const success = <T>(data?: T): Success<T> => ({
  isSuccess: true,
  data: data as T,
});

/**
 * Вспомогательная фабрика для создания ошибочного результата.
 *
 * @param error - Объект бизнес-ошибки (должен соответствовать контракту AppError).
 */
export const failure = <E>(error: E): Failure<E> => ({
  isSuccess: false,
  error,
});
