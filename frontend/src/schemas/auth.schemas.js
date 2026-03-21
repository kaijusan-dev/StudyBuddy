import { z } from "zod"

const registerSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Имя пользователя должно содержать минимум 3 символа")
    .max(20, "Имя пользователя должно содержать максимум 20 символов")
    .regex(/^[a-zA-Zа-яА-Я0-9 ]+$/, "Имя пользователя должно содержать только буквы, цифры и пробелы"),
  email: z.email("Неверный email").transform(v => v.toLowerCase()),
  group_id: z.coerce.number().min(1, 'Такая группа не существует').max(18, 'Такая группа не существует'),
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
  passwordAgain: z.string()
}).refine((data) => data.password === data.passwordAgain, {message: "Пароли не совпадают", path: ["passwordAgain"]}).strip();

const loginSchema = z.object({
  identifier: z.string()
    .trim()
    .min(3, "Введите имя пользователя или email"),
  password: z.string().min(6, "Пароль должен быть минимум 6 символов")
}).strip();;

export { registerSchema, loginSchema };