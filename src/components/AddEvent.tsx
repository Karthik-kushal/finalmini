import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Tag, 
  Upload, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus
} from 'lucide-react';

interface FormData {
  title: string;
  hostName: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
  image: File | null;
  imageUrl: string;
}

interface FormErrors {
  [key: string]: string;
}

const categories = [
  { value: '', label: 'Select a category' },
  { value: 'Tech', label: 'Technology' },
  { value: 'Cultural', label: 'Cultural' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Academic', label: 'Academic' },
  { value: 'Social', label: 'Social' },
  { value: 'Others', label: 'Others' }
];

const suggestedTags = [
  'Workshop', 'Seminar', 'Competition', 'Festival', 'Conference', 
  'Networking', 'Career', 'Innovation', 'Research', 'Community',
  'Music', 'Art', 'Dance', 'Food', 'Gaming', 'Startup'
];


function AddEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    hostName: '',
    category: '',
    date: '',
    time: '',
    location: '',
    description: '',
    tags: [],
    image: null,
    imageUrl: '',
  });
  
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.hostName.trim()) {
      newErrors.hostName = 'Host name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!imageUrlInput.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrlInput.trim())) {
      newErrors.imageUrl = 'Enter a valid image URL ending with jpg, jpeg, png, gif, or webp';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    const createdBy = localStorage.getItem('userId') || '';

    // Validate createdBy before proceeding
    if (!createdBy) {
      alert('User not logged in or userId missing. Please log in again.');
      setLoading(false);
      return;
    }

    // Compose ISO datetime from date + time
    const isoDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

    const eventPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      detailedDescription: formData.description.trim(), // or separate field if you want
      date: isoDateTime,
      location: formData.location.trim(),
      imageUrl: formData.imageUrl.trim(),  // Assuming you unify imageUrlInput into formData.imageUrl
      category: formData.category,
      tags: formData.tags,
      createdBy,
    };

    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create event');
    }

    setSuccess(true);

    setTimeout(() => {
      navigate('/admin/my-events');
    }, 2000);
  } catch (error: any) {
    console.error('Failed to create event:', error);
    alert(`Error creating event: ${error.message}`);
  } finally {
    setLoading(false);
  }
};


  const getCategoryColor = (category: string) => {
    const colors = {
      Tech: 'from-blue-500 to-cyan-500',
      Cultural: 'from-purple-500 to-pink-500',
      Sports: 'from-green-500 to-emerald-500',
      Academic: 'from-yellow-500 to-orange-500',
      Social: 'from-pink-500 to-rose-500',
      Others: 'from-gray-500 to-slate-500'
    };
    return colors[category as keyof typeof colors] || 'from-indigo-500 to-purple-500';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Event Created Successfully!</h2>
          <p className="text-gray-600 mb-6">Your event has been published and is now visible to all students.</p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
            <span className="text-indigo-600">Redirecting to events...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Create New Event
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your event with the campus community and bring people together
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Event Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-lg font-semibold text-gray-700">
                    Event Title *
                  </label>
                  <div className="relative">
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-4 border rounded-xl text-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.title 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      placeholder="Enter an engaging event title"
                      maxLength={100}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Host Name & Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="hostName" className="block text-lg font-semibold text-gray-700">
                      Host Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="hostName"
                        name="hostName"
                        type="text"
                        value={formData.hostName}
                        onChange={handleInputChange}
                        className={`block w-full pl-12 pr-4 py-4 border rounded-xl text-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.hostName 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        placeholder="Organization or person name"
                      />
                    </div>
                    {errors.hostName && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.hostName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-lg font-semibold text-gray-700">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-4 border rounded-xl text-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.category 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-lg font-semibold text-gray-700">
                      Event Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`block w-full pl-12 pr-4 py-4 border rounded-xl text-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.date 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="time" className="block text-lg font-semibold text-gray-700">
                      Event Time *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className={`block w-full pl-12 pr-4 py-4 border rounded-xl text-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.time 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.time && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-lg font-semibold text-gray-700">
                    Location *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border rounded-xl text-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.location 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      placeholder="Building name, room number, or address"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-lg font-semibold text-gray-700">
                    Event Description *
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className={`block w-full px-4 py-4 border rounded-xl text-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                        errors.description 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      placeholder="Provide a detailed description of your event. Include what attendees can expect, any requirements, and other important information..."
                      maxLength={2000}
                    />
                    <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                      {formData.description.length}/2000
                    </div>
                  </div>
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="block text-lg font-semibold text-gray-700">
                    Image URL *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={imageUrlInput}
                      onChange={e => {
                        setImageUrlInput(e.target.value);
                        if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: '' }));
                      }}
                      placeholder="Enter image URL (required)"
                      className={`block w-full px-4 py-3 border rounded-xl text-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.imageUrl 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.imageUrl && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.imageUrl}
                    </p>
                  )}
                </div>



                {/* Tags Section */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700">
                    Event Tags
                  </label>
                  
                  {/* Add Custom Tag */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(newTag);
                          }
                        }}
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholder="Add a custom tag"
                        maxLength={20}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addTag(newTag)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Suggested Tags */}
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={formData.tags.includes(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Tags */}
                  {formData.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Selected tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700">
                    Event Image
                  </label>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Event preview"
                          className="max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70 ${
                      formData.category 
                        ? `bg-gradient-to-r ${getCategoryColor(formData.category)} text-white hover:shadow-lg`
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                        Creating Event...
                      </div>
                    ) : (
                      'Create Event'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEvent;
