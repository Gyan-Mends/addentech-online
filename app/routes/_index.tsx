import PublicLayout from "~/layout/PublicLayout";
import { Badge, Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import heroimage from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import CheckedIcon from "~/components/icons/CheckedIcon";
import { Link, useLoaderData } from "@remix-run/react";
import img5 from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import { ProductCard } from "~/components/produt";
import { ArrowRight, User } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import blog from "~/controller/blog";
import { BlogInterface } from "~/interface/interface";



const Home = () => {

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
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-black to-gray-900 px-4 lg:px-[125px]">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="container relative">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="font-montserrat text-4xl md:text-6xl leading-tight tracking-tighter">
                    Transforming the{" "}
                    <span className="bg-blue-500 bg-clip-text text-transparent">
                      Legal Landscape
                    </span>{" "}
                    with Dennis Law
                  </h1>
                  <p className="font-montserrat text-xl text-muted-foreground max-w-[600px]">
                    Powering the future of legal services with cutting-edge technology solutions designed for modern law
                    practices.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="#products">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
                  <Link to="/about">
                    <Button >Learn More</Button>
                  </Link>
                </div>
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
              </div>
              <div className="relative hidden md:block">
                <div className="relative h-[500px] w-full overflow-hidden rounded-lg border border-border/40 border-white/20 bg-background/50 p-2 backdrop-blur">
                  <img
                    src={heroimage}
                    alt="Legal dashboard interface"
                    className="rounded-md object-cover h-full w-full"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-lg border border-border/40 bg-background/90 p-1 backdrop-blur">
                  <div className="h-full w-full rounded bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <CheckedIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <ProductCard id="products" />

        {/* Customer Centric Section */}
        <section className="py-20 lg:px-[125px] px-4 bg-gradient-to-br from-gray-900 to-black">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img
                    src={img5}
                    alt="Legal professionals"
                    width={300}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-lg mt-8">
                  <img
                    src={img5}
                    alt="Legal consultation"
                    width={300}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-primary-500 bg-clip-text  text-xl font-bold font-montserrat ">Customer Centric</p>
                <h2 className="text-3xl md:text-3xl font-bold font-montserrat">Legal Tech Solutions That Put Clients First</h2>
                <p className="text-muted-foreground font-nunito">
                  Our innovative approach combines legal expertise with cutting-edge technology to deliver solutions
                  that truly address the needs of modern law practices and their clients.
                </p>
                <ul className="space-y-2">
                  {["Client-focused design", "Intuitive interfaces", "Secure data handling", "Compliance-ready"].map(
                    (item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                          <CheckedIcon className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-nunito">{item}</span>
                      </li>
                    ),
                  )}
                </ul>
                <Link to="/about">
                  <Button variant="bordered" className="border mt-4 border-primary-500 border-2 text-white font-montserrat">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 lg:px-[125px] bg-black">
          <div className="container">
            <div className="text-center mb-16">
              <p className="mb-4 bg-clip-text text-primary text-xl">Our Services</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Comprehensive Services Tailored to Your Needs</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto font-montserrat">
                We offer a wide range of legal technology services designed to meet the specific needs of modern law
                firms.
              </p>
            </div>

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
                <Card
                  key={i}
                  className="border group bg-background/50 border-primary-500/30 h-48 backdrop-blur transition-all hover:border-primary-500/50 hover:bg-background/80 p-6 bg-[#09090B80]"
                >
                  <div className="flex flex-col gap-4">
                    <p className="font-bold font-montserrat text-lg group-hover:text-primary-500">{service.title}</p>
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
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-20 lg:px-[125px] bg-gradient-to-br from-black to-gray-900">
          <div className="container">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-12">
              <div>
                <p className="mb-2 font-bold font-montserrat  bg-clip-text text-primary-500 text-xl">Latest Insights</p>
                <h2 className="text-3xl md:text-4xl font-bold font-montserrat">Blog, News & Articles</h2>
              </div>
              <Button variant="bordered" className="font-montserrat border border-2 border-primary-500">
                View all articles
                {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "The Future of AI in Legal Practice",
                  description: "Explore how artificial intelligence is transforming the legal industry.",
                  date: "May 2, 2023",
                  image: img5
                },
                {
                  title: "Cybersecurity for Law Firms",
                  description: "Essential security practices every modern law firm should implement.",
                  date: "April 15, 2023",
                  image: img5,
                },
                {
                  title: "Digital Transformation in Legal Services",
                  description: "How technology is reshaping client expectations and service delivery.",
                  date: "March 28, 2023",
                  image: img5,
                },
              ].map((article, i) => (
                <Card key={i} className="overflow-hidden border-border/40 bg-background/50 backdrop-blur">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      width={400}
                      height={200}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground font-nunito">{article.date}</div>
                    <p className="line-clamp-2 font-bold text-lg font-monserrate">{article.title}</p>
                    <p className="line-clamp-2 font-nunito">{article.description}</p>
                  </div>
                  <CardFooter>
                    <Link to="/blog">
                    <Button variant="ghost" size="sm" className="group">
                      Read article
                      {/* <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /> */}
                    </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-20 lg:px-[125px] p-4 bg-black">
          <div className="container">
            <div className="text-center mb-16">
              <p className="mb-4 font-bold font-montserrat  bg-clip-text text-primary text-xl">Our Approach</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Our Methodology Guarantees Your Success</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto font-nunito">
                We follow a proven methodology to ensure the success of your legal technology implementation.
              </p>
            </div>

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
                <Card key={i} className="bg-[#09090B80] border hover:border-pink-500/50 border-white/10 backdrop-blur p-6">
                  <CardHeader>
                    <p className="font-bold font-montserrat">{phase.title}</p>
                  </CardHeader>
                  <p className="font-nunito">
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckedIcon className="h-4 w-4 text-primary-500 mt-1" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 lg:px-20 bg-gradient-to-br from-gray-900 to-black">
          <div className="container">
            <div className="text-center mb-16">
              <p className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent text-xl font-bold font-montserrat">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Experiences That Build Confidence</h2>
              <p className="text-muted-foreground max-w-[800px] mx-auto font-nunito">
                Hear what our clients have to say about their experience working with us.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2 border-border/40 bg-background/50 backdrop-blur p-10">
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
                      //   <Star key={i} className="h-5 w-5 fill-pink-500 text-pink-500" />
                      <p key={i}>!</p>
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
                  src={img5}
                  alt="Testimonial"
                  width={300}
                  height={400}
                  className="h-full w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        // <Star key={i} className="h-4 w-4 fill-pink-500 text-pink-500" />
                        <p key={i}>!</p>
                      ))}
                    </div>
                    <p className="text-md mb-2 font-nunito">
                      "Dennis Law's client portal has revolutionized how we communicate with clients."
                    </p>
                    <div className="text-md text-muted-foreground font-nunito">Michael Chen, Litigation Specialist</div>
                  </div>
                </div>
              </div>
            </div>
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
  });

  return json({ blogs });
}