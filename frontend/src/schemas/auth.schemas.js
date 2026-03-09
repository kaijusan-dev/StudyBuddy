import { z } from "zod"

const registerSchema = z.object({
  username: z.string()
  .trim()
  .min(3, "Имя пользователя должно содержать минимум 3 символа")
  .max(20, "Имя пользователя должно содержать максимум 20 символов")
  .regex(/^[a-zA-Zа-яА-Я0-9 ]+$/, "Имя пользователя должно содержать только буквы, цифры и пробелы"),
  email: z.email("Неверный email").transform(v => v.toLowerCase()),
  group_id: z.coerce.number().min(1).max(25),
  password: z.string().min(6),
  passwordAgain: z.string()
}).refine((data) => data.password === data.passwordAgain, {message: "Пароли не совпадают", path: ["passwordAgain"]});

const loginSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Имя пользователя должно содержать минимум 3 символа")
    .max(20, "Имя пользователя должно содержать максимум 20 символов")
    .regex(/^[a-zA-Zа-яА-Я0-9 ]+$/, "Имя пользователя должно содержать только буквы, цифры и пробелы"),
  email: z.email("Неверный email").transform(v => v.toLowerCase()),
  password: z.string().min(6)
});

export { registerSchema, loginSchema };