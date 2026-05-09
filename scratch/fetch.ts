import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

let url = "";
let key = "";

envContent.split("\n").forEach((line) => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    url = line.split("=")[1].trim();
  }
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
    key = line.split("=")[1].trim();
  }
});

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from("gastos")
    .select("fecha, monto")
    .order("fecha", { ascending: true });
  if (error) console.error(error);

  console.log(`Total records: ${data?.length}`);
  if (!data) return;

  const byMonth: Record<string, number> = {};
  data.forEach((d) => {
    const m = d.fecha.substring(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  });

  console.log("Records by month:", byMonth);
}

run();
