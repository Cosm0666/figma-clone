import { object, string } from "zod";

export const signUpSchema = object({
  email: string({ required_error: "É necessario um Email" }).email(
    "Email invalido",
  ),
  password: string({ required_error: "É necessario uma senha" }).min(
    6,
    "A senha deve conter no minimo 6 caracteres",
  ),
});

export const signInSchema = object({
  email: string({ required_error: "É necessario um Email" }).email(
    "Email invalido",
  ),
  password: string({ required_error: "É necessario uma senha" }).min(
    6,
    "A senha deve conter no minimo 6 caracteres",
  ),
});
