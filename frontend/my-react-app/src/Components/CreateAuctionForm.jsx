import React, { useState } from "react";
import axios from "axios";
import "./CreateAuctionForm.css";
import {
  validateItemDetails,
  validateAuctionDetails,
  formatCurrency,
  getRemainingTime,
  handleApiError,
} from "../utils/AuctionFormValidation";

const CreateAuctionForm = ({ categories, onCancel, onSuccess }) => {
  const initialFormData = {
    item_title: "",
    item_description: "",
    item_condition: "new",
    item_brand: "",
    item_model: "",
    category_name: "",
    image_urls: [""],
    auction_title: "",
    auction_description: "",
    starting_price: "",
    auction_duration: 24,
    start_datetime: "",
    is_draft: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 for item details, 2 for auction details

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleImageFileChange = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updatedUrls = [...formData.image_urls];
      updatedUrls[index] = base64String;
      setFormData({
        ...formData,
        image_urls: updatedUrls,
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addImageUrlField = () => {
    if (formData.image_urls.length < 10) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, ""],
      });
    } else {
      setErrors({
        ...errors,
        image_urls: "Maximum 10 images allowed",
      });
    }
  };

  const removeImageUrlField = (index) => {
    if (formData.image_urls.length > 1) {
      const updatedUrls = formData.image_urls.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        image_urls: updatedUrls,
      });
    }
  };

  const handleNextStep = () => {
    const validationErrors = validateItemDetails(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // If we don't have an auction title yet, use the item title as default
      if (!formData.auction_title) {
        setFormData({
          ...formData,
          auction_title: formData.item_title,
          auction_description: formData.item_description,
        });
      }
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    const validationErrors = validateAuctionDetails(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const submissionData = {
        ...formData,
        is_draft: isDraft,
        starting_price: parseFloat(formData.starting_price),
        auction_duration: parseInt(formData.auction_duration),
      };
      console.log(token)
      const response = await axios.post(
        "http://localhost:3000/auctions/create",
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.auction_id) {
        if (isDraft) {
          alert("Auction saved as draft successfully!");
        } else {
          alert("Auction created successfully and is pending approval!");
        }
        onSuccess();
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setErrors({
        ...errors,
        submit: errorMessage,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-auction-form">
      <div className="form-header">
        <h2>
          {step === 1
            ? "Create New Auction - Item Details"
            : "Create New Auction - Auction Details"}
        </h2>
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
        </div>
      </div>

      {errors.submit && <div className="error-banner">{errors.submit}</div>}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="item-details-section">
            <div className="form-group">
              <label htmlFor="item_title">Item Title *</label>
              <input
                type="text"
                id="item_title"
                name="item_title"
                value={formData.item_title}
                onChange={handleChange}
                className={errors.item_title ? "error" : ""}
                disabled={loading}
                maxLength={50}
              />
              {errors.item_title && (
                <div className="error-message">{errors.item_title}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="item_description">Item Description</label>
              <textarea
                id="item_description"
                name="item_description"
                value={formData.item_description}
                onChange={handleChange}
                rows="4"
                disabled={loading}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item_condition">Condition *</label>
                <select
                  id="item_condition"
                  name="item_condition"
                  value={formData.item_condition}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category_name">Category *</label>
                <select
                  id="category_name"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  className={errors.category_name ? "error" : ""}
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_name}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
                {errors.category_name && (
                  <div className="error-message">{errors.category_name}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item_brand">Brand</label>
                <input
                  type="text"
                  id="item_brand"
                  name="item_brand"
                  value={formData.item_brand}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="item_model">Model</label>
                <input
                  type="text"
                  id="item_model"
                  name="item_model"
                  value={formData.item_model}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Upload Images *</label>
              {errors.image_urls && (
                <div className="error-message image-url-error">
                  {errors.image_urls}
                </div>
              )}

              <div className="image-urls-container">
                {formData.image_urls.map((base64Image, index) => (
                  <div key={index} className="image-url-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageFileChange(index, e.target.files[0])
                      }
                      disabled={loading}
                    />
                    {base64Image && (
                      <img
                        src={base64Image}
                        alt={`Preview ${index + 1}`}
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          marginTop: "5px",
                        }}
                      />
                    )}
                    {formData.image_urls.length > 1 && (
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImageUrlField(index)}
                        disabled={loading}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {formData.image_urls.length < 10 && (
                  <button
                    type="button"
                    className="add-image-btn"
                    onClick={addImageUrlField}
                    disabled={loading}
                  >
                    + Add Another Image
                  </button>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleNextStep}
                disabled={loading}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="auction-details-section">
            <div className="form-group">
              <label htmlFor="auction_title">Auction Title *</label>
              <input
                type="text"
                id="auction_title"
                name="auction_title"
                value={formData.auction_title}
                onChange={handleChange}
                className={errors.auction_title ? "error" : ""}
                disabled={loading}
                maxLength={100}
              />
              {errors.auction_title && (
                <div className="error-message">{errors.auction_title}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="auction_description">Auction Description</label>
              <textarea
                id="auction_description"
                name="auction_description"
                value={formData.auction_description}
                onChange={handleChange}
                rows="4"
                disabled={loading}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="starting_price">Starting Price ($) *</label>
                <input
                  type="number"
                  id="starting_price"
                  name="starting_price"
                  value={formData.starting_price}
                  onChange={handleChange}
                  className={errors.starting_price ? "error" : ""}
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                />
                {errors.starting_price && (
                  <div className="error-message">{errors.starting_price}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="auction_duration">Duration (hours) *</label>
                <input
                  type="number"
                  id="auction_duration"
                  name="auction_duration"
                  value={formData.auction_duration}
                  onChange={handleChange}
                  className={errors.auction_duration ? "error" : ""}
                  min="1"
                  max="168"
                  disabled={loading}
                />
                {errors.auction_duration && (
                  <div className="error-message">{errors.auction_duration}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="start_datetime">
                Start Date/Time (leave empty for immediate)
              </label>
              <input
                type="datetime-local"
                id="start_datetime"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleChange}
                className={errors.start_datetime ? "error" : ""}
                disabled={loading}
              />
              {errors.start_datetime && (
                <div className="error-message">{errors.start_datetime}</div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="back-btn"
                onClick={handlePrevStep}
                disabled={loading}
              >
                Back
              </button>

              <div className="right-buttons">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Auction"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateAuctionForm;
