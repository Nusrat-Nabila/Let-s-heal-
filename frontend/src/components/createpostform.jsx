import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePostForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    blog_title: "",
    blog_content: "",
    blog_author_name: "",
    is_anonymous: false,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const BACKEND_URL = 'http://localhost:8000';

  useEffect(() => {
    // Get user data from localStorage or context
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const userDisplayName = user.name || user.username || user.email;
        
        setCurrentUser({
          id: user.id,
          name: userDisplayName,
          email: user.email,
          author_name: userDisplayName
        });
        
        // Pre-fill author name for non-anonymous posts
        setFormData(prev => ({
          ...prev,
          blog_author_name: userDisplayName
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleAuthorTypeChange = (e) => {
    const isAnonymous = e.target.value === "anonymous";
    
    setFormData({
      ...formData,
      is_anonymous: isAnonymous,
      blog_author_name: isAnonymous ? "Anonymous" : (currentUser?.author_name || "User")
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        setErrors({
          ...errors,
          blog_image: "Please select an image file (PNG, JPG, JPEG, GIF)"
        });
        return;
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          blog_image: "Image size should be less than 5MB"
        });
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      // Clear image error
      if (errors.blog_image) {
        setErrors({
          ...errors,
          blog_image: ""
        });
      }
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview("");
    if (errors.blog_image) {
      setErrors({
        ...errors,
        blog_image: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.blog_title.trim()) {
      newErrors.blog_title = "Title is required";
    } else if (formData.blog_title.length < 5) {
      newErrors.blog_title = "Title should be at least 5 characters";
    }
    
    if (!formData.blog_content.trim()) {
      newErrors.blog_content = "Post content is required";
    } else if (formData.blog_content.length < 50) {
      newErrors.blog_content = "Post content should be at least 50 characters";
    }
    
    // Only validate author name if not anonymous
    if (!formData.is_anonymous && !formData.blog_author_name.trim()) {
      newErrors.blog_author_name = "Author name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please login to create a post");
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Create FormData to handle file upload
        const submitData = new FormData();
        
        // Add all form fields
        submitData.append('blog_title', formData.blog_title);
        submitData.append('blog_content', formData.blog_content);
        submitData.append('blog_author_name', formData.blog_author_name);
        submitData.append('is_anonymous', formData.is_anonymous.toString());
        
        // Add image file if exists
        if (file) {
          submitData.append('blog_image', file);
        }

        const response = await fetch(`${BACKEND_URL}/api/create_blog/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: submitData
        });

        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Post created successfully:", result);
        
        alert("Post published successfully!");
        
        // Reset form
        setFormData({
          blog_title: "",
          blog_content: "",
          blog_author_name: currentUser?.author_name || "User",
          is_anonymous: false,
        });
        setFile(null);
        setPreview("");
        
        // Redirect to blog page
        navigate('/blog-posts');
        
      } catch (error) {
        console.error("Post creation error:", error);
        setErrors({ submit: error.message || "Failed to create post. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!currentUser) {
    return (
      <div id="create-post-loading" className="bg-purple-50 shadow-lg rounded-xl p-5 border border-purple-200 w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-800">Loading user data...</p>
      </div>
    );
  }

  return (
    <div id="create-post-form-container" className="bg-white shadow-lg rounded-xl p-5 border border-purple-200 w-full max-w-lg mx-auto">
      <h2 id="create-post-title" className="text-xl font-bold text-purple-800 text-center mb-3 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Create New Post</h2>
      
      <form id="create-post-form" className="space-y-3" onSubmit={handleSubmit}>
        {/* Title */}
        <div id="title-field-container">
          <label htmlFor="blog_title" className="block text-sm font-medium text-purple-800 mb-1">
            Post Title *
          </label>
          <input
            type="text"
            id="blog_title"
            name="blog_title"
            data-testid="blog-title-input"
            placeholder="Enter a meaningful title for your post"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
              errors.blog_title ? "border-red-500" : "border-purple-300"
            }`}
            value={formData.blog_title}
            onChange={handleInputChange}
          />
          {errors.blog_title && <p id="title-error" className="text-red-500 text-xs mt-1">{errors.blog_title}</p>}
        </div>

        {/* Author Selection */}
        <div id="author-selection-container">
          <label className="block text-sm font-medium text-purple-800 mb-1">
            Post As *
          </label>
          <div id="author-type-options" className="flex gap-4 mb-3">
            <label id="with-identity-option" className="flex items-center">
              <input
                type="radio"
                id="author-type-identity"
                name="author_type"
                value="with-identity"
                data-testid="author-type-identity"
                checked={!formData.is_anonymous}
                onChange={handleAuthorTypeChange}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-purple-800">With Your Name</span>
            </label>
            <label id="anonymous-option" className="flex items-center">
              <input
                type="radio"
                id="author-type-anonymous"
                name="author_type"
                value="anonymous"
                data-testid="author-type-anonymous"
                checked={formData.is_anonymous}
                onChange={handleAuthorTypeChange}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-purple-800">Anonymously</span>
            </label>
          </div>

          {/* Author Name Input - Only show when not anonymous */}
          {!formData.is_anonymous ? (
            <div id="author-name-field-container">
              <label htmlFor="blog_author_name" className="block text-sm font-medium text-purple-800 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="blog_author_name"
                name="blog_author_name"
                data-testid="author-name-input"
                placeholder="Enter your name as you want it to appear"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                  errors.blog_author_name ? "border-red-500" : "border-purple-300"
                }`}
                value={formData.blog_author_name}
                onChange={handleInputChange}
              />
              {errors.blog_author_name && <p id="author-name-error" className="text-red-500 text-xs mt-1">{errors.blog_author_name}</p>}
            </div>
          ) : (
            <div id="anonymous-display" className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Posting as:</strong> Anonymous
              </p>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div id="image-upload-container">
          <label htmlFor="blog_image" className="block text-sm font-medium text-purple-800 mb-1">
            Featured Image (Optional)
          </label>
          
          {!preview ? (
            <div id="image-upload-area" className="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center hover:border-purple-400 transition-colors cursor-pointer bg-purple-50">
              <input
                type="file"
                id="blog_image"
                name="blog_image"
                data-testid="image-upload-input"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="blog_image" className="cursor-pointer">
                <div className="space-y-1">
                  <svg className="w-8 h-8 text-purple-800 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium text-purple-800">Click to upload image</p>
                  <p className="text-xs text-purple-800">PNG, JPG, JPEG, GIF up to 5MB</p>
                </div>
              </label>
            </div>
          ) : (
            <div id="image-preview-container" className="border border-purple-200 rounded-lg p-2 bg-purple-50">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-purple-800">Image Preview:</p>
                <button
                  type="button"
                  id="remove-image-button"
                  data-testid="remove-image-btn"
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  Remove
                </button>
              </div>
              <img 
                src={preview} 
                alt="Preview" 
                id="image-preview"
                className="w-full h-40 object-cover rounded-lg border border-purple-300"
              />
              {file && (
                <p id="file-info" className="text-xs text-purple-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}
          {errors.blog_image && <p id="image-error" className="text-red-500 text-xs mt-1">{errors.blog_image}</p>}
        </div>

        {/* Body Content */}
        <div id="content-field-container">
          <label htmlFor="blog_content" className="block text-sm font-medium text-purple-800 mb-1">
            Your Story *
          </label>
          <textarea
            id="blog_content"
            name="blog_content"
            data-testid="blog-content-textarea"
            placeholder="Share your experiences, thoughts, and healing journey... (Minimum 50 characters)"
            rows="5"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors resize-vertical ${
              errors.blog_content ? "border-red-500" : "border-purple-300"
            }`}
            value={formData.blog_content}
            onChange={handleInputChange}
          />
          {errors.blog_content && <p id="content-error" className="text-red-500 text-xs mt-1">{errors.blog_content}</p>}
          <div id="character-count" className="flex justify-between text-xs text-purple-800 mt-1">
            <span id="min-character-count" className={formData.blog_content.length < 50 ? "text-red-500" : "text-green-600"}>
              {formData.blog_content.length}/50 characters minimum
            </span>
            <span id="max-character-count" className={formData.blog_content.length > 2000 ? "text-red-500" : ""}>
              {formData.blog_content.length}/2000 max
            </span>
          </div>
        </div>

        {/* Preview of how post will appear */}
        {(formData.blog_title || formData.blog_content) && (
          <div id="post-preview" className="border border-purple-200 rounded-lg p-2 bg-purple-50">
            <p className="text-sm font-medium text-purple-800 mb-1">Preview:</p>
            <div className="text-xs text-purple-700 space-y-0.5">
              <p id="preview-author"><strong>Author:</strong> {formData.blog_author_name}</p>
              {formData.blog_title && <p id="preview-title"><strong>Title:</strong> {formData.blog_title}</p>}
              {formData.blog_content && (
                <p id="preview-content"><strong>Content:</strong> {formData.blog_content.substring(0, 100)}...</p>
              )}
            </div>
          </div>
        )}

        {errors.submit && (
          <div id="submit-error" className="rounded-md bg-red-50 p-1.5 border border-red-200">
            <p className="text-xs text-red-800">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          id="submit-post-button"
          data-testid="submit-post-btn"
          disabled={isSubmitting}
          className={`w-full bg-purple-800 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors font-medium text-sm ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </span>
          ) : (
            "Publish Post"
          )}
        </button>
      </form>
    </div>
  );
}