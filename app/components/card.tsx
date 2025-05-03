import { Card } from "@nextui-org/react"
import type { ReactNode } from "react"

interface StatCardProps {
    value: string
    label: string
    icon?: ReactNode
}

export function StatCard({ value, label, icon }: StatCardProps) {
    return (
        <Card className="border border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden relative">
            <div className="p-6">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl md:text-4xl font-bold text-white">{value}</div>
                        {icon && <div>{icon}</div>}
                    </div>
                    <p className="text-gray-400">{label}</p>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-blue-500/5"></div>
            </div>
        </Card>
    )
}
