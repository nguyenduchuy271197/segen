export function formatPrice(price: number | null) {
  if (!price) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("vi-VN", options || defaultOptions).format(
    dateObj
  );
}
