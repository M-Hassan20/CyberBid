import React, { useState, useEffect } from "react";
import axios from "axios";
import AuctionManager from "./AuctionManager";
import ProfilePage from "./ProfilePage";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  useEffect(() => {
    document.title = "Seller Dashboard - CyberBid";
  });
  const [summary, setSummary] = useState(null);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [draftAuctions, setDraftAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/seller/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSummary(response.data.data.summary);
      setActiveAuctions(response.data.data.activeAuctions);
      setRecentBids(response.data.data.recentBids);
      setPendingAuctions(response.data.data.pendingAuctions);
      setDraftAuctions(response.data.data.draftAuctions);
      setUpcomingAuctions(response.data.data.upcomingAuctions);
      setEndedAuctions(response.data.data.endedAuctions);

      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data");
      setLoading(false);
      console.error(err);
    }
  };

  const renderDashboardContent = () => {
    if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
      <>
        {/* Summary Section */}
        {summary && (
          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>Total Items Listed</h3>
              <div className="summary-number">{summary.total_items_listed}</div>
            </div>
            <div className="summary-card">
              <h3>Items Sold</h3>
              <div className="summary-number">{summary.items_sold}</div>
            </div>
            <div className="summary-card">
              <h3>Active Auctions</h3>
              <div className="summary-number">{summary.active_auctions}</div>
            </div>
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <div className="summary-number">
                ${(Number(summary?.total_revenue) || 0).toFixed(2)}
              </div>
            </div>
            <div className="summary-card">
              <h3>Average Winning Bid</h3>
              <div className="summary-number">
                ${(Number(summary?.avg_winning_bid) || 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Active Auctions Section */}
        <section className="dashboard-section">
          <h2>Active Auctions</h2>
          {activeAuctions.length > 0 ? (
            <div className="auction-cards">
              {activeAuctions.map((auction) => (
                <div className="auction-card" key={auction.auction_id}>
                  <div className="auction-image">
                    <img
                      src={ auction.primary_image_url }
                      alt={auction.item_title}
                    />
                  </div>
                  <div className="auction-details">
                    <h3>{auction.auction_title}</h3>
                    <p className="item-title">{auction.item_title}</p>
                    <div className="auction-stats">
                      <div>
                        <span className="stat-label">Current Price:</span>
                        <span className="stat-value">
                          ${auction.current_price}
                        </span>
                      </div>
                      <div>
                        <span className="stat-label">Bids:</span>
                        <span className="stat-value">{auction.bid_count}</span>
                      </div>
                      <div>
                        <span className="stat-label">Time Left:</span>
                        <span className="stat-value">
                          {auction.hours_remaining > 0
                            ? `${auction.hours_remaining} hours`
                            : "Ending soon"}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/auctions/${auction.auction_id}`}
                      className="view-auction-btn"
                    >
                      View Auction
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">You have no active auctions</p>
          )}
        </section>

        {/* Recent Bids Section */}
        <section className="dashboard-section">
          <h2>Recent Bids</h2>
          {recentBids.length > 0 ? (
            <div className="table-container">
              <table className="bids-table">
                <thead>
                  <tr>
                    <th>Auction</th>
                    <th>Bidder</th>
                    <th>Amount</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBids.map((bid) => (
                    <tr key={bid.bid_id}>
                      <td>
                        <a href={`/auctions/${bid.auction_id}`}>
                          {bid.auction_title}
                        </a>
                      </td>
                      <td>{bid.bidder_name}</td>
                      <td>${bid.bid_amount}</td>
                      <td>{new Date(bid.bid_time).toLocaleString()}</td>
                      <td>
                        <span className={`bid-status ${bid.bid_status}`}>
                          {bid.bid_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">No bids received yet</p>
          )}
        </section>

        {/* Pending Approval Auctions */}
        <section className="dashboard-section">
          <h2>Pending Approval</h2>
          {pendingAuctions.length > 0 ? (
            <div className="auction-cards pending-auctions">
              {pendingAuctions.map((auction) => (
                <div className="auction-card" key={auction.auction_id}>
                  <div className="auction-image">
                    <img
                      src={ auction.primary_image_url }
                      alt={auction.item_title}
                    />
                  </div>
                  <div className="auction-details">
                    <h3>{auction.auction_title}</h3>
                    <p className="item-title">{auction.item_title}</p>
                    <div className="auction-status pending">
                      Pending Admin Approval
                    </div>
                    <div className="auction-stats">
                      <div>
                        <span className="stat-label">Starting Price:</span>
                        <span className="stat-value">
                          ${auction.starting_price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">No auctions pending approval</p>
          )}
        </section>

        {/* Draft Auctions */}
        <section className="dashboard-section">
          <h2>Draft Auctions</h2>
          {draftAuctions.length > 0 ? (
            <div className="auction-cards draft-auctions">
              {draftAuctions.map((auction) => (
                <div className="auction-card" key={auction.auction_id}>
                  <div className="auction-image">
                    <img
                      src={auction.primary_image_url }
                      alt={auction.item_title}
                    />
                  </div>
                  <div className="auction-details">
                    <h3>{auction.auction_title}</h3>
                    <p className="item-title">{auction.item_title}</p>
                    <div className="auction-stats">
                      <div>
                        <span className="stat-label">Starting Price:</span>
                        <span className="stat-value">
                          ${auction.starting_price}
                        </span>
                      </div>
                    </div>
                    <div className="auction-actions">
                      <a
                        href={`/auctions/edit/${auction.auction_id}`}
                        className="edit-auction-btn"
                      >
                        Edit
                      </a>
                      <button
                        className="submit-auction-btn"
                        onClick={() => submitAuction(auction.auction_id)}
                      >
                        Submit for Approval
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">No draft auctions</p>
          )}
        </section>

        {/* Ended Auctions Section */}
        <section className="dashboard-section">
          <h2>Completed Auctions</h2>
          {endedAuctions.length > 0 ? (
            <div className="auction-cards ended-auctions">
              {endedAuctions.map((auction) => (
                <div className="auction-card" key={auction.auction_id}>
                  <div className="auction-image">
                    <img
                      src={auction.primary_image_url }
                      alt={auction.item_title}
                    />
                  </div>
                  <div className="auction-details">
                    <h3>{auction.auction_title}</h3>
                    <p className="item-title">{auction.item_title}</p>
                    <div
                      className={`sale-status ${
                        auction.sale_status === "Sold" ? "sold" : "not-sold"
                      }`}
                    >
                      {auction.sale_status}
                    </div>
                    <div className="auction-stats">
                      <div>
                        <span className="stat-label">Final Price:</span>
                        <span className="stat-value">
                          ${auction.current_price}
                        </span>
                      </div>
                      <div>
                        <span className="stat-label">Total Bids:</span>
                        <span className="stat-value">{auction.bid_count}</span>
                      </div>
                      <div>
                        <span className="stat-label">Ended:</span>
                        <span className="stat-value">
                          {new Date(auction.end_datetime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">No completed auctions</p>
          )}
        </section>
      </>
    );
  };

  function submitAuction(auctionId) {
    const token = localStorage.getItem("token");
    axios
      .post(
        `/seller/auctions/${auctionId}/submit-for-approval`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        if (response.data.status === "success") {
          window.location.reload();
        } else {
          alert(response.data.message || "Failed to submit auction");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred while submitting the auction");
      });
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <div className="main-tabs">
          <button 
            className={activeTab === "dashboard" ? "active" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            Overview
          </button>
          <button 
            className={activeTab === "auction-manager" ? "active" : ""} 
            onClick={() => setActiveTab("auction-manager")}
          >
            Auction Manager
          </button>
          <button 
            className={activeTab === "profile" ? "active" : ""} 
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === "dashboard" && renderDashboardContent()}
        {activeTab === "auction-manager" && <AuctionManager />}
        {activeTab === "profile" && <ProfilePage />}
      </div>
    </div>
  );
};

export default SellerDashboard;