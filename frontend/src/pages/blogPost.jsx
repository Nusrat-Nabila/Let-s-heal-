import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { 
  UsersIcon, 
  UserIcon, 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon,
  SearchIcon,
  ChevronRightIcon,
  Edit3Icon,
  Trash2Icon,
  MoreVerticalIcon
} from "lucide-react";

function BlogPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const BACKEND_URL = 'http://localhost:8000';

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      if (filter === "my-posts") {
        // Only for My Posts - check authentication
        if (!isAuthenticated()) {
          alert("Please login to view your posts");
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`${BACKEND_URL}/api/get_my_blog/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_data');
          navigate('/login');
          return;
        }

        if (response.status === 404) {
          setBlogs([]);
          setAllBlogs([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch my blogs: ${response.status}`);
        }

        const data = await response.json();
        const blogsData = Array.isArray(data) ? data : [];
        setAllBlogs(blogsData);
        setBlogs(blogsData);

      } else {
        // For All Posts - no authentication needed
        const response = await fetch(`${BACKEND_URL}/api/search_blog/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch all blogs: ${response.status}`);
        }

        const data = await response.json();
        const blogsData = Array.isArray(data) ? data : [];
        setAllBlogs(blogsData);
        setBlogs(blogsData);
      }

    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(error.message);
      
      if (filter === "my-posts") {
        setBlogs([]);
        setAllBlogs([]);
      } else {
        alert("Failed to load blogs. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter === "my-posts") {
      if (!isAuthenticated()) {
        alert("Please login to view your posts");
        navigate('/login');
        return;
      }
    }
    
    setFilter(newFilter);
    setSearchQuery("");
    setShowActionsMenu(null);
    setShowDeleteModal(null);
  };

  const handleContribute = () => {
    if (!isAuthenticated()) {
      alert("Please login to create a post");
      navigate('/login');
      return;
    }
    navigate("/create-post");
  };

  // Handle edit blog
  const handleEditBlog = (blogId, e) => {
    e.stopPropagation();
    navigate(`/edit-blog/${blogId}`);
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Please login to delete this blog');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/delete_blog/${blogId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Blog deleted successfully!');
        // Remove the deleted blog from state
        setBlogs(blogs.filter(blog => blog.id !== blogId));
        setAllBlogs(allBlogs.filter(blog => blog.id !== blogId));
      } else if (response.status === 403) {
        alert('You are not authorized to delete this blog');
      } else if (response.status === 404) {
        alert('Blog not found');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete blog: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    } finally {
      setShowDeleteModal(null);
      setShowActionsMenu(null);
    }
  };

  // Toggle actions menu
  const toggleActionsMenu = (blogId, e) => {
    e.stopPropagation();
    setShowActionsMenu(showActionsMenu === blogId ? null : blogId);
  };

  // Client-side search filtering
  const filterBlogs = (query) => {
    if (!query.trim()) {
      setBlogs(allBlogs);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = allBlogs.filter(blog => 
        blog.blog_title?.toLowerCase().includes(lowercaseQuery) ||
        blog.blog_content?.toLowerCase().includes(lowercaseQuery) ||
        blog.blog_author_name?.toLowerCase().includes(lowercaseQuery)
      );
      setBlogs(filtered);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterBlogs(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setBlogs(allBlogs);
  };

  // Fetch data when filter changes
  useEffect(() => {
    fetchBlogs();
  }, [filter]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionsMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleReadMore = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

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

  // Handle image URLs from Django
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

  // Safe data access
  const getBlogTitle = (blog) => blog?.blog_title || "Untitled";
  const getBlogContent = (blog) => blog?.blog_content || "";
  const getAuthorName = (blog) => blog?.blog_author_name || "Unknown Author";

  // Get first 120 characters of content
  const getShortContent = (content) => {
    if (!content) return "";
    return content.length > 120 ? content.substring(0, 120) + '...' : content;
  };

  return (
    <div className="min-h-screen bg-purple-200">
      <Navbar />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-purple-800 mb-4">Delete Blog</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this blog? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBlog(showDeleteModal)}
                className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div id="blog-posts" className="bg-purple-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
                Mental Health Insights
              </h1>
              <p className="text-purple-900 text-sm mt-1">
                {filter === "my-posts" 
                  ? `Showing your ${blogs.length} articles` 
                  : `Showing ${blogs.length} of ${allBlogs.length} articles`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            
            <button 
              onClick={handleContribute}
              className="flex items-center gap-2 bg-purple-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <PlusIcon className="h-4 w-4" />
              Create Post
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search articles by title, content, or author..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border text-sm ${
                    filter === "all" 
                      ? "bg-purple-800 text-white border-purple-600" 
                      : "bg-white text-purple-800 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  <UsersIcon className="h-3 w-3" />
                  All Posts
                </button>
                <button
                  onClick={() => handleFilterChange("my-posts")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border text-sm ${
                    filter === "my-posts" 
                      ? "bg-purple-800 text-white border-purple-600" 
                      : "bg-white text-purple-800 border-gray-300 hover:border-purple-400"
                  }`}
                >
                  <UserIcon className="h-3 w-3" />
                  My Posts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <main className="container mx-auto px-6 py-8">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => {
              const blogImage = getBlogImage(blog);
              
              return (
                <article
                  key={blog.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-gray-100 relative"
                  onClick={() => handleReadMore(blog.id)}
                >
                  {/* Action Menu - Only show in My Posts */}
                  {filter === "my-posts" && (
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => toggleActionsMenu(blog.id, e)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      >
                        <MoreVerticalIcon className="h-4 w-4 text-gray-600" />
                      </button>

                      {/* Actions Dropdown Menu */}
{showActionsMenu === blog.id && (
  <div className="absolute right-0 top-10 bg-purple-200 rounded-lg shadow-lg border border-purple-200 py-2 w-32 z-20">
    <button
      onClick={(e) => handleEditBlog(blog.id, e)}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-purple-800 hover:bg-purple-50 transition-colors"
    >
      <Edit3Icon className="h-4 w-4" />
      Edit
    </button>
    
    {/* Thin Divider */}
    <hr className="border-purple-800 mx-2" />
    
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowDeleteModal(blog.id);
      }}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-purple-800 hover:bg-purple-50 transition-colors"
    >
      <Trash2Icon className="h-4 w-4" />
      Delete
    </button>
  </div>
)}
                    </div>
                  )}

                  <div className="relative">
                    {blogImage ? (
                      <img
                        src={blogImage}
                        alt={getBlogTitle(blog)}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-48 bg-purple-100 flex items-center justify-center ${blogImage ? 'hidden' : 'flex'}`}
                    >
                      <span className="text-purple-300 text-sm">No Image</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getAuthorName(blog).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-purple-800 text-sm">
                          {getAuthorName(blog)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-purple-600 text-xs mb-3 gap-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(blog.blog_created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{calculateReadTime(getBlogContent(blog))}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-bold text-purple-800 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors leading-tight">
                      {getBlogTitle(blog)}
                    </h2>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed text-sm h-10 overflow-hidden">
                      {getShortContent(getBlogContent(blog))}
                    </p>
                    
                    <button className="w-full flex items-center justify-center gap-2 text-purple-800 font-semibold hover:text-purple-700 transition-colors duration-200 py-2 rounded-lg border border-purple-300 hover:bg-purple-50 group/btn text-sm">
                      Read Article
                      <ChevronRightIcon className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <SearchIcon className="h-12 w-12 mx-auto mb-3" />
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">
                {searchQuery ? "No matching articles found" : "No articles found"}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {searchQuery 
                  ? `No articles found for "${searchQuery}". Try different keywords.`
                  : filter === "my-posts" 
                    ? "You haven't created any posts yet. Share your insights with the community."
                    : "No blogs available at the moment."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="bg-gray-100 text-purple-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    Clear Search
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                  }}
                  className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors text-sm"
                >
                  Show All Posts
                </button>
                {filter === "my-posts" && (
                  <button 
                    onClick={handleContribute}
                    className="bg-purple-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create Your First Post
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BlogPage;