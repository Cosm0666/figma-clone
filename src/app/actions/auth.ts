"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { signUpSchema } from "~/schemas";
import { signIn, signOut } from "~/server/auth";
import { db } from "~/server/db";

export async function signout() {
    await signOut();
}   

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email ou senha inválidos";
        default:
          return "Ocorreu um erro ao tentar entrar";
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const { email, password } = await signUpSchema.parseAsync({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return "Email já cadastrado";
    }

    const hash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email,
        password: hash,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return error.errors.map((error) => error.message).join(", ");
    }
  }
  redirect("/signin");
}
