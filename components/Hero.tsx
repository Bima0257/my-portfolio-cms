import { createClient } from "@/lib/supabase/server";
import HeroContent from "./HeroContent";

export default async function Hero() {
  const supabase = createClient();

  const { data: about } = await supabase
    .from("abouts")
    .select("name, expertise, tagline, description, photo, cv_url, experience")
    .limit(1)
    .single<{
      name: string;
      expertise: string;
      tagline: string;
      description: string;
      photo: string | null;
      cv_url: string | null;
      experience: number;
    }>();

  return (
    <HeroContent
      name={about?.name ?? "Bima"}
      expertise={about?.expertise ?? "Full Stack Developer"}
      tagline={about?.tagline ?? "— Crafting digital experiences people love"}
      description={about?.description ?? "UI/UX Designer with a passion for clean, purposeful design."}
      photo={about?.photo ?? null}
      cvUrl={about?.cv_url ?? null}
      experience={about?.experience ?? 7}
    />
  );
}
