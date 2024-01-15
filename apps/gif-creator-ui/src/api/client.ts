import { Input, Method, Path, Response } from "./generated";

const serializeArraySearch = (params: { [key: string]: string | string[] }) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(`${key}[]`, item);
      }
    } else {
      searchParams.append(key, value);
    }
  }
  return searchParams;
};

type Implementation = <M extends Method, P extends Path>(
  method: M,
  path: P,
  params: Input[`${M} ${P}`],
  headers?: HeadersInit,
) => Promise<Response[`${M} ${P}`]>;
export const exampleImplementation: Implementation = async (
  method,
  path,
  params,
  headers = {},
) => {
  const hasBody = !["get", "delete"].includes(method);
  if (!hasBody) {
  }
  const searchParams = hasBody ? "" : `?${serializeArraySearch(params)}`;
  const response = await fetch(
    `${import.meta.env.VITE_APP_API_URL}${path}${searchParams}`,
    {
      method: method.toUpperCase(),
      headers: hasBody
        ? { "Content-Type": "application/json", ...headers }
        : headers,
      body: hasBody ? JSON.stringify(params) : undefined,
    },
  );
  // if (`${method} ${path}` in jsonEndpoints) {
  return response.json();
  // }
  // return response.text();
};

export const apiClient = {
  provide: exampleImplementation,
};
