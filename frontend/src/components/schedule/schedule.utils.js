export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("ru-RU", {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ru-RU");
};

export const getWeekRange = (offset = 0) => {
  const now = new Date();

  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};