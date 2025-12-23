export const getStaticUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_STATIC_URL || "";
  return `${baseUrl}${path}`;
};
