import { Card } from "@nextui-org/react"
import type { ReactNode } from "react"
import ScrollAnimation from "./animation"

interface StatCardProps {
    value: string
    label: string
    icon?: ReactNode
}

export function StatCard({ value, label, icon }: StatCardProps) {
    return (
        <ScrollAnimation>
            <Card className="border border-black/20 shadow-sm overflow-hidden relative  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-110 transition-transform duration-500">
            <div className="p-6">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl md:text-4xl font-bold ">{value}</div>
                        {icon && <div>{icon}</div>}
                    </div>
                        <p className="">{label}</p>
                </div>
                    <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-pink-500/20"></div>
            </div>
        </Card>
        </ScrollAnimation>
    )
}
