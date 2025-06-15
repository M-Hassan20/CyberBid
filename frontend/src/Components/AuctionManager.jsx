import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateAuctionForm from "./CreateAuctionForm";
import EndAuctionModal from "./EndAuctionModal";
import { getRemainingTime, handleApiError } from "../utils/AuctionFormValidation";
import "./AuctionManager.css";

const AuctionManager = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showEndAuctionModal, setShowEndAuctionModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isProcessingEnd, setIsProcessingEnd] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [activeTab, refreshTrigger]);

  // Refresh active auctions periodically to update remaining time
  useEffect(() => {
    let interval;
    if (activeTab === "active" && auctions.length > 0) {
      interval = setInterval(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 60000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, auctions.length]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/auctions/create/fetch?status=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAuctions(response.data.auctions || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load auctions");
      setLoading(false);
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/auctions/create/categories"
      );
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleOpenEndAuctionModal = (auction) => {
    setSelectedAuction(auction);
    setShowEndAuctionModal(true);
  };

  const handleCloseEndAuctionModal = () => {
    setShowEndAuctionModal(false);
    setSelectedAuction(null);
  };

  const handleEndAuction = async (auctionId, status = "ended", paymentMethod = "system") => {
    setIsProcessingEnd(true);
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/end/auctions/${auctionId}`,
        {
          end_status: status,
          payment_method: paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Close modal and refresh auctions
      setShowEndAuctionModal(false);
      setSelectedAuction(null);
      
      // Show success notification
      const message = status === "ended" ? "Auction ended successfully" : "Auction cancelled successfully";
      alert(message);
      
      // Refresh auctions
      fetchAuctions();
    } catch (err) {
      const errorMessage = handleApiError(err);
      alert(errorMessage);
      console.error("Failed to end auction:", err);
    } finally {
      setIsProcessingEnd(false);
    }
  };

  const handleCreateAuctionSuccess = () => {
    setShowCreateForm(false);
    setActiveTab("pending_approval"); // Switch to pending tab to show newly created auction
    fetchAuctions();
  };

  const renderAuctions = () => {
    if (loading) return <div className="loading-message">Loading auctions...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (auctions.length === 0) return <div className="no-data-message">No {activeTab} Auctions Found</div>;

    return (
      <div className="auction-cards">
        {auctions.map((auction) => (
          <div className="auction-card" key={auction.auction_id}>
            <div className="auction-image">
              <img
                src={auction.primary_image_url}
                alt={auction.auction_title}
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </div>
            <div className="auction-details">
              <h3>{auction.auction_title}</h3>
              <p className="item-title">{auction.title}</p>
              
              {auction.auction_status === "active" && (
                <div className="auction-status active">Active</div>
              )}
              {auction.auction_status === "upcoming" && (
                <div className="auction-status upcoming">Upcoming</div>
              )}
              {auction.auction_status === "ended" && (
                <div className="auction-status ended">Ended</div>
              )}
              {auction.auction_status === "cancelled" && (
                <div className="auction-status cancelled">Cancelled</div>
              )}
              {auction.auction_status === "pending_approval" && (
                <div className="auction-status pending">Pending Approval</div>
              )}
              {auction.auction_status === "draft" && (
                <div className="auction-status draft">Draft</div>
              )}
              
              <div className="auction-stats">
                <div>
                  <span className="stat-label">Current Bid:</span>
                  <span className="stat-value">
                    ${auction.current_bid || auction.starting_price}
                  </span>
                </div>
                <div>
                  <span className="stat-label">Bids:</span>
                  <span className="stat-value">{auction.bid_count || 0}</span>
                </div>
                {auction.auction_status === "active" && (
                  <div>
                    <span className="stat-label">Time Left:</span>
                    <span className="stat-value">
                      {getRemainingTime(auction.end_datetime)}
                    </span>
                  </div>
                )}
                {auction.auction_status === "upcoming" && (
                  <div>
                    <span className="stat-label">Starts:</span>
                    <span className="stat-value">
                      {new Date(auction.start_datetime).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="auction-actions">
                <a
                  href={`/auctions/${auction.auction_id}`}
                  className="view-auction-btn"
                >
                  View Details
                </a>
                
                {auction.auction_status === "active" && (
                  <button
                    onClick={() => handleOpenEndAuctionModal(auction)}
                    className="end-auction-btn"
                  >
                    End Auction
                  </button>
                )}
                
                {auction.auction_status === "upcoming" && (
                  <button
                    onClick={() => handleOpenEndAuctionModal(auction)}
                    className="cancel-auction-btn"
                  >
                    Cancel
                  </button>
                )}
                
                {auction.auction_status === "draft" && (
                  <a
                    href={`/auctions/edit/${auction.auction_id}`}
                    className="edit-auction-btn"
                  >
                    Edit Draft
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="auction-manager">
      <div className="auction-manager-header">
        <h2>Auction Manager</h2>
        <button 
          className="create-auction-btn"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Auction
        </button>
      </div>

      {showCreateForm ? (
        <CreateAuctionForm 
          categories={categories}
          onCancel={() => setShowCreateForm(false)}
          onSuccess={handleCreateAuctionSuccess}
        />
      ) : (
        <>
          <div className="auction-tabs">
            <button
              className={activeTab === "active" ? "active" : ""}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
            <button
              className={activeTab === "upcoming" ? "active" : ""}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={activeTab === "ended" ? "active" : ""}
              onClick={() => setActiveTab("ended")}
            >
              Ended
            </button>
            <button
              className={activeTab === "draft" ? "active" : ""}
              onClick={() => setActiveTab("draft")}
            >
              Drafts
            </button>
            <button
              className={activeTab === "pending_approval" ? "active" : ""}
              onClick={() => setActiveTab("pending_approval")}
            >
              Pending Approval
            </button>
          </div>

          <div className="auctions-container">
            {renderAuctions()}
          </div>
        </>
      )}
      
      {showEndAuctionModal && selectedAuction && (
        <EndAuctionModal
          auction={selectedAuction}
          onClose={handleCloseEndAuctionModal}
          onConfirm={handleEndAuction}
          isProcessing={isProcessingEnd}
        />
      )}
    </div>
  );
};

export default AuctionManager;