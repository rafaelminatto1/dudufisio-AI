// src/app/actions/general.ts
"use server";

// Este arquivo abrigará Server Actions gerais de exemplo.

const items: string[] = ["item inicial"];

export async function addItem(formData: FormData) {
  const newItem = formData.get("item") as string;
  if (newItem) {
    items.push(newItem);
    console.log(`[Server Action] Item adicionado: ${newItem}. Itens atuais: ${items}`);
    return { success: true, message: `Item '${newItem}' adicionado com sucesso.` };
  }
  return { success: false, message: "Nenhum item fornecido." };
}

export async function getItems() {
  return items;
}
