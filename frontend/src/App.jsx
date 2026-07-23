import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { FaSpinner } from "react-icons/fa";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState("");
const [loading, setLoading] = useState(false);

  const uploadResume = async () => {
    if (!file) {
      alert("Please select a PDF first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      // Upload Resume
      const uploadResponse = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      setMessage(uploadResponse.data.message);

      // Analyze Resume
      const analyzeResponse = await axios.get(
        `http://127.0.0.1:8000/analyze/${file.name}`
      );

      setAnalysis(analyzeResponse.data.analysis);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setMessage("Upload failed!");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          color: "#7dd3fc",
          textShadow:
            "0 0 12px #38bdf8, 0 0 25px #38bdf8, 0 0 45px #0ea5e9",
          marginBottom: "20px",
        }}
      >
        AI Resume Analyzer
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={{
          color: "white",
          marginBottom: "15px",
        }}
      />

      <button
        onClick={uploadResume}
        style={{
          marginTop: "10px",
          padding: "12px 30px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "10px",
          border: "1px solid #38bdf8",
          background: "#0f172a",
          color: "#7dd3fc",
          fontWeight: "bold",
          boxShadow: "0 0 15px rgba(56,189,248,0.5)",
        }}
      >
        Upload Resume
      </button>

      <h3
        style={{
          color: "#22c55e",
          marginTop: "20px",
        }}
      >
        {message}
      </h3>
      {loading && (
  <div
    style={{
      marginTop: "20px",
      fontSize: "22px",
      color: "#38bdf8",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    🤖 AI is analyzing your resume...
    <br />
    Please wait...
  </div>
)}

      {analysis && (
        <div
          style={{
            marginTop: "35px",
            width: "85%",
            padding: "35px",
            borderRadius: "20px",
            background: "rgba(30,41,59,0.78)",
            backdropFilter: "blur(18px)",
            border: "2px solid rgba(56,189,248,0.45)",
            boxShadow:
              "0 0 12px rgba(56,189,248,0.4), 0 0 35px rgba(56,189,248,0.25), inset 0 0 15px rgba(255,255,255,0.05)",
            color: "white",
            lineHeight: "1.8",
            textAlign: "left",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "34px",
              color: "#7dd3fc",
              marginBottom: "25px",
              textShadow:
                "0 0 10px #38bdf8, 0 0 20px #38bdf8, 0 0 35px #0ea5e9",
            }}
          >
            ATS Resume Analysis Report
          </h2>

          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;