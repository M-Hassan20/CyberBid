import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  useEffect(() => {
    document.title = "Admin Dashboard - CyberBid";
  }, []);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard summary data
  const [summary, setSummary] = useState(null);
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Auction management data
  const [auctionFilter, setAuctionFilter] = useState({
    status: "",
    dateStart: "",
    dateEnd: "",
    limit: 10,
    offset: 0,
  });
  const [auctionStats, setAuctionStats] = useState({});
  const [auctions, setAuctions] = useState([]);
  const [auctionPagination, setAuctionPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
  });

  // User management data
  const [userFilter, setUserFilter] = useState({
    search: "",
    role: "",
    sortBy: "created_at",
    sortOrder: "DESC",
    limit: 10,
    offset: 0,
  });
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    pages: 0,
  });

  // Category management data
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    parentCategoryId: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardSummary();
    } else if (activeTab === "auctions") {
      fetchAuctions();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "approvals") {
      fetchApprovalRequests();
    }
  }, [activeTab]);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data.data;
      setSummary(data.summary);
      setRecentAuctions(data.recentAuctions);
      setPendingApprovals(data.pendingApprovals);
      setRecentUsers(data.recentUsers);
      setRecentTransactions(data.recentTransactions);
      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data");
      setLoading(false);
      console.error(err);
    }
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { status, dateStart, dateEnd, limit, offset } = auctionFilter;

      const response = await axios.get(
        `http://localhost:3000/admin/auctions?status=${status}&dateStart=${dateStart}&dateEnd=${dateEnd}&limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAuctionStats(response.data.data.stats);
      setAuctions(response.data.data.auctions);
      setAuctionPagination(response.data.data.pagination);
      setLoading(false);
    } catch (err) {
      setError("Failed to load auction data");
      setLoading(false);
      console.error(err);
    }
  };

  const fetchApprovalRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/admin/approval-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPendingApprovals(response.data.data.pendingApprovals);
      setLoading(false);
    } catch (err) {
      setError("Failed to load approval requests");
      setLoading(false);
      console.error(err);
    }
  };

  const renderApprovalRequests = () => {
    if (loading)
      return (
        <div className="dashboard-loading">Loading approval requests...</div>
      );
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
      <>
        <h2>Pending Approval Requests</h2>

        {pendingApprovals.length > 0 ? (
          <div className="approval-requests">
            {pendingApprovals.map((approval) => (
              <div
                className="approval-card"
                key={approval.approval_id || approval.auction_id}
              >
                <div className="approval-image">
                  <img
                    src={approval.primary_image}
                    alt={approval.item_title}
                  />
                </div>
                <div className="approval-details">
                  <h3>{approval.auction_title}</h3>
                  <p className="item-title">Item: {approval.item_title}</p>
                  <p>Seller: {approval.seller_name}</p>
                  <p>Category: {approval.category_name}</p>
                  <p>Starting price: ${approval.starting_price}</p>
                  <p>Description: {approval.item_description}</p>

                  <div className="approval-form">
                    <textarea
                      placeholder="Comments for seller (optional)"
                      id={`comments-${approval.auction_id}`}
                      rows="3"
                    ></textarea>

                    <div className="approval-actions">
                      <button
                        className="action-btn approve"
                        onClick={() => {
                          const comments = document.getElementById(
                            `comments-${approval.auction_id}`
                          ).value;
                          processApproval(
                            approval.auction_id,
                            "approved",
                            comments
                          );
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => {
                          const comments = document.getElementById(
                            `comments-${approval.auction_id}`
                          ).value;
                          processApproval(
                            approval.auction_id,
                            "rejected",
                            comments
                          );
                        }}
                      >
                        Reject
                      </button>
                      <a
                        href={`/auctions/${approval.auction_id}`}
                        className="action-btn view"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data-message">No pending approvals</p>
        )}
      </>
    );
  };

  const processApproval = async (auctionId, approvalStatus, comments) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/admin/process-approval/${auctionId}`,
        { approvalStatus, comments },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchApprovalRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process approval");
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { search, role, sortBy, sortOrder, limit, offset } = userFilter;

      const response = await axios.get(
        `http://localhost:3000/admin/users?search=${search}&role=${role}&sortBy=${sortBy}&sortOrder=${sortOrder}&limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(response.data.data.users);
      setUserPagination(response.data.data.pagination);
      setLoading(false);
    } catch (err) {
      setError("Failed to load user data");
      setLoading(false);
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/admin/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCategories(response.data.data.categories);
      setLoading(false);
    } catch (err) {
      setError("Failed to load categories");
      setLoading(false);
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:3000/admin/categories`, newCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewCategory({ categoryName: "", parentCategoryId: "" });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add category");
      console.error(err);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/admin/categories/${editingCategory.categoryId}`,
        {
          newName: editingCategory.categoryName,
          newParentId: editingCategory.parentCategoryId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update category");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryId, reassignChildren) => {
    try {
      if (!window.confirm("Are you sure you want to delete this category?")) {
        return;
      }

      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/admin/categories/${categoryId}?reassignChildren=${reassignChildren}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category");
      console.error(err);
    }
  };

  const handleAuctionFilterChange = (e) => {
    const { name, value } = e.target;
    setAuctionFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserFilterChange = (e) => {
    const { name, value } = e.target;
    setUserFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyAuctionFilter = (e) => {
    e.preventDefault();
    setAuctionFilter((prev) => ({ ...prev, offset: 0 })); // Reset to first page
    fetchAuctions();
  };

  const applyUserFilter = (e) => {
    e.preventDefault();
    setUserFilter((prev) => ({ ...prev, offset: 0 })); // Reset to first page
    fetchUsers();
  };

  const renderDashboardSummary = () => {
    if (loading)
      return (
        <div className="dashboard-loading">Loading dashboard summary...</div>
      );
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
      <>
        {/* Summary Cards */}
        {summary && (
          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>Total Users</h3>
              <div className="summary-number">{summary.total_users}</div>
            </div>
            <div className="summary-card">
              <h3>Sellers</h3>
              <div className="summary-number">{summary.total_sellers}</div>
            </div>
            <div className="summary-card">
              <h3>Buyers</h3>
              <div className="summary-number">{summary.total_buyers}</div>
            </div>
            <div className="summary-card">
              <h3>Active Auctions</h3>
              <div className="summary-number">{summary.active_auctions}</div>
            </div>
            <div className="summary-card">
              <h3>Pending Approvals</h3>
              <div className="summary-number">{summary.pending_approvals}</div>
            </div>
            <div className="summary-card">
              <h3>Total Sales</h3>
              <div className="summary-number">
                ${(Number(summary?.total_transaction_value) || 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Recent Auctions */}
        <section className="dashboard-section">
          <h2>Recent Auctions</h2>
          {recentAuctions.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Auction Title</th>
                    <th>Item</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Bids</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAuctions.map((auction) => (
                    <tr key={auction.auction_id}>
                      <td>{auction.auction_title}</td>
                      <td>{auction.item_title}</td>
                      <td>{auction.seller_name}</td>
                      <td>
                        <span
                          className={`status-badge ${auction.auction_status}`}
                        >
                          {auction.auction_status}
                        </span>
                      </td>
                      <td>{auction.bid_count}</td>
                      <td>
                        <a
                          href={`/auctions/${auction.auction_id}`}
                          className="action-btn view"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">No recent auctions</p>
          )}
        </section>

        {/* Pending Approvals */}
        <section className="dashboard-section">
          <h2>Pending Approvals</h2>
          {pendingApprovals.length > 0 ? (
            <div className="approval-cards">
              {pendingApprovals.slice(0, 3).map((approval) => (
                <div className="approval-card" key={approval.approval_id}>
                  <div className="approval-image">
                    <img
                      src={approval.primary_image}
                      alt={approval.item_title}
                    />
                  </div>
                  <div className="approval-details">
                    <h3>{approval.auction_title}</h3>
                    <p className="item-title">Item: {approval.item_title}</p>
                    <p>Seller: {approval.seller_name}</p>
                    <p>Category: {approval.category_name}</p>
                    <p>Starting price: ${approval.starting_price}</p>
                    <div className="approval-actions">
                      <a
                        href={`/auctions/${approval.auction_id}`}
                        className="action-btn view"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">No pending approvals</p>
          )}
          <div className="section-footer">
            <button
              className="view-all-btn"
              onClick={() => setActiveTab("approvals")}
            >
              View All Approvals
            </button>
          </div>
        </section>

        {/* Recent Users */}
        <section className="dashboard-section">
          <h2>Recent Users</h2>
          {recentUsers.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.user_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn view">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">No recent users</p>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="dashboard-section">
          <h2>Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Auction</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td>{transaction.auction_title}</td>
                      <td>{transaction.buyer_name}</td>
                      <td>{transaction.seller_name}</td>
                      <td>${Number(transaction.amount).toFixed(2)}</td>
                      <td>
                        <span
                          className={`status-badge ${transaction.transaction_status.toLowerCase()}`}
                        >
                          {transaction.transaction_status}
                        </span>
                      </td>
                      <td>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data-message">No recent transactions</p>
          )}
        </section>
      </>
    );
  };

  const renderAuctionManagement = () => {
    if (loading)
      return <div className="dashboard-loading">Loading auctions...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
      <>
        <h2>Auction Management</h2>

        {/* Filter Form */}
        <form className="filter-form" onSubmit={applyAuctionFilter}>
          <div className="filter-group">
            <label>Status:</label>
            <select
              name="status"
              value={auctionFilter.status}
              onChange={handleAuctionFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="ended">Ended</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>From:</label>
            <input
              type="date"
              name="dateStart"
              value={auctionFilter.dateStart}
              onChange={handleAuctionFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>To:</label>
            <input
              type="date"
              name="dateEnd"
              value={auctionFilter.dateEnd}
              onChange={handleAuctionFilterChange}
            />
          </div>

          <button type="submit" className="apply-filter-btn">
            Apply Filter
          </button>
        </form>

        {/* Auction Stats */}
        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Total</h3>
            <div className="summary-number">
              {auctionStats?.total_auctions || 0}
            </div>
          </div>
          <div className="summary-card">
            <h3>Active</h3>
            <div className="summary-number">
              {auctionStats?.active_auctions || 0}
            </div>
          </div>
          <div className="summary-card">
            <h3>Pending Approval</h3>
            <div className="summary-number">
              {auctionStats?.pending_approval || 0}
            </div>
          </div>
          <div className="summary-card">
            <h3>Ended</h3>
            <div className="summary-number">
              {auctionStats?.ended_auctions || 0}
            </div>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Auction Title</th>
                <th>Item</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Current Price</th>
                <th>Bids</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr key={auction.auction_id}>
                  <td>{auction.auction_title}</td>
                  <td>{auction.item_title}</td>
                  <td>{auction.seller_name}</td>
                  <td>{auction.category_name}</td>
                  <td>
                    <span className={`status-badge ${auction.auction_status}`}>
                      {auction.auction_status}
                    </span>
                  </td>
                  <td>
                    {new Date(auction.start_datetime).toLocaleDateString()}
                  </td>
                  <td>{new Date(auction.end_datetime).toLocaleDateString()}</td>
                  <td>${Number(auction.current_price).toFixed(2)}</td>
                  <td>{auction.bid_count}</td>
                  <td>
                    <div className="action-buttons">
                      <a
                        href={`/auctions/${auction.auction_id}`}
                        className="action-btn view"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={auctionPagination.offset === 0}
            onClick={() => {
              const newOffset = Math.max(
                0,
                auctionPagination.offset - auctionPagination.limit
              );
              setAuctionFilter((prev) => ({ ...prev, offset: newOffset }));
              fetchAuctions();
            }}
          >
            Previous
          </button>

          <span className="pagination-info">
            {auctionPagination.offset + 1} -{" "}
            {Math.min(
              auctionPagination.offset + auctionPagination.limit,
              auctionPagination.total
            )}{" "}
            of {auctionPagination.total}
          </span>

          <button
            className="pagination-btn"
            disabled={
              auctionPagination.offset + auctionPagination.limit >=
              auctionPagination.total
            }
            onClick={() => {
              const newOffset =
                auctionPagination.offset + auctionPagination.limit;
              setAuctionFilter((prev) => ({ ...prev, offset: newOffset }));
              fetchAuctions();
            }}
          >
            Next
          </button>
        </div>
      </>
    );
  };

  const renderUserManagement = () => {
    if (loading)
      return <div className="dashboard-loading">Loading users...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
      <>
        <h2>User Management</h2>

        {/* Filter Form */}
        <form className="filter-form" onSubmit={applyUserFilter}>
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              name="search"
              placeholder="Search by name or email"
              value={userFilter.search}
              onChange={handleUserFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Role:</label>
            <select
              name="role"
              value={userFilter.role}
              onChange={handleUserFilterChange}
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              name="sortBy"
              value={userFilter.sortBy}
              onChange={handleUserFilterChange}
            >
              <option value="created_at">Join Date</option>
              <option value="user_name">Username</option>
              <option value="total_items_listed">Items Listed</option>
              <option value="total_spent">Total Spent</option>
              <option value="total_earned">Total Earned</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select
              name="sortOrder"
              value={userFilter.sortOrder}
              onChange={handleUserFilterChange}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>

          <button type="submit" className="apply-filter-btn">
            Apply Filter
          </button>
        </form>

        {/* Users Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Items Listed</th>
                <th>Auctions</th>
                <th>Bids</th>
                <th>Purchases</th>
                <th>Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>{user.total_items_listed}</td>
                  <td>{user.total_auctions_created}</td>
                  <td>{user.total_bids_placed}</td>
                  <td>${Number(user.total_spent).toFixed(2)}</td>
                  <td>${Number(user.total_earned).toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={userPagination.offset === 0}
            onClick={() => {
              const newOffset = Math.max(
                0,
                userPagination.offset - userPagination.limit
              );
              setUserFilter((prev) => ({ ...prev, offset: newOffset }));
              fetchUsers();
            }}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {Math.floor(userPagination.offset / userPagination.limit) + 1}{" "}
            of {userPagination.pages}
          </span>

          <button
            className="pagination-btn"
            disabled={
              userPagination.offset + userPagination.limit >=
              userPagination.total
            }
            onClick={() => {
              const newOffset = userPagination.offset + userPagination.limit;
              setUserFilter((prev) => ({ ...prev, offset: newOffset }));
              fetchUsers();
            }}
          >
            Next
          </button>
        </div>
      </>
    );
  };

  const renderCategoryManagement = () => {
    if (loading)
      return <div className="dashboard-loading">Loading categories...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
      <>
        <h2>Category Management</h2>

        {/* Add Category Form */}
        <div className="form-card">
          <h3>Add New Category</h3>
          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text"
                value={newCategory.categoryName}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    categoryName: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Parent Category (optional):</label>
              <select
                value={newCategory.parentCategoryId}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    parentCategoryId: e.target.value,
                  })
                }
              >
                <option value="">No Parent (Top Level)</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Add Category
            </button>
          </form>
        </div>

        {/* Edit Category Form */}
        {editingCategory && (
          <div className="form-card">
            <h3>Edit Category</h3>
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Category Name:</label>
                <input
                  type="text"
                  value={editingCategory.categoryName}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      categoryName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Parent Category (optional):</label>
                <select
                  value={editingCategory.parentCategoryId || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      parentCategoryId: e.target.value,
                    })
                  }
                >
                  <option value="">No Parent (Top Level)</option>
                  {categories
                    .filter(
                      (cat) => cat.category_id !== editingCategory.categoryId
                    )
                    .map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Update Category
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Parent Category</th>
                <th>Child Categories</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.category_id}>
                  <td>{category.category_name}</td>
                  <td>{category.parent_category_name || "—"}</td>
                  <td>{category.child_count}</td>
                  <td>{category.item_count}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() =>
                          setEditingCategory({
                            categoryId: category.category_id,
                            categoryName: category.category_name,
                            parentCategoryId: category.parent_category_id || "",
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() =>
                          handleDeleteCategory(category.category_id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="main-tabs">
        <button
          className={activeTab === "dashboard" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={activeTab === "auctions" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("auctions")}
        >
          Auctions
        </button>
        <button
          className={activeTab === "users" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={activeTab === "categories" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={activeTab === "approvals" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("approvals")}
        >
          Approvals
          {summary && summary.pending_approvals > 0 && (
            <span className="notification-badge">
              {summary.pending_approvals}
            </span>
          )}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "dashboard" && renderDashboardSummary()}
        {activeTab === "auctions" && renderAuctionManagement()}
        {activeTab === "users" && renderUserManagement()}
        {activeTab === "categories" && renderCategoryManagement()}
        {activeTab === "approvals" && renderApprovalRequests()}
      </div>
    </div>
  );
};
export default AdminDashboard;
