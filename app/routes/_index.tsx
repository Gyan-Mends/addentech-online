import PublicLayout from "~/layout/PublicLayout";
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Chip } from "@nextui-org/react";
import heroimage from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import CheckedIcon from "~/components/icons/CheckedIcon";
import { Link, useLoaderData } from "@remix-run/react";
import img5 from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import { ProductCard } from "~/components/produt";
import { ArrowRight, ChevronRight, Star, User, ExternalLink } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import blog from "~/controller/blog";
import { BlogInterface } from "~/interface/interface";
import ScrollAnimation from "~/components/animation";
import AdvertBanner from "~/components/advert";
import { useEffect, useState } from "react";



const Home = () => {
  const truncateText = (text: string, wordLimit: number): string => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const {
    blogs
  } = useLoaderData<{
    blogs: BlogInterface[]
  }>()
  console.log(blogs);

  const testimonials = [
    {
      quote:
        "DennisLaw transformed our digital presence completely. Their strategic approach to our website redesign and digital marketing efforts resulted in a 200% increase in qualified leads within just three months.",
      author: "Sarah Johnson",
      role: "Marketing Director, TechSolutions Inc.",
      rating: 5,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "The cloud migration services provided by DennisLaw were exceptional. Their team managed the entire process seamlessly, with zero downtime, and we've seen a 40% reduction in our IT infrastructure costs.",
      author: "Michael Chen",
      role: "CTO, FinanceHub",
      rating: 5,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "Working with DennisLaw on our brand redesign was a game-changer. Their creative team captured our vision perfectly and delivered a cohesive brand identity that has significantly improved our market recognition.",
      author: "Emily Rodriguez",
      role: "CEO, Innovate Retail",
      rating: 5,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length, isPaused])

  const goToPrevious = () => {
    setActiveTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000)
  }

  const goToNext = () => {
    setActiveTestimonial((current) => (current + 1) % testimonials.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000)
  }

  const goToSlide = (index: number) => {
    setActiveTestimonial(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000)
  }


  return (
    <PublicLayout>
      <style>
        {`
          @keyframes gradient-x {
            0%, 100% {
              background-size: 200% 200%;
              background-position: left center;
            }
            50% {
              background-size: 200% 200%;
              background-position: right center;
            }
          }
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
          }
        `}
      </style>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen overflow-hidden pt-10 bg-black">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://res.cloudinary.com/djlnjjzvt/image/upload/v1747070545/hero1_rfu05r.jpg"
              alt="Modern legal technology workspace"
              className="w-full h-full object-cover opacity-60"
            />
           
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          
          {/* Animated Background Elements */}
          
          {/* Content */}
          <div className="relative z-10  flex items-center min-h-screen px-4 lg:px-[125px]">
            <div className="max-w-6xl">
              <ScrollAnimation delay={0.2}>
                <h1 className="text-5xl font-montserrat flex flex-col gap-2 md:text-7xl lg:text-[80px] font-bold text-white leading-[0.9] tracking-tight mb-8">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    Transforming the
                  </span>
                  <span className="">
                    Legal Landscape
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">with</span>
                    <span className="relative">
                      <span className="">
                        Technology
                      </span>
                     
                    </span>
                  </span>
                </h1>
              </ScrollAnimation>
              
              <ScrollAnimation delay={0.4}>
                <p className="text-white/80 text-md md:text-lg max-w-3xl mb-12 font-light leading-relaxed">
                  Empowering law firms with cutting-edge solutions that streamline operations, 
                  enhance client experiences, and drive unprecedented growth in the digital age.
                </p>
              </ScrollAnimation>
              
              <ScrollAnimation delay={0.6}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <Link to="/about">
                    <Button 
                      size="lg"
                      className="bg-pink-500 text-white font-semibold px-8 py-6 text-lg tracking-wide transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25 border border-pink-500/20"
                    >
                      <span className="flex items-center gap-2">
                        About Us
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </Button>
                  </Link>
                  <Link to="/services">
                    <Button 
                      variant="bordered"
                      size="lg"
                      className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold px-8 py-6 text-lg tracking-wide transition-all duration-300 backdrop-blur-sm"
                    >
                      <span className="flex items-center gap-2">
                        View Services
                        <ExternalLink className="w-5 h-5" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </ScrollAnimation>

              {/* Stats Section */}
              <ScrollAnimation delay={0.8}>
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl">
                  {[
                    { number: "500+", label: "Legal Firms Served" },
                    { number: "99.9%", label: "Uptime Guarantee" },
                    { number: "24/7", label: "Expert Support" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center group">
                      <div className="text-3xl text-white md:text-4xl font-bold  mb-2 group-hover:scale-110 transition-transform duration-300">
                        {stat.number}
                      </div>
                      <div className="text-white/70 text-sm uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollAnimation>
            </div>
          </div>
          
          {/* Enhanced Decorative Elements */}
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-t from-cyan-500/20 to-blue-500/10 rounded-full blur-2xl"></div>
          
          {/* Scroll Indicator */}
          <ScrollAnimation delay={1.0}>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm tracking-wider uppercase">Scroll to explore</span>
                <div className="w-0.5 h-8 bg-gradient-to-b from-white/60 to-transparent"></div>
              </div>
            </div>
          </ScrollAnimation>
        </section>

        {/* Products Section */}
        <ProductCard className="lg:py-20 py-10 bg-gray-100 shadow-t-gray-100 lg:px-[35px] px-4" id="products" />

        {/* Customer Centric Section */}
        <section className="py-20 lg:px-[125px] px-4 ">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="grid grid-cols-2 gap-4">
                <ScrollAnimation>
                  <div className="aspect-[3/4] overflow-hidden rounded-lg hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://res.cloudinary.com/djlnjjzvt/image/upload/v1747074574/c1_bamtmm.avif"
                      alt="Legal professionals"
                      width={300}
                      height={400}
                      className="h-full w-full object-cover "
                    />
                  </div>
                </ScrollAnimation>
                <ScrollAnimation delay={0.3}>
                  <div className="aspect-[3/4] overflow-hidden rounded-lg mt-8 hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://res.cloudinary.com/djlnjjzvt/image/upload/v1747074687/c2_hjpjmk.avif"
                      alt="Legal consultation"
                      width={300}
                      height={400}
                      className="h-full w-full object-cover "
                    />
                  </div>
                </ScrollAnimation>
              </div>
              <div className="space-y-6">

                <ScrollAnimation delay={0.2}>
                  <h2 className="text-3xl md:text-3xl font-bold font-montserrat">Legal Tech Solutions That Put Clients First</h2>
                </ScrollAnimation>

                <ScrollAnimation delay={0.3}>
                  <p className="text-muted-foreground font-nunito">
                    Our innovative approach combines legal expertise with cutting-edge technology to deliver solutions
                    that truly address the needs of modern law practices and their clients.
                  </p>
                </ScrollAnimation>
                <ScrollAnimation delay={0.4}>
                  <ul className="space-y-2">
                    {["Client-focused design", "Intuitive interfaces", "Secure data handling", "Compliance-ready"].map(
                      (item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-pink-500 flex items-center justify-center">
                            <CheckedIcon className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-nunito">{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </ScrollAnimation>

              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="lg:py-20 py-10 lg:px-[125px] px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-100 to-purple-100 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-100 to-blue-100 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container relative z-10">
            <ScrollAnimation>
              <div className="text-center mb-16">
               
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-montserrat">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Comprehensive Services
                  </span>
                  <br />
                  <span className="">
                    Tailored to Your Needs
                  </span>
                </h2>
                <p className="text-gray-600 max-w-[800px] mx-auto text-lg leading-relaxed">
                  We offer a wide range of legal technology services designed to meet the specific needs of modern law firms and accelerate their digital transformation.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Digital Marketing & Consultation",
                  description: "Maximize digital presence with expert SEO, social media strategies, email campaigns, and comprehensive analytics to drive client acquisition.",
                  icon: "💻",
                },
                {
                  title: "Design & Development",
                  description: "Innovative website design and development tailored to your business needs with responsive layouts and modern user experiences.",
                  icon: "🎨",
                 
                },
                {
                  title: "IT Services & Support",
                  description: "Comprehensive support and management of IT systems, including business software, networks, security, and 24/7 technical assistance.",
                  icon: "🔧",
                 
                },
              ].map((service, i) => (
                <ScrollAnimation key={i} delay={0.1 * i}>
                  <Card className="group border shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}></div>
                    <div className="relative bg-white m-0.5 rounded-xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {service.icon}
                          </div>
                          <div>
                            <h3 className="font-bold font-montserrat text-xl text-gray-900 group-hover:text-gray-700 transition-colors">
                              {service.title}
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <CheckedIcon className="w-4 h-4 text-green-500 mr-2" />
                          <span>Available 24/7</span>
                        </div>
                      </CardBody>
                      <CardFooter className="pt-0">
                        <Link to="/services/#services-section" className="w-full">
                          <Button 
                            className={`w-fulltext-white font-semibold hover:shadow-xl $ transition-all duration-300 group-hover:scale-105`}
                          >
                            <span className="flex items-center justify-center gap-2">
                              Learn More
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </Button>
                        </Link>
                      </CardFooter>
                    </div>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
            
            <ScrollAnimation>
              <div className="flex justify-center items-center mt-16">
                <Link to="/services#services-section">
                  <Button 
                    size="lg"
                    className="bg-pink-500 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center gap-2">
                      View All Services
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        <AdvertBanner />

        {/* Blog Section */}
        <section id="blog" className="py-20 lg:px-[125px] px-4 ">
          <div className="container">
            <ScrollAnimation>
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold font-montserrat">Blog, News & Articles</h2>
                </div>
                <Link to="/blog">
                    <Button variant="bordered" className="font-montserrat border border-2">
                        View all articles
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((article, i) => (
                <ScrollAnimation delay={0.3}>
                  <Card key={i} className="overflow-hidden border-border/40 bg-background/50 backdrop-blur hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500 border hover:border-pink-500/20">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={(article as any).image || "/placeholder.svg"}
                        alt={article.name}
                        width={400}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="text-sm text-default-400 font-nunito">{new Date((article as any)?.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</div>
                      <p className="line-clamp-2 font-bold text-lg font-monserrate">{truncateText(article?.name, 10)}</p>
                      <div
                        className="text-gray-400 text-sm line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: truncateText(article?.description, 10) }}
                      ></div>
                    </div>
                    <CardFooter>

                      <Link to={`/blog/${article._id}`}>
                        <Button variant="ghost" size="sm" className="group border border-2 hover:border-default-200">
                          Read article
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-20 lg:py-40 lg:px-[125px] p-4 bg-gray-100">
          <div className="container">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Our Methodology Guarantees Your Success</h2>
                <p className="text-muted-foreground max-w-[800px] mx-auto font-nunito">
                  We follow a proven methodology to ensure the success of your legal technology implementation.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                {
                  title: "Discovery",
                  items: ["Needs assessment", "Current system audit", "Stakeholder interviews", "Goal setting"],
                },
                {
                  title: "Planning",
                  items: ["Solution design", "Technology selection", "Implementation roadmap", "Risk assessment"],
                },
                {
                  title: "Development",
                  items: ["Agile methodology", "Regular client updates", "Quality assurance", "Security testing"],
                },
                {
                  title: "Training",
                  items: ["User onboarding", "Documentation", "Hands-on workshops", "Knowledge transfer"],
                },
                {
                  title: "Ongoing Support",
                  items: [
                    "24/7 technical support",
                    "Regular updates",
                    "Performance monitoring",
                    "Continuous improvement",
                  ],
                },
              ].map((phase, i) => (
                <ScrollAnimation delay={0.3}>
                  <Card key={i} className="border hover:border-pink-500/50 border-black/10 backdrop-blur p-6  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                    <CardHeader>
                      <p className="font-bold font-montserrat">{phase.title}</p>
                    </CardHeader>
                    <p className="font-nunito">
                      <ul className="space-y-2">
                        {phase.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <CheckedIcon className="h-4 w-4 text-white bg-gradient rounded mt-1" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </p>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials-section" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full filter blur-3xl"></div>
          </div>

          <div className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">

              <h2 className="text-3xl md:text-4xl font-bold mb-6 ">
                What Our Clients Say About Our Services
              </h2>
              <p className="text-base md:text-lg max-w-2xl mx-auto">
                Don't just take our word for it. Here's what our clients have to say about working with us.
              </p>
            </div>

            <div className="overflow-hidden mt-12">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4 flex items-center justify-center">
                    <Card className="border border-black/30 w-[900px] h-full overflow-hidden shadow-lg">
                      <CardBody className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                          <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-pink-500/20">
                            <img
                              src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg"
                              alt={testimonial.author}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex mb-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 text-pink-400/10 fill-pink-400 mr-1"
                                />
                              ))}
                            </div>
                            <p className="text-base md:text-lg italic mb-6 leading-relaxed">
                              "{testimonial.quote}"
                            </p>
                            <div>
                              <p className="font-medium">{testimonial.author}</p>
                              <p className="text-sm">{testimonial.role}</p>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${index === activeTestimonial ? "w-8 bg-pink-500" : "w-2 bg-gray-300"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <Button
              isIconOnly
              variant="bordered"
              className="absolute lg:ml-[22vw] lg:mt-[100px] top-1/2 left-4 -translate-y-1/2  hover:bg-black/70 bg-gray-600 hover:border-pink-500/50 hidden md:flex text-white"
              onClick={goToPrevious}
              aria-label="Previous testimonial"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>

            <Button
              isIconOnly
              variant="bordered"
              className="absolute lg:mr-[22vw] lg:mt-[100px] top-1/2 right-4 -translate-y-1/2 bg-gray-600 hover:bg-black/70 hover:border-pink-500/50 hidden md:flex text-white"
              onClick={goToNext}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>



      </main>
    </PublicLayout>
  );
};

export default Home;


export const loader: LoaderFunction = async ({ request }) => {
  const { blogs } = await blog.getBlogs({
    request,
    limit: 3, // Specify the limit here
  });

  return json({ blogs });
};
