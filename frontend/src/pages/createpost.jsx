import Navbar from "../components/navbar";
import Footer from "../components/footer";
import CreatePostForm from "../components/createpostform";


export default function CreatePost() {
  return (
    <div di="create-post" className="min-h-screen bg-purple-200 flex flex-col">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-4 py-8 lg:py-12 gap-8 lg:gap-16">
        {/* Left Section - Content and Video */}
        <div className="flex flex-col items-center text-center w-full max-w-2xl lg:w-2/5">
          {/* Text Section - Moved further up with less spacing */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4 drop-shadow-[0_4px_3px_rgba(0,0,0,0.50)]">
              Let's Heal
            </h1>
            <p className="text-lg md:text-xl text-purple-800 font-medium italic">
              "Your Journey to Healing Starts Here"
            </p>
          </div>
            
          {/* Video Animation - Made smaller */}
         <div className="flex-1">
            <div className="video-container rounded-xl overflow-hiddenS">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="video-animation w-full h-auto"
              >
                <source src="src/assets/post.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        
        </div>

        <div className="hidden lg:block lg:w-16"></div>
        
        {/* Create Post Form */}
        <div className="w-full max-w-md lg:max-w-lg">
          <CreatePostForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}