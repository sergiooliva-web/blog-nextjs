export type Success<T> = {
  isSuccess: true;
  data: T;
};

export type Failure<E> = {
  isSuccess: false;
  error: E;
};

export type AppResult<T, E> = Success<T> | Failure<E>;

export const success = <T>(data: T): Success<T> => ({
  isSuccess: true,
  data,
});
export const failure = <E>(error: E): Failure<E> => ({
  isSuccess: false,
  error,
});
