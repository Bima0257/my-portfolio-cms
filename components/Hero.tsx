import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { f } from "@/lib/locale";
import en from "@/locales/en";
import id from "@/locales/id";
import HeroContent from "./HeroContent";

export default async function Hero() {
  const supabase = createClient();
  const locale = (await cookies()).get("portfolio_locale")?.value ?? "en";
  const t = locale === "id" ? id : en;

  const nameKey = f(locale, "name");
  const expertiseKey = f(locale, "expertise");
  const taglineKey = f(locale, "tagline");
  const descriptionKey = f(locale, "description");

  const selectFields = `id, ${nameKey}, ${expertiseKey}, ${taglineKey}, ${descriptionKey}, name, expertise, tagline, description, photo, cv_url, experience`;
  const { data } = await supabase
    .from("abouts")
    .select(selectFields)
    .limit(1);
  const about = (data as any)?.[0];

  const finalName = (about as any)?.[nameKey] ?? (about as any)?.name ?? "Bima";
  const finalExpertise = (about as any)?.[expertiseKey] ?? (about as any)?.expertise ?? "Full Stack Developer";
  const finalTagline = (about as any)?.[taglineKey] ?? (about as any)?.tagline ?? (locale === "id" ? "— Menciptakan pengalaman digital yang dicintai orang" : "— Crafting digital experiences people love");
  const fallbackDesc = locale === "id"
    ? "UI/UX Designer dengan passion untuk desain yang bersih dan bermakna."
    : "UI/UX Designer with a passion for clean, purposeful design.";

  const finalDesc = (about as any)?.[descriptionKey] ?? (about as any)?.description ?? fallbackDesc;

  return (
    <HeroContent
      name={finalName}
      expertise={finalExpertise}
      tagline={finalTagline}
      description={finalDesc}
      photo={about?.photo ?? null}
      cvUrl={about?.cv_url ?? null}
      experience={about?.experience ?? 7}
    />
  );
}
