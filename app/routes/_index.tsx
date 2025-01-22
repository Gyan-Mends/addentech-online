import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";

import PublicLayout from "~/components/PublicLayout";
import { Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Switch } from "@nextui-org/react"

import jl from "~/components/images/JL.png"
import testimonial from "~/components/images/670c83518128ff5c009e4a93_Testimonail Image 3-p-500.webp"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo.png"
import img5 from "~/components/images/668c2173193fa0089dc32016_image-bg.jpg"
import img6 from "~/components/images/about-five1.jpg"
import lineImage from "~/components/images/work-process-line.png"
import { Button, User } from "@nextui-org/react";
// import Support from "~/components/Icons/icons/Support";
import logo2 from "~/components/images/addentech_logo.png"
import logo from "~/components/images/header-logo-blue.svg"
import EmailIcon from "~/components/icons/EmailIcon";
import StarIcon from "~/components/icons/StarIcon";
import NetworkIcon from "~/components/icons/NetworkIcon";
import { json, LoaderFunction } from "@remix-run/node";
import { getSession } from "~/session";
import usersController from "~/controller/Users";
import { BlogInterface, RegistrationInterface } from "~/interface/interface";
import Users from "./admin.users";
import blog from "~/controller/blog";
import { useTheme } from "next-themes";
import SunIcon from "~/components/icons/SunIcon";
import MoonIcon from "~/components/icons/MoonIcon";
import FacebookIcon from "~/components/icons/FacebookIcon";
import InstagramIcon from "~/components/icons/InstagramIcon";
import InIcon from "~/components/icons/InIcon";
import XIcon from "~/components/icons/XIcon";
import YouTubeIcon from "~/components/icons/YoutubeIcon";
import LocationIcon from "~/components/icons/LocationIcon";
import { AnimatedTestimonials } from "~/components/acternity/carosel";
import { CardBody, CardContainer, CardItem } from "~/components/acternity/3d";

// import AWS from "~/components/Icons/icons/AWS";

const Index = () => {

  const {
    // user,
    users,
    blogs
  } = useLoaderData<{
    // user: { _id: string },
    users: RegistrationInterface[],
    blogs: BlogInterface[]
  }>()
  const location = useLocation();
  const testimonials = [
    {
      id: 1,
      stars: 5,
      text: "This CRM has transformed our sales process! Our team's productivity has skyrocketed, and we’ve closed more deals than ever before. The intuitive interface made onboarding a breeze.",
      author: "Johnathan Doe",
      position: "CEO at Addentech",
      image: img6
    },
    {
      id: 2,
      stars: 5,
      text: "The best investment we’ve made! Managing customer interactions has never been easier. The insights we get are invaluable.",
      author: "Sarah Lee",
      position: "Marketing Manager at MarketPro",
      image: img5
    },
    {
      id: 3,
      stars: 5,
      text: "A fantastic tool that has streamlined our workflows and increased our team's efficiency. Highly recommend it!",
      author: "Michael Smith",
      position: "Sales Lead at InnovateX",
      image: img6
    },
  ];



  // const blogs = [
  //   {
  //     id: 1,
  //     date: "January 3, 2023",
  //     comments: 0,
  //     title: "Rethinking Server-Timing As A Critical Monitoring Tool",
  //     author: "Addentech",
  //     description:
  //       "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel quas vitae ab exercitationem dolor saepe! Esse ea, debitis...",
  //     img: img5, // Replace with your actual image path
  //     link: "/about",
  //   },
  //   {
  //     id: 2,
  //     date: "January 4, 2023",
  //     comments: 2,
  //     title: "Understanding the New Trends in Web Development",
  //     author: "DevTech",
  //     description:
  //       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit, consequatur eveniet dolorum nemo quaerat laboriosam assumenda.",
  //     img: img6,
  //     link: "/blog/understanding-web-trends",
  //   },
  //   {
  //     id: 3,
  //     date: "January 5, 2023",
  //     comments: 5,
  //     title: "Boosting Your App's Performance with React",
  //     author: "TechPro",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eu risus vitae odio interdum fermentum.",
  //     img: img5,
  //     link: "/blog/react-performance",
  //   },
  // ];

  const team = [
    {
      name: "Micheal Brown",
      position: "Sales Director",
      image: img5, // Real online image for team
    },
    {
      name: "Jane Doe",
      position: "Marketing Manager",
      image: img6, // Real online image for team
    },
    {
      name: "Alex Smith",
      position: "Operations Lead",
      image: img5,
    },
  ];

  // Online images for background slideshow
  const backgroundImages = [
    img5,
    img6,
    img5,
  ];
  const [currentBackground, setCurrentBackground] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 9000); // Change every 9 seconds
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme()
  const menuItems = [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
    { text: "Services", href: "/services" },
    { text: "Contact", href: "/contact" },
    { text: "blog", href: "/blog" },
    { text: "team", href: "/team" },
  ];

  const testimonial = [
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Sarah Chen",
      designation: "Product Manager at TechFlow",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Emily Watson",
      designation: "Operations Director at CloudScale",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
      name: "Lisa Thompson",
      designation: "VP of Technology at FutureNet",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];



  return (
    <div className="overflow-x-hidden">
      {/* Background Slideshow */}
      <div
        style={{
          backgroundImage: `url(${img5})`,
          backgroundPosition: '50%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '500px',
          position: 'relative',
        }}
      >
        {/* Navbar */}
        <Navbar
          isBordered={false}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
          isBlurred
          className="top-0 left-0 w-full py-1 flex fixed z-50"
        >
          <NavbarContent className="lg:hidden">
            <NavbarMenuToggle
              className="text-black dark:text-white"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            />
          </NavbarContent>

          <NavbarContent justify="start">
            <NavbarItem>
              <div className="w-40 h-10 text-white">
                <img
                  className="w-40 h-10 text-white"
                  src={logo || "~/components/images/addentech_logo.png"}
                  alt="Addentech Logo"
                />
              </div>
            </NavbarItem>
          </NavbarContent>

          <NavbarContent justify="center" className="hidden lg:flex w-full">
            <NavbarItem className="flex gap-6 ml-10 dark:text-white">
              <Link
                className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/' ? 'bg-primary rounded-lg' : ''
                  }`}
                to="/"
              >
                Home
              </Link>
              <Link
                className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/contact' ? 'bg-primary rounded-lg' : ''
                  }`}
                to="/contact"
              >
                Contact
              </Link>
              <Link
                className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/services' ? 'bg-primary rounded-lg' : ''
                  }`}
                to="/services"
              >
                Services
              </Link>
              <Link
                className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/about' ? 'bg-primary rounded-lg' : ''
                  }`}
                to="/about"
              >
                About
              </Link>
              <Link
                className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/blog' ? 'bg-primary rounded-lg' : ''
                  }`}
                to="/blog"
              >
                Blog
              </Link>
              <Link
                className={`font-nunito p-2 hover:rounded-lg ${location.pathname === '/s' ? 'bg-primary rounded-lg' : ''
                  }`}
                to="/s"
              >
                Team
              </Link>
            </NavbarItem>
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <Switch
                className=""
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                size="md"
                thumbIcon={({ className }) =>
                  theme === "light" ? <SunIcon className={className} /> : <MoonIcon className={className} />
                }
              />
            </NavbarItem>
          </NavbarContent>

          <NavbarMenu>
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.text}-${index}`}>
                <Link className="w-full" to={item.href}>
                  {item.text}
                </Link>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </Navbar>

        {/* Hero Section */}
        <div className="flex flex-col gap-10 min-h-screen lg:px-40 justify-center px-4 text-white text-center lg:text-left">
          {/* Main Headline */}
          <div>
            <p data-aos="fade-right" data-aos-duration="100000" className="text-4xl lg:text-6xl font-extrabold font-montserrat leading-tight">
              Transforming the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
                Legal
              </span>
            </p>
            <p data-aos="fade-left" data-aos-duration="100000" className="text-4xl lg:text-6xl font-extrabold font-montserrat mt-2"> Landscape</p>
            <p data-aos="fade-right" data-aos-duration="100000" className="text-4xl lg:text-6xl font-extrabold font-montserrat mt-2">
              with <span className="text-[#F2059F]">Dennis Law</span>
            </p>
          </div>

          {/* Subheadline */}
          <div className="text-lg font-nunito text-gray-300 max-w-2xl mx-auto lg:mx-0">
            <p data-aos="fade-left" data-aos-duration="100000">Transform the digital landscape with cutting-edge solutions.</p>
            <p data-aos="fade-right" data-aos-duration="100000">Designed for **SaaS, Fintech, CRM,** and **Tech startups**.</p>
            <p data-aos="fade-left" data-aos-duration="100000">Customize and boost your online presence.</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center lg:justify-start">
            <Link to="/about">
              <Button data-aos="fade-in" data-aos-duration="100000" className="font-nunito bg-primary shadow-lg text-lg text-white px-6 py-3 rounded-xl transition-transform transform hover:-translate-y-2 duration-1000">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>






      <div className="lg:px-40 px-2">
        <div style={{
          backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
          backgroundPosition: '50%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '500px',
          position: 'relative',
        }} className="mt-40">
          <div data-aos="fade-right" >
            <p className="font-nunito dark:text-white text-2xl font-bold text-[#F2059F]">Explore more of our products</p>
            <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Top-Notch Software Development and</p>
            <p className="font-nunito dark:text-white text-4xl font-bold">
              Digital Transformation
            </p>
          </div>
          <div className="lg:grid lg:grid-cols-2 gap-10 mt-10">
            <div>
              <Link to="https://www.justicelocator.com/" >
                <CardContainer className="inter-var">
                  <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                      Justice Locator
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                      Hover over this card to unleash the power of CSS perspective
                    </CardItem>
                    <CardItem
                      translateZ="100"
                      rotateX={20}
                      rotateZ={-10}
                      className="w-full mt-4"
                    >
                      <img
                        src={jl}
                        className="h-80 w-full  rounded-xl group-hover/card:shadow-xl"
                        alt="thumbnail"
                      />
                    </CardItem>

                  </CardBody>
                </CardContainer>
              </Link>
            </div>
            <div>
              <Link to="https://www.justicelocator.com/" >
                <CardContainer className="inter-var">
                  <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                      Justice Locator
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                      Hover over this card to unleash the power of CSS perspective
                    </CardItem>
                    <CardItem
                      translateZ="100"
                      rotateX={20}
                      rotateZ={-10}
                      className="w-full mt-4"
                    >
                      <img
                        src={dl}
                        className="h-80 w-full  rounded-xl group-hover/card:shadow-xl"
                        alt="thumbnail"
                      />
                    </CardItem>

                  </CardBody>
                </CardContainer>
              </Link>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-2 gap-10 mt-10">
            <div>
              <Link to="https://www.justicelocator.com/" >
                <CardContainer className="inter-var">
                  <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                      Justice Locator
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                      Hover over this card to unleash the power of CSS perspective
                    </CardItem>
                    <CardItem
                      translateZ="100"
                      rotateX={20}
                      rotateZ={-10}
                      className="w-full mt-4"
                    >
                      <img
                        src={mr}
                        className="h-80 w-full  rounded-xl group-hover/card:shadow-xl"
                        alt="thumbnail"
                      />
                    </CardItem>

                  </CardBody>
                </CardContainer>
              </Link>
            </div>
            <div>
              <Link to="https://www.justicelocator.com/" >
                <CardContainer className="inter-var">
                  <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                    <CardItem
                      translateZ="50"
                      className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                      Justice Locator
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                      Hover over this card to unleash the power of CSS perspective
                    </CardItem>
                    <CardItem
                      translateZ="100"
                      rotateX={20}
                      rotateZ={-10}
                      className="w-full mt-4 h-80"
                    >
                      <img
                        src={news}
                        className="h-60 w-full  rounded-xl group-hover/card:shadow-xl"
                        alt="thumbnail"
                      />
                    </CardItem>

                  </CardBody>
                </CardContainer>
              </Link>
            </div>
          </div>
        </div>



        <div style={{
          backgroundImage: `url("https://cdn.prod.website-files.com/66614d9079739759bbd5e68e/668d0c2f28f1313d27252c3d_service-shape-bg-2.svg")`,
          backgroundPosition: '100%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '500px',
          position: 'relative',
        }} className="lg:grid lg:grid-cols-2 lg:mt-40 mt-10 h-full lg:flex  gap-20">
          <div

            className="">
            <img data-aos="fade-right" className="rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105" src={img6} alt="" />
            <img data-aos="fade-left" className="lg:ml-60 lg:-mt-60 mt-10 rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105" src={img6} alt="" />
          </div>
          <div data-aos="zoom-in" className="flex flex-col gap-10 mt-10 lg:mt-0 pl-20 pt-10">
            <p className="font-montserrat text-2xl font-bold dark:text-white"> About Us</p>
            <p className="font-montserrat lg:text-5xl text-3xl font-bold dark:text-white"> Customer-Centric Legal Tech Solutions</p>
            <p className="font-nunito text-md font-bold dark:text-white "> At Addentech, our customer-centric approach sets us apart. We deliver innovative legal technology solutions that make legal services affordable and accessible. Our commitment to excellence ensures we create a supportive and innovative environment for our clients.</p>
            <Link to="/about">
              <Button
                color="default"
                className="font-nunito  bg-[#F2059F] text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
              >
                Learn More
              </Button></Link>
          </div>
        </div>

        <div className="lg:mt-40 mt-20">
          <div data-aos="fade-right">
            <p className="font-nunito dark:text-white text-xl font-bold text-[#F2059F]">Here is How We Can Help Your Business</p>
            <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Comprehensive Services Tailored </p>
            <p className="font-nunito dark:text-white text-4xl font-bold">
              to Your Needs
            </p>
          </div>
          <div data-aos="fade-down" className="lg:grid lg:grid-cols-3 gap-8 mt-20">
            <div className=" w-full h-full  border dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
              <div className="w-full flex  items-center justify-center">
                <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-sm border dark:border-white/5 border-black/10">
                  <NetworkIcon className="text-[#05ECF2] h-8 w-8 " />
                </div>
              </div>
              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Digital Marketing & Consultation
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Maximize digital presence with expert SEO, social media strategies, email campaigns, and performance analytics. We help you reach and engage your audience.            </p>
            </div>

            <div className=" w-full h-[25vh] mt-10 lg:mt-0 border dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
              <div className="w-full flex  items-center justify-center">
                <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                  {/* <CodingIcon className="text-[#05ECF2] h-8 w-8 " /> */}
                </div>
              </div>
              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Design & Development
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Innovative website design and development, tailored to your business needs. We create intuitive and visually appealing sites that drive results.</p>
            </div>

            <div className=" w-full mt-10 lg:mt-0  h-[25vh] border dark:border-white/5 border-black/20  shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
              <div className="w-full flex  items-center justify-center">
                <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                  {/* <Support className="text-[#05ECF2] h-8 w-8 " /> */}
                </div>
              </div>
              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                IT Services
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Support and management of IT systems, including hardware, software, networks, and security. We ensure your technology infrastructure is robust and efficient.</p>
            </div>
          </div>

          <div data-aos="fade-up" className="lg:grid lg:grid-cols-2 gap-16 mt-16">

            <div className=" w-full h-[25vh] border dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
              <div className="w-full flex  items-center justify-center">
                <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                  <img src={logo} className=" bg-[#05ECF2] h-8 w-8 " alt="" />
                </div>
              </div>
              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Brand & Product Design
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Creating strong brand identities through thoughtful design of logos, packaging, and overall brand aesthetics. We help your brand connect with customers.


              </p>
            </div>

            <div className=" w-full h-[25vh] border  dark:border-white/5 border-black/20 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10 lg:mt-0 mt-16">
              <div className="w-full flex  items-center justify-center">
                <div className="h-12 dark:bg-[#0b0e13] bg-white w-12 flex items-center justify-center rounded-full -mt-6 shadow-md border dark:border-white/5 border-black/10">
                  {/* <AWS className="text-[#05ECF2] h-8 w-8 " /> */}
                </div>
              </div>
              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Cloud Services
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Robust cloud services providing scalable computing resources and secure data storage solutions. We enable flexibility and efficiency in your operations.</p>
            </div>
          </div>
        </div>

        <div className="mt-40">
          <p data-aos="fade-right" className="font-nunito dark:text-white text-4xl font-bold mt-8">
            Latest Blog, News & Articles
          </p>

          <div className="lg:grid lg:grid-cols-3 gap-4 mt-20">
            {blogs.slice(0, 3).map((blog: BlogInterface, index: number) => (
              <Link to={`/blog/${blog._id}`}>
                <div data-aos="fade-in" data-aos-duration="100000" className="mt-4">
                  <img className="h-80 w-full  rounded-xl" src={blog.image} alt="" />
                  <span className="flex gap-8 mt-4">
                    <p className="font-nunito text-gray-600"> {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</p>
                    <p className="font-nunito text-gray-600">{blog.admin?.firstName}</p>
                  </span>
                  <p className="mt-4 font-nunito font-bold text-xl">{truncateText(blog?.name, 10)}
                  </p>
                  <p className="mt-4 font-nunito">
                    {truncateText(blog?.description, 30)}

                  </p>

                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-40">
          <div data-aos="fade-right">
            <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Our Methodology Guarantees
            </p>
            <p className="font-nunito dark:text-white text-4xl font-bold">
              Your Success
            </p>
            <img src={lineImage} className=" mt-5" alt="" />
          </div>
          <div className="lg:grid lg:grid-cols-5 gap-4 mt-20">
            <div data-aos="fade-right" className=" w-full h-full border pb-6 dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">
              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Discover
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                We begin by understanding your needs, goals, and target audience through market research and competitor analysis. This helps us gather precise requirements to define the project scope effectively.          </p>
            </div>

            <div data-aos="fade-right" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Planning
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                A detailed project plan is crafted, outlining tasks, timelines, resources, and milestones to ensure a clear roadmap for successful project execution.</p>
            </div>

            <div data-aos="fade-down" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Design & Development            </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Our designers create visual elements while developers build the functionality. This stage brings your vision to life with innovative and user-friendly solutions</p>
            </div>

            <div data-aos="fade-left" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Testing
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Once the development phase is complete, rigorous testing is conducted to ensure the product or service functions as intended and meets quality standards.</p>
            </div>

            <div data-aos="fade-left" className=" w-full h-full border dark:border-white/30 border-black/10 mt-8 lg:mt-0 shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105 px-10">

              <p className="dark:text-white font-nunito font-bold text-xl mt-4">
                Project Delivery
              </p>
              <p className=" font-nunito text-gray-400  mt-4">
                Upon successful testing and any necessary revisions, the final product or service is delivered to you. This may include deployment, launching a website, or implementing a marketing campaign.</p>
            </div>
          </div>


        </div>

        {/* Team Section */}
        <div className="lg:flex justify-between lg:mt-40 mt-20">
          <div data-aos="fade-right" className="">
            <p className="font-montserrat text-4xl font-bold dark:text-white">Meet Our Dedicated Experts Behind
            </p>
            <p className="font-montserrat text-4xl font-bold dark:text-white"> Addentech  Success
            </p>
          </div>
          <div data-aos="fade-left" className="">
            <Link to="/team">
              <Button
                color="default"
                className="font-nunito bg-[#F2059F] mt-8 lg:mt-0 text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
              >
                See all our team members
              </Button></Link>
          </div>
        </div>
        <div className="lg:grid lg:grid-cols-4 gap-10 lg:mt-40 ">
          {users.slice(0, 4).map((member, index) => (
            <div
              data-aos="zoom-in"
              key={index}
              className={`w-full h-[50vh] rounded-2xl ${index === 1 || index === 3 ? 'mt-20' : 'mt-40 lg:mt-0'}`}
            >
              <div className="h-[50vh] overflow-hidden rounded-2xl relative group">
                {/* Image */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                  src={member.image}
                  alt={member.name}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  {/* Name */}
                  <p className="text-white font-nunito text-lg">{member.firstName + " " + member.middleName + " " + member.lastName}</p>
                  <p className="text-white font-nunito text-lg">{member.phone}</p>
                </div>
              </div>
            </div>
          ))}



        </div>

        {/* Testimonials Section */}
        <div className="mt-60 overflow-hidden relative">
          <div data-aos="fade-right">
            <p className="dark:text-white font-montserrat text-4xl font-bold">Client experiences that</p>
            <p className="dark:text-white font-montserrat text-4xl font-bold">inspire confidence</p>
          </div>

          <AnimatedTestimonials testimonials={testimonial} />
        </div>

        <footer className="mt-10 lg:mt-40">
          <div className="lg:flex dark:bg-[rgb(14,17,22)] shadow-sm lg:h-40 h-full py-4 rounded-2xl border dark:border-white/30 border-black/10 items-center lg:px-20 px-4  justify-between">
            <div>
              <p className="dark:text-white font-montserrat font-bold lg:text-4xl text-2xl">Transform your business  </p>
              <p className="dark:text-white font-montserrat font-bold lg:text-4xl mt-2 text-2xl">with us effortlessly</p>
            </div>
            <div className="flex gap-4 mt-6 lg:mt-0">
              <Link to="/contact">
                <Button
                  className="bg-[#05ECF2] font-nunito text-lg  hover:transition hover:duration-500  hover:-translate-y-2 "
                >
                  Contact us
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  color="default"
                  className="font-nunito bg-[#F2059F] text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
                >
                  Learn More
                </Button></Link>
            </div>
          </div>


          <div className="mt-10 lg:grid lg:grid-cols-3 md:grid md:grid-cols-3 gap-8 py-8 dark:bg-[rgb(14,17,22)] shadow-sm lg:h-80  h-full px-8 rounded-2xl border dark:border-white/30 border-black/10  lg:px-20">
            {/* location */}
            {/* location */}
            <div className="lg:mt-10">
              <p className="dark:text-default-500 font-poppins text-lg">Locate Us</p>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center justify-center  gap-4">
                  <LocationIcon className="dark:text-[#05ECF2] h-6 w-6 hover:text-[#F2059F] hover:transition hover:duration-500" />
                </div>
                <div>
                  <p className="dark:text-white font-nunito">No. 15 Netflix Street, Madina</p>
                  <p className="dark:text-white font-nunito">Estates</p>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center justify-center  gap-4">
                  {/* <PhoneIcon className="dark:text-[#05ECF2] h-6 w-6 hover:text-[#F2059F]" /> */}
                </div>
                <div>
                  <p className="dark:text-white font-nunito">+233-30-291-4988 </p>
                </div>
              </div>
            </div>
            {/* pages */}
            {/* pages */}
            <div className="mt-10 lg:mt-10">
              <p className="dark:text-default-500 font-poppins text-lg">Services</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to=" ">
                  <p className="dark:text-white font-nunito hover:text-[#05ECF2] hover:transition hover:duration-500">Brand & Product Design</p>
                </Link>
                <Link to=" ">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Design & Development</p>
                </Link>
                <Link to=" ">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Cloud Services</p>
                </Link>
                <Link to=" ">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Digital Marketing and Consultation</p>
                </Link>
                <Link to=" ">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">IT Services</p>
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-10">
              <p className="dark:text-default-500 font-poppins text-lg">Pages</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/">
                  <p className="dark:text-white font-nunito hover:text-[#05ECF2] hover:transition hover:duration-500">Home</p>
                </Link>
                <Link to="/contact">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Contact</p>
                </Link>
                <Link to="/about">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">About Us</p>
                </Link>
                <Link to="/blog">
                  <p className="dark:text-white font-nunito hover:transition hover:duration-500 hover:text-[#05ECF2]">Blog</p>
                </Link>

              </div>
            </div>
          </div>

        </footer>
      </div>


    </div>
  );
};

export default Index;


export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("email");
  // if (!token) {
  //     return redirect("/")
  // }
  const { user, users, totalPages } = await usersController.FetchUsers({
    request,
    page,
    search_term
  });
  const { blogs } = await blog.getBlogs({
    request,
    page,
    search_term
  });

  return json({ user, users, totalPages, blogs });
}


