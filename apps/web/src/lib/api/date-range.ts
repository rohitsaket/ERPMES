export function dateRangeParams(range: string) {
  if (range === "all") return {};

  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  const daysByRange: Record<string, number> = {
    shift: 1,
    day: 1,
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  };
  dateFrom.setDate(dateFrom.getDate() - (daysByRange[range] ?? 30));

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
  };
}
