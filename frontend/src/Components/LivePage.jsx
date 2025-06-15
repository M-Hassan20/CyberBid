import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LivePage.css";
import { isAuthenticated } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import PlaceBid from "./PlaceBid";
import { useTheme } from "../context/ThemeContext";

const LivePage = () => {
  const { darkMode } = useTheme();
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Live Auctions";
  }, []);
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      fetchAuctions(pagination.page);
    }
  }, []);

  const fetchAuctions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/auction-details?page=${page}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      setAuctions(response.data.auctions_details);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchAuctions(newPage);
    }
  };

  const handleBidPlaced = (auctionId, newBid) => {
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.auction_id === parseInt(auctionId)
          ? {
              ...auction,
              current_price: newBid.current_price,
              bid_count: typeof newBid.bid_count !== 'undefined' ? newBid.bid_count : (auction.bid_count || 0) + 1,
              last_bid_amount: newBid.bid && typeof newBid.bid.bid_amount !== 'undefined' ? newBid.bid.bid_amount : auction.current_price
            }
          : auction
      )
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeRemaining = (endDateTime) => {
    const now = new Date();
    const end = new Date(endDateTime);
    const diff = end - now;
    
    if (diff <= 0) return "Auction Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <div className={`page-container ${darkMode ? "dark" : "light"}`}>
      <h1 className="page-title">Live Auctions</h1>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading auctions...</p>
        </div>
      ) : auctions.length > 0 ? (
        <>
          <div className="auctions-grid">
            {auctions.map((auction) => (
              <div
                key={auction.auction_id}
                className={`auction-details-container ${darkMode ? "dark" : "light"}`}
              >
                <div className="auction-left-section">
                  <div className="auction-image">
                    {auction.primary_image_url ? (
                      <img src={auction.url} alt={auction.auction_title} />
                    ) : (
                      <div className="no-image">
                        <span>📷 No Image Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="auction-right-section">
                  <div className="auction-header">
                    <h2 className="auction-title">
                      {auction.auction_title}
                    </h2>
                    <p className="auction-description">
                      {auction.auction_description || "No description available."}
                    </p>
                  </div>

                  <div className="auction-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Category</span>
                      <span className="detail-value">
                        {auction.category_name || "Uncategorized"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Condition</span>
                      <span className="detail-value">
                        {auction.item_condition || "Not specified"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Current Price</span>
                      <span className="detail-value price-highlight">
                        ${auction.current_price}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Bids</span>
                      <span className="detail-value bid-highlight">
                        {auction.bid_count || 0}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Latest Bid</span>
                      <span className="detail-value">
                        ${auction.last_bid_amount || 0}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time Remaining</span>
                      <span className="detail-value time-highlight">
                        {getTimeRemaining(auction.end_datetime)}
                      </span>
                    </div>
                  </div>

                  <div className="auction-footer">
                    <PlaceBid
                      auctionId={auction.auction_id}
                      currentPrice={auction.current_price}
                      onBidPlaced={(newBid) => handleBidPlaced(auction.auction_id, newBid)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="pagination-button"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="pagination-button"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="no-auctions-message">
          <p>🔍 No auctions currently live.</p>
        </div>
      )}
    </div>
  );
};

export default LivePage;