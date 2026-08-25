/**
 * Universal Date Formatter for The Bible Experience App.
 */
export function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const customDate = new Date(year, month, day);
        if (!isNaN(customDate.getTime())) {
          return customDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
      }
      return dateStr;
    }

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
