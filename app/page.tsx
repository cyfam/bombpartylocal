import Image from "next/image";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-cols-1 h-dvh place-content-around">
      <div className="grid grid-cols-1 h-full place-content-center">
        <div className="flex flex-col items-center p-7 gap-6">
          <h1 className="text-5xl">Bomb Party Practice</h1>
          <Link href={"/game"}>
            <Button variant="outline">
              <span>Start</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-row flex-initial justify-center">
          <ModeToggle />
      </div>
    </div>
  );
}
