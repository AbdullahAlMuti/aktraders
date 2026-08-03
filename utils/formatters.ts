export function formatDate(dateString: string, locale: string = "bn-BD"): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string, locale: string = "bn-BD"): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatNumber(num: number, locale: string = "bn-BD"): string {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch (e) {
    return String(num);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
