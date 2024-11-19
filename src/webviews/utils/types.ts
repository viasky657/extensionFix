import { LoaderFunction } from "react-router-dom";

export type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export type SimpleHTMLElementProps<T> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
>;

export type LoaderData<TLoaderFn extends LoaderFunction> =
  Awaited<ReturnType<TLoaderFn>> extends Response | infer D ? D : never;