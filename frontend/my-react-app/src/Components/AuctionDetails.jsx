import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AuctionDetails.css";
import { isAuthenticated, getAuthHeader } from "../utils/authUtils"; // adjust the path if needed
import { useNavigate } from "react-router-dom";
import PlaceBid from "./PlaceBid";

const AuctionDetails = () => {
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
    // Redirect if not authenticated
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
          headers: getAuthHeader(),
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="page-container">
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
                className="auction-details-container"
              >
                <div className="auction-image">
                  {auction.primary_image_url ? (
                    <img src={auction.primary_image_url} alt={auction.title} />
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                </div>
                <h2 className="auction-title">
                  {auction.title || auction.auction_title}
                </h2>
                <p className="auction-description">
                  {auction.item_description ||
                    auction.auction_description ||
                    "No description available."}
                </p>
                <div className="auction-details">
                  <div>
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">
                      {auction.category_name || "Uncategorized"}
                    </span>
                  </div>
                  <div>
                    <span className="detail-label">Condition:</span>
                    <span className="detail-value">
                      {auction.item_condition || "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="auction-details">
                  <div>
                    <span className="detail-label">Starting Price:</span>
                    <span className="detail-value">
                      ${auction.starting_price}
                    </span>
                  </div>
                  <div>
                    <span className="detail-label">Bids:</span>
                    <span className="detail-value">
                      {auction.bid_count || 0}
                    </span>
                  </div>
                </div>
                <div className="auction-details">
                  <div>
                    <span className="detail-label">Ends:</span>
                    <span className="detail-value">
                      {formatDate(auction.end_datetime)}
                    </span>
                  </div>
                </div>
                <PlaceBid 
                  auctionId={auction.auction_id}
                  currentPrice={auction.current_price || auction.starting_price}
                  onBidPlaced={(newBid) => handleBidPlaced(auction.auction_id, newBid)}
                />
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="no-auctions-message">
          <p>No auctions currently live.</p>
        </div>
      )}
    </div>
  );
};

export default AuctionDetails;
