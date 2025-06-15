import React, { useState } from "react";
import "./EndAuctionModal.css";

const EndAuctionModal = ({ auction, onClose, onConfirm, isProcessing }) => {
  const [paymentMethod, setPaymentMethod] = useState("system");
  const [status, setStatus] = useState("ended");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(auction.auction_id, status, paymentMethod);
  };

  return (
    <div className="modal-overlay">
      <div className="end-auction-modal">
        <div className="modal-header">
          <h3>{status === "ended" ? "End Auction" : "Cancel Auction"}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <p>You are about to {status === "ended" ? "end" : "cancel"} the auction:</p>
          <p className="auction-title">{auction.auction_title}</p>
          
          {auction.auction_status === "active" && (
            <>
              {auction.bid_count > 0 ? (
                <div className="warning-message">
                  <p>This auction has {auction.bid_count} active bid(s). Ending the auction will process the highest bid as the winner.</p>
                </div>
              ) : (
                <div className="info-message">
                  <p>This auction has no bids yet. Ending it will mark it as cancelled.</p>
                </div>
              )}
            </>
          )}
          
          {auction.auction_status === "upcoming" && (
            <div className="info-message">
              <p>This auction hasn't started yet. Cancelling it will prevent it from becoming active.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {auction.auction_status === "active" && (
              <div className="form-group">
                <label>End Action:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="ended"
                      checked={status === "ended"}
                      onChange={() => setStatus("ended")}
                    />
                    End Auction (Process Winner)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="cancelled"
                      checked={status === "cancelled"}
                      onChange={() => setStatus("cancelled")}
                    />
                    Cancel Auction (No Winner)
                  </label>
                </div>
              </div>
            )}
            
            {status === "ended" && auction.bid_count > 0 && (
              <div className="form-group">
                <label htmlFor="payment_method">Payment Method:</label>
                <select
                  id="payment_method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="system">System Payment</option>
                  <option value="direct">Direct Payment</option>
                  <option value="escrow">Escrow</option>
                </select>
              </div>
            )}
            
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={status === "cancelled" ? "danger-btn" : "primary-btn"}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : status === "cancelled" ? "Confirm Cancellation" : "End Auction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EndAuctionModal;