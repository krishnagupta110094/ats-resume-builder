import React, { useState } from "react";
import { resumeApi, authApi } from "../services/backendApi";

/**
 * Quick test component to verify backend integration
 * Remove this file after testing is complete
 */
export default function BackendTest() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testResumeUpload = async () => {
    setLoading(true);
    try {
      const testData = {
        resumeData: {
          basicdetails: {
            name: "Test User",
            title: "Software Engineer",
            email: "test@example.com",
            phone: "123-456-7890",
          },
          about: "Test description",
          education: [],
          techSkills: ["JavaScript"],
          softSkills: ["Communication"],
          projects: [],
          experience: [],
          certifications: [],
        },
      };

      const response = await resumeApi.uploadResume(testData);
      setResult(
        `✅ Resume upload successful: ${JSON.stringify(response, null, 2)}`
      );
    } catch (error: any) {
      setResult(`❌ Error uploading resume: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authApi.login({
        email: "test@example.com",
        password: "testpassword",
      });
      setResult(`✅ Login successful: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(
        `❌ Login failed (expected if no user exists): ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const checkBackendConnection = async () => {
    setLoading(true);
    try {
      // Try to make a basic request to see if backend is reachable
      const response = await fetch(
        "https://crm-backend-iahe.onrender.com/api/resume/Resume",
        {
          method: "OPTIONS",
          mode: "cors",
        }
      );

      if (response.ok) {
        setResult("✅ Backend is reachable on port 3000");
      } else {
        setResult(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error: any) {
      setResult(
        `❌ Cannot reach backend: ${error.message}. Make sure your backend is running on port 3000.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Backend Integration Test</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={checkBackendConnection}
          disabled={loading}
          style={{ marginRight: "10px", padding: "10px 15px" }}
        >
          Check Backend Connection
        </button>

        <button
          onClick={testResumeUpload}
          disabled={loading}
          style={{ marginRight: "10px", padding: "10px 15px" }}
        >
          Test Resume Upload
        </button>

        <button
          onClick={testLogin}
          disabled={loading}
          style={{ padding: "10px 15px" }}
        >
          Test Login
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        {result || "Click a button to test backend integration"}
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Instructions:</strong>
        </p>
        <ol>
          <li>
            Make sure your backend server is running:{" "}
            <code>cd d:\ATSFRIENDLYRESUME_UI-main && node server.js</code>
          </li>
          <li>
            Backend should be accessible at{" "}
            <code>https://crm-backend-iahe.onrender.com</code>
          </li>
          <li>Test connection first, then try the API calls</li>
        </ol>
      </div>
    </div>
  );
}
