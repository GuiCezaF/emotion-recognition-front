export const getAuthToken = (): string => {
  return import.meta.env.VITE_API_AUTH_TOKEN as string;
};
