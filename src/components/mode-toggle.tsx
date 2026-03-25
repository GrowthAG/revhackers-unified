import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-transparent border-white/10 text-white hover:bg-white/10">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 z-[80]">
                <DropdownMenuItem onClick={() => setTheme("light")} className="text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer">
                    Clean (Light)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer">
                    Dark (Premium)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer">
                    Sistema
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
