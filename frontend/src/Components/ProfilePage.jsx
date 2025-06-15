import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ProfilePage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  useEffect(() => {
    document.title = "Profile Page - CyberBid";
  }, []);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    phone: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('You need to be logged in to view your profile');
          setLoading(false);
          navigate('/login');
          return;
        }
        
        setLoading(true);
        const response = await axios.get('http://localhost:3000/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProfileData(response.data);
        setFormData({
          user_name: response.data.user_name,
          phone: response.data.phone || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err.response?.data || err.message);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load profile data. Please try again later.');
        }
        
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You need to be logged in to update your profile');
        return;
      }

      await axios.put('http://localhost:3000/update-profile', formData, { headers: { Authorization: `Bearer ${token}` } });
      
      

      setProfileData({
        ...profileData,
        user_name: formData.user_name,
        phone: formData.phone
      });
      
      setEditMode(false);
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="refresh-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-container">
        <h1 className="page-title">My Profile</h1>
        
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {profileData.user_name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-title">
              <h2>{profileData.user_name}</h2>
              <span className="role-badge">{profileData.role}</span>
              <p className="member-since">Member since {new Date(profileData.created_at).toLocaleDateString()}</p>
            </div>
            <div className="profile-actions">
              {!editMode ? (
                <button className="edit-button" onClick={handleEditToggle}>
                  Edit Profile
                </button>
              ) : (
                <button className="cancel-button" onClick={handleEditToggle}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {!editMode ? (
            <div className="profile-details">
              <div className="details-section">
                <h3>Account Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{profileData.user_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profileData.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{profileData.phone || 'Not provided'}</span>
                </div>
              </div>

              {profileData.role === 'buyer' && (
                <div className="activity-stats">
                  <h3>Bidding Activity</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{profileData.biddingData.total_bids || 0}</div>
                      <div className="stat-label">Total Bids</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{profileData.biddingData.auctions_won || 0}</div>
                      <div className="stat-label">Auctions Won</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${profileData.biddingData.total_spent || 0}</div>
                      <div className="stat-label">Total Spent</div>
                    </div>
                  </div>
                </div>
              )}

              {profileData.role === 'seller' && (
                <div className="activity-stats">
                  <h3>Selling Activity</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{profileData.sellingData.total_items_listed || 0}</div>
                      <div className="stat-label">Items Listed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{profileData.sellingData.items_sold || 0}</div>
                      <div className="stat-label">Items Sold</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{profileData.sellingData.total_auctions_created || 0}</div>
                      <div className="stat-label">Auctions Created</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">${profileData.sellingData.total_earned || 0}</div>
                      <div className="stat-label">Total Earned</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-edit-form">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="user_name">Username</label>
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;