"use client"

import * as React from "react"
import { Laptop, Moon, Sun, Paintbrush } from "lucide-react"
import { useTheme } from "next-themes"

import { useColorTheme } from "@/components/color-theme-provider"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const themes = [
  { name: "violet", color: "hsl(231 48% 48%)" },
  { name: "zinc", color: "hsl(240 5.9% 10%)" },
  { name: "rose", color: "hsl(346.8 77.2% 49.8%)" },
  { name: "green", color: "hsl(142.1 76.2% 36.3%)" },
  { name: "blue", color: "hsl(221.2 83.2% 53.3%)" },
]

export function ThemeCustomizer() {
  const { setTheme: setMode, resolvedTheme } = useTheme()
  const { theme, setTheme } = useColorTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 z-50">
        <div className="space-y-4">
          <div>
            <Label className="font-semibold">Color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {themes.map((t) => (
                <Button
                  key={t.name}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    theme === t.name && "border-2 border-primary"
                  )}
                  style={{ backgroundColor: t.color }}
                  onClick={() => setTheme(t.name as any)}
                >
                  <span className="sr-only">{t.name}</span>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="font-semibold">Mode</Label>
            <RadioGroup
              value={resolvedTheme}
              onValueChange={setMode}
              className="grid grid-cols-3 gap-2 mt-2"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Laptop className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
