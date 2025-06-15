import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PlaceBid.css";

const PlaceBid = ({ auctionId, currentPrice, onBidPlaced }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Current price updated:', currentPrice);
    setBidAmount((currentPrice + 1).toString());
  }, [currentPrice]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log('Submitting bid:', bidAmount, 'for auction:', auctionId);
      const response = await axios.post(
        `http://localhost:3000/auctions/${auctionId}/bid`,
        { bidAmount: parseInt(bidAmount) },
        {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Bid response:', response.data);

      if (response.data.status === "Success") {
        setSuccess(response.data.message);
        onBidPlaced(response.data);
        setBidAmount((response.data.current_price + 1).toString());
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Bid error:', error);
      setError(
        error.response?.data?.message ||
          "An error occurred while placing your bid. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="place-bid-container">
      <form onSubmit={handleBidSubmit} className="bid-form">
        <div className="bid-input-group">
          <label htmlFor="bidAmount">Your Bid ($):</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
            min={currentPrice + 1}
            step="1"
                  required
            placeholder={`Minimum bid: $${Math.floor(currentPrice) + 1}`}
                />
              </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
              <button 
                type="submit" 
          className="bid-button"
          disabled={loading || !bidAmount || parseInt(bidAmount) <= currentPrice}
              >
          {loading ? "Placing Bid..." : "Place Bid"}
              </button>
            </form>
    </div>
  );
};

export default PlaceBid;