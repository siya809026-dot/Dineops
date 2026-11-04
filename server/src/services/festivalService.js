
const INDIA_FESTIVALS = [
  { name: "Diwali", date: "2026-11-08", demandMultiplier: 1.08 },
  { name: "Govardhan Puja", date: "2026-11-09", demandMultiplier: 1.06 },
  { name: "Bhai Dooj", date: "2026-11-11", demandMultiplier: 1.05 },
  { name: "Chhath Puja", date: "2026-11-15", demandMultiplier: 1.05 },
  { name: "Guru Nanak Jayanti", date: "2026-11-24", demandMultiplier: 1.05 },
  { name: "Christmas", date: "2026-12-25", demandMultiplier: 1.08 },
];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getUpcomingFestivals = (startDate, days = 7) => {
  const start = new Date(startDate);
  const end = new Date(start);

  end.setDate(end.getDate() + days - 1);

  const startKey = toDateKey(start);
  const endKey = toDateKey(end);

  return INDIA_FESTIVALS.filter(
    (festival) =>
      festival.date >= startKey && festival.date <= endKey
  );
};

export const getFestivalAdjustment = (festivals) => {
  if (!Array.isArray(festivals) || festivals.length === 0) {
    return {
      multiplier: 1,
      adjustmentPercent: 0,
      names: [],
    };
  }

  // Use the strongest applicable festival factor, not compounded factors.
  const strongestFestival = festivals.reduce((strongest, current) =>
    current.demandMultiplier > strongest.demandMultiplier
      ? current
      : strongest
  );

  const multiplier = Math.min(
    1.1,
    Math.max(1, strongestFestival.demandMultiplier)
  );

  return {
    multiplier,
    adjustmentPercent: Math.round((multiplier - 1) * 100),
    names: festivals.map((festival) => festival.name),
  };
};
