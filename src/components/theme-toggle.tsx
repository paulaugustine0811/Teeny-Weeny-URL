
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="btn-hover-effect"
    >
      {theme === "dark" ? (
        <SunIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <MoonIcon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
