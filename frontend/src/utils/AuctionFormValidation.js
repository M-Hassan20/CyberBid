// Validation utility functions for auction forms

export const validateItemDetails = (formData) => {
    const errors = {};
    
    if (!formData.item_title.trim()) {
      errors.item_title = "Item title is required";
    } else if (formData.item_title.length > 50) {
      errors.item_title = "Item title must be 50 characters or less";
    }
    
    if (!formData.category_name) {
      errors.category_name = "Category is required";
    }
    
    if (formData.image_urls.length === 0) {
      errors.image_urls = "At least one image URL is required";
    }
    
    return errors;
  };
  
  export const validateAuctionDetails = (formData) => {
    const errors = {};
    
    if (!formData.auction_title.trim()) {
      errors.auction_title = "Auction title is required";
    } else if (formData.auction_title.length > 100) {
      errors.auction_title = "Auction title must be 100 characters or less";
    }
    
    if (!formData.starting_price || isNaN(formData.starting_price)) {
      errors.starting_price = "Starting price is required and must be a number";
    } else if (parseFloat(formData.starting_price) <= 0) {
      errors.starting_price = "Starting price must be greater than zero";
    }
    
    if (!formData.auction_duration || isNaN(formData.auction_duration)) {
      errors.auction_duration = "Duration is required and must be a number";
    } else if (parseInt(formData.auction_duration) <= 0) {
      errors.auction_duration = "Duration must be greater than zero";
    } else if (parseInt(formData.auction_duration) > 168) {
      errors.auction_duration = "Duration cannot exceed 168 hours (7 days)";
    }
  
    // Validate start_datetime if provided
    if (formData.start_datetime) {
      const startDate = new Date(formData.start_datetime);
      const now = new Date();
      
      if (startDate <= now) {
        errors.start_datetime = "Start time must be in the future";
      }
    }
    
    return errors;
  };
  
  // Helper function to format currency
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Helper function to calculate and format remaining time
  export const getRemainingTime = (endDatetime) => {
    const end = new Date(endDatetime);
    const now = new Date();
    const diff = end - now;
  
    if (diff <= 0) return "Ending soon";
  
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? "s" : ""} left`;
    }
  
    return `${hours}h ${minutes}m left`;
  };
  
  // Function to handle form submission errors
  export const handleApiError = (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return error.response.data.message || "An error occurred while processing your request";
    } else if (error.request) {
      // The request was made but no response was received
      return "No response from server. Please check your internet connection";
    } else {
      // Something happened in setting up the request that triggered an Error
      return "Error creating request. Please try again";
    }
  };
  