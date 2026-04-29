"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/gastos");
}
