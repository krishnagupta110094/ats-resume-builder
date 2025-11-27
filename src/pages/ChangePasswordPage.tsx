import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import ResumeAppBar from "../components/ResumeAppBar";
import LogoutButton from "../components/LogoutButton";
import "./ChangePasswordPage.css";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNavigation = (nav: string) => {
    switch (nav) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "generate":
        navigate("/builder");
        break;
      case "certification":
        navigate("/certificate-generator");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "change-password":
        navigate("/change-password");
        break;
      case "leads":
        console.log("Customer Leads - Coming Soon");
        break;
      default:
        break;
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("Session expired. Please login again.");
        setTimeout(() => navigate("/signin"), 1500);
        return;
      }

      // Call CRM API with correct field names
      const response = await fetch(
        "https://crm-backend-iahe.onrender.com/api/users/ChangePassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        setMessage("Password changed successfully! Redirecting to login...");

        // Clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        sessionStorage.clear();

        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setMessage(
          result.message ||
            "Failed to change password. Please check your current password."
        );
      }
    } catch (error) {
      console.error("Change password error:", error);
      setMessage("Error changing password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="change-password-success">
        <div className="change-password-container">
          <div className="success-card">
            <div className="success-icon-wrapper">
              <CheckCircle className="success-icon" />
            </div>
            <h2 className="success-title">Password Changed Successfully!</h2>
            <p className="success-message">
              Your password has been updated. Please login with your new
              password.
            </p>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="change-password-bg" style={{ marginTop: "64px" }}>
        <div className="change-password-container">
          <div className="change-password-header">
            <div className="change-password-icon-wrapper">
              <Lock className="change-password-icon" />
            </div>
            <h2 className="change-password-main-title">Change Password</h2>
            <p className="change-password-subtitle">
              Enter your current password and choose a new one
            </p>
          </div>

          <div className="change-password-card">
            <form
              onSubmit={handleChangePassword}
              className="change-password-form"
            >
              {message && !isSuccess && (
                <div
                  className={`alert-box ${
                    message.includes("Error") || message.includes("Failed")
                      ? "alert-error"
                      : "alert-info"
                  }`}
                >
                  <AlertCircle className="alert-icon" />
                  <div className="alert-text">{message}</div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="oldPassword" className="form-label">
                  Current Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" />
                  <input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeOff className="toggle-password-icon" />
                    ) : (
                      <Eye className="toggle-password-icon" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="toggle-password-icon" />
                    ) : (
                      <Eye className="toggle-password-icon" />
                    )}
                  </button>
                </div>
                <p className="form-hint">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="toggle-password-icon" />
                    ) : (
                      <Eye className="toggle-password-icon" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>

              <div className="cancel-btn-wrapper">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="cancel-btn"
                >
                  Cancel and go back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;
