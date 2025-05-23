import PublicLayout from "~/layout/PublicLayout";
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Chip } from "@nextui-org/react";
import heroimage from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import CheckedIcon from "~/components/icons/CheckedIcon";
import { Link, useLoaderData } from "@remix-run/react";
import img5 from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import { ProductCard } from "~/components/produt";
import { ArrowRight, ChevronRight, Star, User } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import blog from "~/controller/blog";
import { BlogInterface } from "~/interface/interface";
import ScrollAnimation from "~/components/animation";
import AdvertBanner from "~/components/advert";
import { useEffect, useState } from "react";



const Home = () => {
  const truncateText = (text, wordLimit) => {
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

  const goToSlide = (index) => {
    setActiveTestimonial(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000)
  }


  return (
    <PublicLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden  py-2 lg:py-20 md:py-32 dark:bg-gradient-to-br from-black to-gray-900 px-4 lg:px-[125px]">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="container relative">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-10">
                <div className="space-y-10">
                  <ScrollAnimation>
                    <h1 className="text-4xl  md:text-6xl font-montserrat font-bold leading-tight tracking-tighter">
                      Transforming the{" "}
                      <span className="text-pink-500">
                        Legal Landscape
                      </span>{" "}
                      with Technology
                    </h1>
                  </ScrollAnimation>
                  <ScrollAnimation delay={0.3}>
                    <p className="font-montserrat lg:text-xl text-lg text-default-400 max-w-[600px]">
                      Powering the future of legal services with cutting-edge technology solutions designed for modern law
                      practices.
                    </p>
                  </ScrollAnimation>
                </div>
                <ScrollAnimation delay={0.4}>
                  <div className="flex  gap-4">
                    <Link to="/about">
                      <Button className="">
                        Learn More<ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </ScrollAnimation>
                {/* <ScrollAnimation delay={0.5}>
                  <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg" key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gray-800" />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground font-nunito">
                    Trusted by <span className="font-medium text-pink-500">500+</span> law firms
                  </div>
                </div>
                </ScrollAnimation> */}
              </div>
              <div className="relative hidden md:block">
                <ScrollAnimation >
                  <div
                    className="relative  h-[500px] w-full overflow-hidden rounded-lg border border-border/40 border-black/20 bg-default-300 p-2 backdrop-blur hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500"
                  >
                    <img
                      src="https://res.cloudinary.com/djlnjjzvt/image/upload/v1747070545/hero1_rfu05r.jpg"
                      alt="Legal dashboard interface"
                      className="rounded-md object-cover h-full w-full"
                    />
                  </div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.3}>
                  <div className="absolute -bottom-6 -left-6 h-24 w-24 hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-110 transition-transform duration-500 rounded-lg border border-black/20 bg-default-300 p-1 backdrop-blur">
                    <div className="h-full w-full rounded bg-pink-500 flex items-center justify-center">
                      <CheckedIcon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
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
        <section id="services" className="lg:py-20 py-10 lg:px-[125px] px-4 bg-gray-100">
          <div className="container">
            <ScrollAnimation>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Comprehensive Services Tailored to Your Needs</h2>
                <p className="text-muted-foreground max-w-[800px] mx-auto font-montserrat">
                  We offer a wide range of legal technology services designed to meet the specific needs of modern law
                  firms.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Digital Marketing & Consultation",
                  description: "Maximize digital presence with expert SEO, social media strategies, email campaigns, and...",
                  icon: "laptop",
                },
                {
                  title: "Design & Development",
                  description:
                    "Innovative website design and development tailored to your business needs...",
                  icon: "brain",
                },
                {
                  title: "IT Services",
                  description: "Support and management of IT systems, including business software, networks, and security...",
                  icon: "search",
                },

              ].map((service, i) => (
                <ScrollAnimation>
                  <Card
                    key={i}
                    className="border group  border-black/20 h-48 backdrop-blur transition-all hover:border-pink-500/50 hover:bg-background/80 p-6 hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500"
                  >
                    <div className="flex flex-col gap-4">
                      <p className="font-bold font-montserrat   text-xl">{service.title}</p>
                      <p>{service.description}</p>
                    </div>
                    <CardFooter className="mt-4">
                      <Link to="/services/#services-section">
                        <Button variant="ghost" size="sm" className="group">
                          Learn more
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>
          <ScrollAnimation>
            <div className="flex justify-center items-center h-[100px] mt-12">
              <Link to="/services#services-section">
                <Button>View More Services <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>

          </ScrollAnimation>
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
                  <Button variant="bordered" className="font-montserrat border border-2 ">
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
                        src={article.image || "/placeholder.svg"}
                        alt={article.name}
                        width={400}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="text-sm text-default-400 font-nunito">{new Date(article?.createdAt).toLocaleDateString("en-US", {
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

                      <Link to={`/blog/${article._id}`} key={article._id}>
                        <Button variant="ghost" size="sm" className="group border border-2  hover:border-default-200">
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
