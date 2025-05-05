"use client"

import { useState } from "react"
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Switch,
    Chip,
    Accordion,
    AccordionItem,
} from "@nextui-org/react"
import { MapPin, Phone, Mail, Check, X, HelpCircle } from 'lucide-react'
import { Link } from "@remix-run/react"
import PublicLayout from "~/layout/PublicLayout"

export default function PricingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isAnnual, setIsAnnual] = useState(true)

    const pricingPlans = [
        {
            name: "Starter",
            description: "Perfect for small businesses just getting started",
            monthlyPrice: 99,
            annualPrice: 79,
            features: [
                { name: "Basic legal document templates", included: true },
                { name: "Email support", included: true },
                { name: "Client portal access", included: true },
                { name: "Document storage (5GB)", included: true },
                { name: "Case management", included: false },
                { name: "Advanced analytics", included: false },
                { name: "Custom integrations", included: false },
                { name: "Dedicated account manager", included: false },
            ],
            cta: "Get Started",
            popular: false,
        },
        {
            name: "Professional",
            description: "Ideal for growing practices with established needs",
            monthlyPrice: 199,
            annualPrice: 159,
            features: [
                { name: "Advanced legal document templates", included: true },
                { name: "Priority email & phone support", included: true },
                { name: "Client portal with custom branding", included: true },
                { name: "Document storage (25GB)", included: true },
                { name: "Case management", included: true },
                { name: "Basic analytics", included: true },
                { name: "Limited integrations", included: true },
                { name: "Dedicated account manager", included: false },
            ],
            cta: "Try Professional",
            popular: true,
        },
        {
            name: "Enterprise",
            description: "Comprehensive solution for established organizations",
            monthlyPrice: 399,
            annualPrice: 319,
            features: [
                { name: "Full template library with custom options", included: true },
                { name: "24/7 priority support", included: true },
                { name: "Advanced client portal with full customization", included: true },
                { name: "Unlimited document storage", included: true },
                { name: "Advanced case management", included: true },
                { name: "Comprehensive analytics & reporting", included: true },
                { name: "Unlimited custom integrations", included: true },
                { name: "Dedicated account manager", included: true },
            ],
            cta: "Contact Sales",
            popular: false,
        },
    ]

    const faqs = [
        {
            question: "Can I change plans later?",
            answer:
                "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new rate will be prorated for the remainder of your billing cycle. If you downgrade, the new rate will take effect at the start of your next billing cycle.",
        },
        {
            question: "Is there a free trial available?",
            answer:
                "Yes, we offer a 14-day free trial on all our plans. No credit card is required to start your trial. You can upgrade to a paid plan at any time during or after your trial period.",
        },
        {
            question: "What payment methods do you accept?",
            answer:
                "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also accept payment via bank transfer for annual enterprise plans.",
        },
        {
            question: "Can I get a refund if I'm not satisfied?",
            answer:
                "We offer a 30-day money-back guarantee on all our plans. If you're not completely satisfied with our service within the first 30 days, contact our support team for a full refund.",
        },
        {
            question: "Do you offer discounts for non-profits or educational institutions?",
            answer:
                "Yes, we offer special pricing for qualified non-profit organizations, educational institutions, and startups. Please contact our sales team for more information.",
        },
        {
            question: "How secure is my data?",
            answer:
                "We take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security practices and regularly undergo security audits. Our platform is compliant with major regulations including GDPR and HIPAA.",
        },
    ]

    return (
        <PublicLayout >
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-28 bg-gradient-to-br from-black to-gray-900 relative">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="max-w-3xl mx-auto text-center">
                            <Chip className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20" variant="bordered">
                                Pricing Plans
                            </Chip>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-6">
                                Simple, Transparent{" "}
                                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Pricing</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-8">
                                Choose the perfect plan for your business needs with no hidden fees or surprises.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <span className={`text-sm ${!isAnnual ? "text-blue-500" : "text-gray-400"}`}>Monthly</span>
                                <Switch
                                    isSelected={isAnnual}
                                    onValueChange={setIsAnnual}
                                    size="lg"
                                    color="primary"
                                    className="mx-2"
                                />
                                <span className={`text-sm ${isAnnual ? "text-blue-500" : "text-gray-400"}`}>
                                    Annual <span className="text-xs text-green-500">(Save 20%)</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
                </section>

                {/* Pricing Cards */}
                <section className="py-16 bg-black relative z-10 -mt-10">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {pricingPlans.map((plan, index) => (
                                <Card
                                    key={index}
                                    className={`border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden ${plan.popular
                                        ? "border-blue-500/50 shadow-lg shadow-blue-500/10 relative z-10 scale-105 md:scale-110"
                                        : ""
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-xs font-medium">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <CardHeader className={`flex flex-col gap-1 ${plan.popular ? "pt-8" : "pt-6"}`}>
                                        <h2 className="text-2xl font-bold">{plan.name}</h2>
                                        <p className="text-gray-400 text-sm">{plan.description}</p>
                                    </CardHeader>
                                    <CardBody className="py-4">
                                        <div className="mb-6">
                                            <div className="flex items-end">
                                                <span className="text-4xl font-bold">
                                                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                                                </span>
                                                <span className="text-gray-400 ml-2">/month</span>
                                            </div>
                                            {isAnnual && (
                                                <div className="text-green-500 text-sm mt-1">
                                                    Billed annually (${plan.annualPrice * 12}/year)
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    {feature.included ? (
                                                        <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <X className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <span className={feature.included ? "text-gray-200" : "text-gray-500"}>{feature.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                    <CardFooter>
                                        <Button
                                            className={`w-full ${plan.popular
                                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                                : "bg-gray-800 hover:bg-gray-700 text-white"
                                                }`}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature Comparison */}
                <section className="py-16 bg-gradient-to-br from-black to-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare All Features</h2>
                            <p className="text-gray-400">
                                A detailed breakdown of what's included in each plan to help you make the right choice.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse">
                                <thead>
                                    <tr className="border-b border-blue-900/40">
                                        <th className="py-4 px-6 text-left">Features</th>
                                        <th className="py-4 px-6 text-center">Starter</th>
                                        <th className="py-4 px-6 text-center bg-blue-900/20">Professional</th>
                                        <th className="py-4 px-6 text-center">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: "Document Templates", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
                                        { name: "Document Storage", starter: "5GB", professional: "25GB", enterprise: "Unlimited" },
                                        { name: "Client Portal", starter: "Basic", professional: "Branded", enterprise: "Full Customization" },
                                        { name: "Support", starter: "Email", professional: "Email & Phone", enterprise: "24/7 Priority" },
                                        { name: "Case Management", starter: "—", professional: "Basic", enterprise: "Advanced" },
                                        { name: "Analytics", starter: "—", professional: "Basic", enterprise: "Comprehensive" },
                                        { name: "Integrations", starter: "—", professional: "Limited", enterprise: "Unlimited" },
                                        { name: "API Access", starter: "—", professional: "Limited", enterprise: "Full" },
                                        { name: "Team Members", starter: "2", professional: "10", enterprise: "Unlimited" },
                                        { name: "Dedicated Account Manager", starter: "—", professional: "—", enterprise: "✓" },
                                        { name: "Custom Training", starter: "—", professional: "—", enterprise: "✓" },
                                        { name: "SLA", starter: "—", professional: "—", enterprise: "✓" },
                                    ].map((feature, index) => (
                                        <tr key={index} className="border-b border-blue-900/20">
                                            <td className="py-4 px-6 font-medium">{feature.name}</td>
                                            <td className="py-4 px-6 text-center text-gray-400">
                                                {feature.starter === "—" ? <span className="text-gray-600">—</span> : feature.starter}
                                            </td>
                                            <td className="py-4 px-6 text-center bg-blue-900/10 text-gray-300">{feature.professional === "—" ? <span className="text-gray-600">—</span> : feature.professional}</td>
                                            <td className="py-4 px-6 text-center text-gray-400">
                                                {feature.enterprise === "—" ? <span className="text-gray-600">—</span> : feature.enterprise}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Enterprise Section */}
                <section className="py-16 bg-black">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-r from-blue-950/50 to-gray-900/50 p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
                            <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Need a Custom Solution?</h2>
                                    <p className="text-gray-400 max-w-2xl mb-6">
                                        Our enterprise plan can be tailored to your specific requirements. Get in touch with our sales team to
                                        discuss your needs and get a custom quote.
                                    </p>
                                    <ul className="space-y-2 mb-8">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-blue-500" />
                                            <span>Custom implementation and onboarding</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-blue-500" />
                                            <span>Dedicated success manager</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-blue-500" />
                                            <span>Custom integrations with your existing tools</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-blue-500" />
                                            <span>Volume discounts available</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex-shrink-0">
                                    <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8">
                                        Contact Sales
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 bg-gradient-to-br from-black to-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                                <p className="text-gray-400">
                                    Find answers to common questions about our pricing and plans.
                                </p>
                            </div>

                            <Accordion variant="splitted" className="mb-8">
                                {faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        aria-label={faq.question}
                                        title={faq.question}
                                        classNames={{
                                            base: "bg-gray-900/50 border border-blue-900/40 mb-4",
                                            title: "text-white font-medium",
                                            trigger: "px-6 py-4",
                                            content: "px-6 pb-4 text-gray-400",
                                        }}
                                        indicator={<HelpCircle className="text-blue-500" size={20} />}
                                    >
                                        {faq.answer}
                                    </AccordionItem>
                                ))}
                            </Accordion>

                            <div className="text-center">
                                <p className="text-gray-400 mb-6">
                                    Still have questions? Our team is here to help you find the perfect plan for your needs.
                                </p>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Contact Support</Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-16 bg-black">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
                            <p className="text-gray-400">
                                Join thousands of satisfied customers who have transformed their legal practice with our solutions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    quote:
                                        "DennisLaw has completely transformed how we manage our legal documents and client communications. The Professional plan provides everything we need at a reasonable price.",
                                    author: "Sarah Johnson",
                                    role: "Managing Partner, Johnson & Associates",
                                    image: "/placeholder.svg?height=100&width=100",
                                },
                                {
                                    quote:
                                        "The Enterprise plan's custom integrations allowed us to connect our existing systems seamlessly. The dedicated account manager has been invaluable in our digital transformation.",
                                    author: "Michael Chen",
                                    role: "CTO, Legal Solutions Inc.",
                                    image: "/placeholder.svg?height=100&width=100",
                                },
                                {
                                    quote:
                                        "We started with the Starter plan and upgraded as we grew. The transition was smooth, and the additional features have helped us scale our practice efficiently.",
                                    author: "Aisha Patel",
                                    role: "Founder, Patel Legal Consultancy",
                                    image: "/placeholder.svg?height=100&width=100",
                                },
                            ].map((testimonial, index) => (
                                <Card
                                    key={index}
                                    className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden"
                                >
                                    <CardBody className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                                <img
                                                    src={testimonial.image || "/placeholder.svg"}
                                                    alt={testimonial.author}
                                                    width={100}
                                                    height={100}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
                                                <div>
                                                    <p className="font-medium">{testimonial.author}</p>
                                                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

            </main>
        </PublicLayout>
    )
}
