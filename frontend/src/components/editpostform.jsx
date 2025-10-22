// src/components/EditPostForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  SaveIcon,
  UploadIcon,
  ImageIcon
} from "lucide-react";

function EditPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    blog_title: "",
    blog_content: "",
    blog_category: "",
    blog_image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const BACKEND_URL = 'http://localhost:8000';

  // Fetch blog details for editing
  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login to edit blog');
        navigate('/login');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/blog_detail/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog: ${response.status}`);
      }

      const data = await response.json();
      setBlog(data);
      
      // Set form data with existing blog data
      setFormData({
        blog_title: data.blog_title || "",
        blog_content: data.blog_content || "",
        blog_category: data.blog_category || "",
        blog_image: null
      });

      // Set image preview
      const blogImage = getBlogImage(data);
      if (blogImage) {
        setImagePreview(blogImage);
      }

    } catch (error) {
      console.error("Error fetching blog details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        blog_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login to update blog');
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('blog_title', formData.blog_title);
      submitData.append('blog_content', formData.blog_content);
      
      if (formData.blog_category) {
        submitData.append('blog_category', formData.blog_category);
      }
      
      if (formData.blog_image) {
        submitData.append('blog_image', formData.blog_image);
      }

      const response = await fetch(`${BACKEND_URL}/api/update_blog/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        alert('Blog updated successfully!');
        navigate(`/blog/${id}`);
      } else if (response.status === 404) {
        alert('Blog not found or you are not authorized to edit it');
      } else {
        const errorData = await response.json();
        alert(`Failed to update blog: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-8xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-4 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Edit Your Blog</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-base font-semibold text-purple-800 mb-2">
            Blog Title *
          </label>
          <input
            type="text"
            name="blog_title"
            value={formData.blog_title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            placeholder="Enter your blog title..."
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-base font-semibold text-purple-800 mb-2">
            Blog Content *
          </label>
          <textarea
            name="blog_content"
            value={formData.blog_content}
            onChange={handleInputChange}
            rows="6"
            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical text-sm"
            placeholder="Write your blog content here..."
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-base font-semibold text-purple-800 mb-2">
            Blog Image
          </label>
          
          {/* Current Image with Upload Button on Right */}
          {imagePreview ? (
            <div className="flex items-start gap-6">
              {/* Current Image Preview */}
              <div className="flex-1">
                <p className="text-xs text-purple-700 mb-2">Current Image:</p>
                <div className="max-w-xs">
                  <img
                    src={imagePreview}
                    alt="Current blog"
                    className="w-full h-32 object-cover rounded-lg border border-purple-300"
                  />
                </div>
              </div>
              
              {/* Upload Button on Right */}
              <div className="flex-1">
                <p className="text-xs text-purple-800 mb-2">Replace Image:</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer bg-purple-100 transition-colors text-sm">
                    <UploadIcon className="h-4 w-4" />
                    <span className="font-medium  text-purple-800">Choose New Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  {formData.blog_image && (
                    <div className="flex items-center gap-2 text-purple-600 text-xs">
                      <ImageIcon className="h-3 w-3" />
                      <span className="font-medium">New image selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* If no current image, show upload button normally */
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-400 transition-colors text-sm">
                <UploadIcon className="h-4 w-4" />
                <span className="font-medium">Choose New Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              
              {formData.blog_image && (
                <div className="flex items-center gap-2 text-purple-600 text-xs">
                  <ImageIcon className="h-3 w-3" />
                  <span className="font-medium">New image selected</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-purple-200">
          <button
            type="button"
            onClick={() => navigate(`/blog/${id}`)}
            className="px-6 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Updating...' : 'Update Blog'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPostForm;