import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { f } from "@/lib/locale";
import en from "@/locales/en";
import id from "@/locales/id";
import SkillCardClient from "./SkillCardClient";

interface Skill {
  name: string;
  level: string;
  percentage: number;
  icon?: string | null;
  sort_order: number;
}

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  skills: Skill[];
}

const delays = ["d1", "d2", "d3", "d1", "d2", "d3"];

export default async function Skills() {
  const supabase = createClient();
  const locale = (await cookies()).get("portfolio_locale")?.value ?? "en";
  const t = locale === "id" ? id : en;
  const nameKey = f(locale, "name");
  const descKey = f(locale, "description");
  const skillNameKey = f(locale, "name");

  const { data: categories } = await supabase
    .from("skill_categories")
    .select(`id, ${nameKey}, slug, icon, ${descKey}, name, description, skills(${skillNameKey}, level, percentage, icon)`)
    .order("sort_order");

  console.log("🔍 [Skills] locale:", locale, "| nameKey:", nameKey, "| descKey:", descKey);
  console.log("🔍 [Skills] raw categories:", JSON.stringify(categories?.map((c: any) => ({
    id: c.id,
    name: c.name,
    [`${nameKey}`]: c[nameKey],
    name_final: c[nameKey] ?? c.name,
    desc_final: c[descKey] ?? c.description,
  }))));

  const skillCards: SkillCategory[] = (categories?.length
    ? categories.map((c: any) => ({
        ...c,
        name: c[nameKey] ?? c.name,
        description: c[descKey] ?? c.description,
        skills: (c.skills ?? []).map((s: any) => ({
          ...s,
          name: s[skillNameKey] ?? s.name,
        })),
      }))
    : []
  ) as SkillCategory[];

  return (
    <section id="skills" className="bg-surface py-[100px]">
      <div className="max-w-[1160px] mx-auto px-8">
        <div className="reveal flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-primary mb-4">
            <span className="block w-6 h-0.5 bg-primary rounded-sm" />
            {t.skills.badge}
          </div>
          <h2
            className="font-display font-extrabold text-on-surface tracking-tight mb-4"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
            {t.skills.title}
          </h2>
          <p className="text-on-surface-muted max-w-[520px] leading-[1.7]">
            {t.skills.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCards.map((card, i) => (
            <SkillCardClient
              key={card.id ?? card.slug}
              card={card}
              delay={delays[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
