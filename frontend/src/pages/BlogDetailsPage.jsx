import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { 
  CalendarIcon,
  ClockIcon,
  Share2Icon
} from "lucide-react";

function BlogDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  const BACKEND_URL = 'http://localhost:8000';

  // Fetch blog details
  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${BACKEND_URL}/api/blog_detail/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }

      const data = await response.json();
      setBlog(data);

      // Fetch related blogs
      await fetchRelatedBlogs(data);

    } catch (error) {
      console.error("Error fetching blog details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related blogs
  const fetchRelatedBlogs = async (currentBlog) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/search_blog/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allBlogs = await response.json();
        const related = allBlogs
          .filter(b => b.id !== currentBlog.id && b.blog_author_name === currentBlog.blog_author_name)
          .slice(0, 3);
        setRelatedBlogs(related);
      }
    } catch (error) {
      console.error("Error fetching related blogs:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const calculateReadTime = (content) => {
    if (!content) return "1 min read";
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const getBlogImage = (blog) => {
    const image = blog?.blog_image;
    if (!image) return null;
    
    if (typeof image === 'string') {
      if (image.startsWith('/')) {
        return `${BACKEND_URL}${image}`;
      } else if (image.startsWith('http')) {
        return image;
      } else {
        return `${BACKEND_URL}/media/${image}`;
      }
    }
    return null;
  };

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.blog_title,
          text: blog?.blog_content?.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-200">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-64 bg-gray-300 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const blogImage = getBlogImage(blog);
  
  return (
    <div id="blog"className="min-h-screen bg-purple-200">
      <Navbar />

      {/* Blog Content */}
      <main className="container mx-auto px-6 py-8">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image on Left - Hidden on mobile, shown on desktop */}
            {blogImage && (
              <div className="lg:w-2/5 lg:order-1 hidden lg:block">
                <div className="w-full h-full min-h-96 overflow-hidden group">
                  <img
                    src={blogImage}
                    alt={blog.blog_title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            )}

            {/* Blog Content on Right */}
            <div className="lg:w-3/5 lg:order-2">
              {/* Featured Image - Show on mobile only */}
              {blogImage && (
                <div className="lg:hidden w-full h-64 overflow-hidden group">
                  <img
                    src={blogImage}
                    alt={blog.blog_title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-800 mb-4 leading-tight">
                    {blog.blog_title}
                  </h1>
                  
                  {/* Author and Meta Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {blog.blog_author_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-purple-800 text-lg">
                          {blog.blog_author_name || "Unknown Author"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-purple-600 mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(blog.blog_created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{calculateReadTime(blog.blog_content)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Share Button Only */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 text-purple-800 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                        title="Share this blog"
                      >
                        <Share2Icon className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed text-lg">
                    {blog.blog_content?.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-6">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Last Updated */}
                {blog.blog_updated_at && blog.blog_updated_at !== blog.blog_created_at && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Last updated: {formatDate(blog.blog_updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">
              More from {blog.blog_author_name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => {
                const relatedImage = getBlogImage(relatedBlog);
                return (
                  <Link
                    key={relatedBlog.id}
                    to={`/blog/${relatedBlog.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 block group"
                  >
                    {relatedImage && (
                      <div className="overflow-hidden h-48">
                        <img
                          src={relatedImage}
                          alt={relatedBlog.blog_title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-purple-800 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {relatedBlog.blog_title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {relatedBlog.blog_content?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center text-sm text-purple-600 gap-2">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(relatedBlog.blog_created_at)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BlogDetailsPage;