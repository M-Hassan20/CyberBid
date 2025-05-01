import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlaceBid.css';

const PlaceBid = ({ auctionId, currentPrice, onBidPlaced }) => {
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [minBid, setMinBid] = useState(0);

  useEffect(() => {
    // Set minimum bid as current price + 1 (or other increment logic)
    setMinBid(parseFloat(currentPrice || 0) + 1);
    setBidAmount((parseFloat(currentPrice || 0) + 1).toString());
  }, [currentPrice]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Make API call to place bid
      const response = await axios.post(`http://localhost:3000/auctions/${auctionId}/bid`, {
        bidAmount: parseFloat(bidAmount)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess('Bid placed successfully!');
      setBidAmount('');
      
      // Call the callback to update parent component
      if (onBidPlaced && typeof onBidPlaced === 'function') {
        onBidPlaced(response.data.bid);
      }
      
      // Optionally close the form after successful bid
      setTimeout(() => {
        setShowBidForm(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.response?.data?.message || 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="place-bid-container">
      {!showBidForm ? (
        <button 
          className="bid-button"
          onClick={() => setShowBidForm(true)}
        >
          Place Bid
        </button>
      ) : (
        <div className="bid-form-overlay">
          <div className="bid-form-container">
            <button className="close-button" onClick={() => setShowBidForm(false)}>×</button>
            <h3>Place Your Bid</h3>
            <p className="current-price">Current Price: ${currentPrice}</p>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleBidSubmit}>
              <div className="form-group">
                <label htmlFor="bidAmount">Your Bid Amount ($)</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={minBid}
                  step="0.01"
                  required
                />
                <small>Minimum bid: ${minBid.toFixed(2)}</small>
              </div>
              
              <button 
                type="submit" 
                className="submit-bid-button"
                disabled={loading || parseFloat(bidAmount) < minBid}
              >
                {loading ? 'Placing Bid...' : 'Submit Bid'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceBid;