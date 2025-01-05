export type SafeExtract<T, U extends T> = T extends U ? T : never;
export type SafeExclude<T, U extends T> = T extends U ? never : T;
export type SafeOmit<T, K extends keyof T> = Omit<T, K>;
export type SafePick<T, K extends keyof T> = Pick<T, K>;
