import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

import PublicLayout from "~/components/PublicLayout";
import jl from "~/components/images/JL.png"
import testimonial from "~/components/images/670c83518128ff5c009e4a93_Testimonail Image 3-p-500.webp"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo.png"
import img5 from "~/components/images/about-five2.jpg"
import img6 from "~/components/images/about-five1.jpg"
import lineImage from "~/components/images/work-process-line.png"
import { Button, User } from "@nextui-org/react";
// import Support from "~/components/Icons/icons/Support";
import logo from "~/components/images/logo.png"
import EmailIcon from "~/components/icons/EmailIcon";
import StarIcon from "~/components/icons/StarIcon";
import NetworkIcon from "~/components/icons/NetworkIcon";
import { json, LoaderFunction } from "@remix-run/node";
import { getSession } from "~/session";
import usersController from "~/controller/Users";
import { BlogInterface, RegistrationInterface } from "~/interface/interface";
import Users from "./admin.users";
import blog from "~/controller/blog";
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


  return (
    <PublicLayout>
      {/* Background Slideshow */}
      <div
        data-aos="fade-up"
        className=" mt-10 lg:h-[90vh] rounded-2xl w-full bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${backgroundImages[currentBackground]})`,
        }}
      >
        <div className="flex flex-col gap-10 rounded-2xl h-[90vh] lg:px-60 justify-center px-4 dark:bg-black/40 bg-black/10 text-white">
          <div>
                      <p className="text-6xl font-montserrat font-bold">Leading the Way in</p>
                      <p className="text-6xl mt-1 font-montserrat font-bold"> Legal Tech </p>
                      <p className="text-6xl mt-1 font-montserrat font-bold">  Solutions</p>
          </div>

          <div className="">
            <p className=" font-nunito font-bold text-[#05ECF2]">Transforming the legal landscape with state-of-the-art technology. </p>
            <p className=" font-nunito font-bold text-[#05ECF2]"> Our solutions are designed to enhance productivity and deliver </p>
            <p className=" font-nunito font-bold text-[#05ECF2]">  exceptional user experiences.</p>
          </div>

          <div className="">
            <Link to="/about">
              <Button
                color="default"
                className="font-nunito  bg-[#F2059F] text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
              >
                Learn More
              </Button></Link>
          </div>
        </div>
      </div>

      <div className="mt-40">
        <div data-aos="fade-right" >
          <p className="font-nunito dark:text-white text-2xl font-bold text-[#F2059F]">Explore more of our products</p>
          <p className="font-nunito dark:text-white text-4xl font-bold mt-8">Top-Notch Software Development and</p>
          <p className="font-nunito dark:text-white text-4xl font-bold">
            Digital Transformation
          </p>
        </div>
        <div className="lg:grid lg:grid-cols-3 gap-8 mt-10">
          <Link to="https://www.justicelocator.com/" >
            <div data-aos="fade-right" className=" w-full  h-[80vh] border dark:border-white/10 border-black/20  shadow-md rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105">
              <div className="mt-10 px-4">
                <img src={jl} alt="" />
                <p className="font-nunito  text-xl font-bold text-[#05ECF2]">Justice Locator</p>
                <p className="font-nunito dark:text-white mt-4">Justice Locator App provides users with the location of the courts in Ghana and helps users to navigate to the court with ease. The App also provides information on cases to be heard in the court and serves as a case tracker showing all the dates that the case came on. </p>
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-10 mt-10 lg:mt-0 pb-10 lg:pb-0">
            <Link className="lg:h-full h-80" to="https://dennislawgh.com">
              <div data-aos="fade-down" className="transition-transform duration-500 ease-in-out hover:scale-105 w-full h-full flex items-center justify-center px-2 border dark:border-white/10 border-black/20 rounded-2xl">
                <img src={dl} alt="" />
              </div>
            </Link>

            <Link to="https://dennislawgh.com">
              <div data-aos="fade-up" className="transition-transform duration-500 ease-in-out hover:scale-105 w-full py-2 h-full flex items-center justify-center px-2 border dark:border-white/10 border-black/20 rounded-2xl">
                <img src={mr} alt="" />
              </div>
            </Link>
          </div>

          <Link to="https://dennislawnews.com/" >
            <div data-aos="fade-left" className="transition-transform duration-500 ease-in-out hover:scale-105 w-full h-[80vh] border dark:border-white/10 border-black/20 shadow-md rounded-2xl">
              <img src={news} alt="" className="rounded-tr-2xl rounded-tl-2xl h-60" />
              <div className="mt-10 px-4">
                <p className="font-nunito  text-xl font-bold text-[#05ECF2]">Denis Law News</p>
                <p className="font-nunito dark:text-white mt-4">Denis Law News is an online news platform that provides up-to-date coverage of legal, national, and international events. With a focus on accuracy, impartiality, and relevance,  insightful articles, and in-depth analysis across a wide range of topics including politics, business, leagl, sports, technology, and more. Denis Law News aims to keep its audience well-informed with timely updates and a commitment to journalistic excellence. Whether you're looking for the latest headlines or comprehensive features, Denis Law News is a trusted source for news and information. </p>
              </div>
            </div>
          </Link>

        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:mt-40 mt-10 h-full lg:flex  gap-20">
        <div className="">
          <img data-aos="fade-right" className="rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105" src={img6} alt="" />
          <img data-aos="fade-left" className="lg:ml-60 lg:-mt-60 mt-10 rounded-2xl transition-transform duration-500 ease-in-out hover:scale-105" src={img5} alt="" />
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
            <div
              data-aos="zoom-in"
              key={blog.id}
              className="h-[94vh] pb-6 mt-16 lg:mt-0 shadow-md rounded-2xl border dark:border-white/5 border-black/10 dark:bg-[rgb(14,17,22)]"
            >
              <img
                src={blog.image}
                className="w-full rounded-tr-2xl rounded-tl-2xl h-[45vh]"
                alt={blog.name}
              />
              <div className="flex justify-between mt-6 px-6">
                <p className="text-gray-400">
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>                <p className="text-gray-400">Comments ({blog.comments})</p>
              </div>
              <div className="px-6 mt-6">
                <p className="font-nunito dark:text-white text-2xl font-bold">
                  {truncateText(blog?.name, 10)} {/* Limit to 20 words */}
                </p>
              </div>
              <div className="px-6 mt-6 flex items-center flex justify-between">
                {/* <User /> */}
                Posted By
                <p></p>
                <p className="font-nunito text-gray-400">
                  <span className="text-[#05ECF2]">{blog.admin?.firstName}</span>
                </p>
              </div>
              <div className="px-6 mt-6 flex items-center">
                {truncateText(blog?.description, 20)} {/* Limit to 20 words */}
              </div>
              <div className="px-6 mt-6 flex items-center">
                <Link to={`/blog/${blog._id}`}>
                  <Button
                    size="sm"
                    color="default"
                    className="font-nunito bg-[#F2059F] text-lg hover:transition hover:duration-500 hover:-translate-y-2 text-white"
                  >
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
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
          <Link to="/about">
            <Button
              color="default"
              className="font-nunito bg-[#F2059F] mt-8 lg:mt-0 text-lg hover:transition hover:duration-500  hover:-translate-y-2  text-white"
            >
              See all our team members
            </Button></Link>
        </div>
      </div> 
      <div className="lg:grid lg:grid-cols-3 gap-10 lg:mt-40 ">
        {users.slice(0, 3).map((member, index) => (
          <div data-aos="zoom-in" key={index} className="w-full h-[60vh] border border-black/10 dark:border-white/5 rounded-2xl mt-40 lg:mt-0">
            <div className="w-full flex items-center justify-between px-10  h-28  rounded-tr-2xl rounded-tl-2xl">
              <div>
                <p className="font-nunito text-lg dark:text-white font-bold">{member?.firstName + " " + member?.middleName + " " + member?.lastName}</p>
                <p className="font-nunito text-md dark:text-white">{member.position}</p>
              </div>
              <div>
                <Link to="">
                  <EmailIcon className="h-6 w-6 text-[#05ECF2]" />
                </Link>
              </div>
            </div>
            <div className="h-[60vh] overflow-hidden rounded-bl-2xl rounded-br-2xl">
              <img
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                src={member.image}
                alt={member.name}
              />
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

        <div className="mt-20 flex items-center relative  rounded-xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentBackground * 100}%)`,
            }}
          >
            {testimonials.map((testimonial) => (
              <div data-aos="fade-left" key={testimonial.id} className="min-w-full flex flex-col lg:flex-row gap-10">
                <div className="pr-10 lg:w-2/3">
                  <div className="flex gap-2">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <StarIcon key={i} className="h-6 w-6 text-[#05ECF2]" />
                    ))}
                  </div>

                  <p className="text-nunito text-2xl dark:text-white mt-10">{testimonial.text}</p>
                  <p className="text-nunito text-xl dark:text-white mt-10">
                    {testimonial.author} - <span className="text-sm">{testimonial.position}</span>
                  </p>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-10">
                    <button
                      className="bg-[#05ECF2] text-black px-4 py-2 rounded-md hover:bg-[#03c1c7]"
                      onClick={() =>
                        setCurrentBackground((currentBackground - 1 + testimonials.length) % testimonials.length)
                      }
                    >
                      Previous
                    </button>
                    <button
                      className="bg-[#05ECF2] text-black px-4 py-2 rounded-md hover:bg-[#03c1c7]"
                      onClick={() =>
                        setCurrentBackground((currentBackground + 1) % testimonials.length)
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="lg:w-1/3">
                  <img src={testimonial.image} alt="testimonial" className="rounded-lg w-full h-[50vh]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
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


