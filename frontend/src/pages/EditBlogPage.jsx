import Navbar from "../components/navbar";
import Footer from "../components/footer";
import EditPostForm from "../components/editpostform";
import logoImage from "../assets/post2.mp4";
import { useParams } from "react-router-dom";
export default function EditBlogPage() {
  const { id } = useParams();
  return (
    <div id="edit-blog" className="min-h-screen bg-purple-200 flex flex-col">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-4 py-8 lg:py-8 gap-4 lg:gap-8">
        {/* Left Section - Content and Video */}
        <div className="flex flex-col items-center text-center w-full max-w-2xl lg:w-2/5">
          {/* Text Section - More compact */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-3 drop-shadow-[0_4px_3px_rgba(0,0,0,0.50)]">
              Edit Your Story
            </h1>
            <p className="text-base md:text-lg text-purple-800 font-medium italic">
              "Refine Your Journey, Inspire Others"
            </p>
          </div>
            
          {/* Video Animation - Made more compact */}
          <div className="flex-1 w-full">
            <div className="rounded-xl overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto max-h-106"
              >
                <source src={logoImage} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-8"></div>
        
        {/* Edit Post Form */}
        <div className="w-full max-w-2xl lg:max-w-xl">
          <EditPostForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}