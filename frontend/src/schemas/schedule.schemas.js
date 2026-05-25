import { z } from "zod"

const calendarUrlSchema = z.object({
  calendar_url: z.string().url("Неверный URL календаря"),
  tg_id: z.coerce.number("Неверный telegram id"),
}).strip();

export { calendarUrlSchema };
