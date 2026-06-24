const monthsES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const shortDateFmt = {
  format(date: Date): string {
    if (isNaN(date.getTime())) return "";
    return monthsES[date.getMonth()] || "";
  },
};

export const weekdayDateFmt = {
  format(date: Date): string {
    if (isNaN(date.getTime())) return "";
    return monthsES[date.getMonth()] || "";
  },
};

export const hmsTimeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// `Intl.NumberFormat.prototype.format` is a bound getter — safe to extract.
export const intFmt = new Intl.NumberFormat("en-US").format;
