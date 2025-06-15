import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * ItemImage component to handle fetching and displaying images for auction items
 * @param {Object} props
 * @param {number} props.itemId - The ID of the item
 * @param {boolean} props.featuredOnly - Whether to show only the featured image
 * @param {string} props.className - Optional CSS class name
 * @param {Object} props.style - Optional inline styles
 * @param {string} props.fallbackImage - URL to fallback image if no images found
 */
const ItemImage = ({ 
  itemId, 
  featuredOnly = true, 
  className = '', 
  style = {}, 
  fallbackImage = '/images/placeholder.jpg' 
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/items/${itemId}/images`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Sort by display_order and is_featured
          const sortedImages = [...response.data].sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return a.display_order - b.display_order;
          });
          
          setImages(sortedImages);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error('Error fetching item images:', err);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchImages();
    }
  }, [itemId]);

  // Function to get primary image URL
  const getPrimaryImageUrl = () => {
    if (images.length === 0) return fallbackImage;
    
    // First try to find a featured image
    const featuredImage = images.find(img => img.is_featured);
    if (featuredImage) return featuredImage.url;
    
    // Otherwise return the first image
    return images[0].url;
  };

  if (loading) return <div className={`image-placeholder ${className}`} style={style}>Loading...</div>;
  
  if (error) return <div className={`image-error ${className}`} style={style}>Image not available</div>;

  if (featuredOnly) {
    return (
      <img 
        src={getPrimaryImageUrl()} 
        alt="Item" 
        className={className}
        style={style}
        onError={(e) => { e.target.src = fallbackImage; }}
      />
    );
  }

  // Return all images if featuredOnly is false
  return (
    <div className={`item-images-container ${className}`} style={style}>
      {images.length > 0 ? (
        images.map((image, index) => (
          <img 
            key={image.image_id || index}
            src={image.url} 
            alt={`Item image ${index + 1}`}
            className={`item-image ${image.is_featured ? 'featured' : ''}`}
            onError={(e) => { e.target.src = fallbackImage; }}
          />
        ))
      ) : (
        <img 
          src={fallbackImage} 
          alt="No image available" 
          className="fallback-image"
        />
      )}
    </div>
  );
};

export default ItemImage;