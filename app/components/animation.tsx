"use client"

import { type ReactNode, useRef } from "react"
import { motion, useInView } from "framer-motion"

interface ScrollAnimationProps {
    children: ReactNode
    delay?: number
    direction?: "up" | "down" | "left" | "right" | "none"
    className?: string
    once?: boolean
    amount?: number | "some" | "all"
}

export default function ScrollAnimation({
    children,
    delay = 0,
    direction = "up",
    className = "",
    once = true,
    amount = 0.3,
}: ScrollAnimationProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, amount })

    // Define animation variants based on direction
    const getVariants = () => {
        switch (direction) {
            case "up":
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                }
            case "down":
                return {
                    hidden: { opacity: 0, y: -50 },
                    visible: { opacity: 1, y: 0 },
                }
            case "left":
                return {
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0 },
                }
            case "right":
                return {
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 },
                }
            case "none":
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                }
            default:
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                }
        }
    }

    const variants = getVariants()

    return (
        <div ref={ref} className={className}>
            <motion.div
                style={{ willChange: "opacity, transform" }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
                transition={{ duration: 0.6, delay }}
            >
                {children}
            </motion.div>
        </div>
    )
}
