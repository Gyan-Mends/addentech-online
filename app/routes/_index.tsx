import PublicLayout from "~/layout/PublicLayout";
import { Badge, Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import heroimage from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import CheckedIcon from "~/components/icons/CheckedIcon";
import { Link, useLoaderData } from "@remix-run/react";
import img5 from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import { ProductCard } from "~/components/produt";
import { ArrowRight, Star, User } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import blog from "~/controller/blog";
import { BlogInterface } from "~/interface/interface";
import ScrollAnimation from "~/components/animation";



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

  return (
    <PublicLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden lg:!h-[100vh] py-2 lg:py-20 md:py-32 dark:bg-gradient-to-br from-black to-gray-900 px-4 lg:px-[125px]">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="container relative">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-10">
                <div className="space-y-10">
                  <ScrollAnimation>
                    <h1 className="text-4xl  md:text-6xl font-montserrat font-bold leading-tight tracking-tighter">
                    Transforming the{" "}
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      Legal Landscape
                    </span>{" "}
                    with Addentechnology
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
                  <Link to="#products">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
                  <Link to="/about">
                    <Button >Learn More<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                </ScrollAnimation>
                <ScrollAnimation delay={0.5}>
                  <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img src="https://assets-cdn.123rf.com/index/static/assets/all-in-one-plan/photos_v2.jpg" key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gray-800" />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground font-nunito">
                    Trusted by <span className="font-medium text-foreground">500+</span> law firms
                  </div>
                </div>
                </ScrollAnimation>
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
                  <div className="h-full w-full rounded bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <CheckedIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <ProductCard id="products" />

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
                <ScrollAnimation >
                  <p className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent   text-xl font-bold font-montserrat ">Customer Centric</p>
                </ScrollAnimation>
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
                        <div className="h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600   flex items-center justify-center">
                          <CheckedIcon className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-nunito">{item}</span>
                      </li>
                    ),
                  )}
                </ul>
                </ScrollAnimation>
                <ScrollAnimation delay={0.5}>
                  <Link to="/about">
                  <Button variant="bordered" className="border mt-4 bg-gradient-to-r from-pink-500 to-purple-600    text-white font-montserrat">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
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
              <p className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-xl">Our Services</p>
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
                  title: "Digital Practice Management",
                  description: "Streamline your legal practice with our comprehensive digital management solutions.",
                  icon: "laptop",
                },
                {
                  title: "Legal AI Development",
                  description:
                    "Leverage the power of artificial intelligence to enhance your legal research and document analysis.",
                  icon: "brain",
                },
                {
                  title: "E-Discovery",
                  description: "Efficiently manage electronic discovery with our advanced search and analysis tools.",
                  icon: "search",
                },
                {
                  title: "Brand & Website Design",
                  description:
                    "Create a compelling online presence that reflects your firm's values and attracts clients.",
                  icon: "palette",
                },
                {
                  title: "Client Portals",
                  description: "Provide secure, 24/7 access to case information and documents for your clients.",
                  icon: "users",
                },
                {
                  title: "Compliance Solutions",
                  description: "Stay compliant with evolving regulations with our specialized legal tech tools.",
                  icon: "shield",
                },
              ].map((service, i) => (
                <ScrollAnimation>
                  <Card
                  key={i}
                    className="border group  border-black/20 h-48 backdrop-blur transition-all hover:border-pink-500/50 hover:bg-background/80 p-6 hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500"
                >
                  <div className="flex flex-col gap-4">
                      <p className="font-bold font-montserrat  bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-xl">{service.title}</p>
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
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-20 lg:px-[125px] px-4 ">
          <div className="container">
            <ScrollAnimation>
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-12">
              <div>
                <p className="mb-2 font-bold font-montserrat  bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-xl">Latest Insights</p>
                <h2 className="text-3xl md:text-4xl font-bold font-montserrat">Blog, News & Articles</h2>
              </div>
              <Link to="/block">
                  <Button variant="bordered" className="font-montserrat border border-2 border-pink-500">
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
                        <Button variant="ghost" size="sm" className="group border border-2 border-pink-500/40 hover:border-default-200">
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
              <p className="mb-4 font-bold font-montserrat  bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-xl">Our Approach</p>
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
                          <CheckedIcon className="h-4 w-4 text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded mt-1" />
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

        {/* Testimonials Section */}
        <section className="py-20 lg:px-20 px-4 ">
          <div className="container">
            <ScrollAnimation>
              <div className="text-center mb-16">
              <p className="mb-4  bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-xl font-bold font-montserrat">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Experiences That Build Confidence</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto font-nunito">
                Hear what our clients have to say about their experience working with us.
              </p>
            </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3} className=" ">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 border border-black/10  hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500 bg-background/50 backdrop-blur p-10 h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={img5}
                        alt="Client"
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg">Jessica Kim</p>
                      <p>Managing Partner, Kim & Associates</p>
                    </div>
                  </div>
                </CardHeader>
                <p>
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-5 w-5 h-4 w-4 fill-pink-500 text-pink-500  bg-clip-text text-transparent " />
                    ))}
                  </div>
                  <p className="text-lg italic font-montserrat">
                    "The solutions provided by Dennis Law have transformed our practice. Our attorneys are now able to
                    focus more on client needs rather than administrative tasks. The implementation was smooth, and the
                    ongoing support has been exceptional."
                  </p>
                </p>
              </Card>
              <div className="relative h-[55vh]">
                <img
                    src='https://res.cloudinary.com/djlnjjzvt/image/upload/v1747077587/e1_gfxcqi.avif'
                  alt="Testimonial"
                  width={300}
                  height={400}
                  className="h-full w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-pink-500 text-pink-500 " />
                      ))}
                    </div>
                      <p className="text-md text-white mb-2 font-nunito">
                      "Dennis Law's client portal has revolutionized how we communicate with clients."
                    </p>
                      <div className="text-md text-white font-nunito">Michael Chen, Litigation Specialist</div>
                  </div>
                </div>
              </div>
            </div>
            </ScrollAnimation>

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
