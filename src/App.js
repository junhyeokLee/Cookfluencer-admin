import React, { useState } from "react";
import Season from "./season";
import Recipe from "./recipe";

const App = () => {
  const [activeTab, setActiveTab] = useState("season"); // 현재 활성화된 탭 상태

  return (
    <div>
      {/* 탭 버튼 */}
      <div style={{ display: "flex", marginBottom: "20px",marginTop: "20px",marginLeft: "20px" }}>
        <button
          onClick={() => setActiveTab("season")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: activeTab === "season" ? "#007BFF" : "#E0E0E0",
            color: activeTab === "season" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
          }}
        >
          Season
        </button>
        <button
          onClick={() => setActiveTab("recipe")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: activeTab === "recipe" ? "#007BFF" : "#E0E0E0",
            color: activeTab === "recipe" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Recipe
        </button>
      </div>

      {/* 현재 활성화된 탭 내용 */}
      <div
      style={{margin: "20px"}}
      >
        {activeTab === "season" && <Season />}
        {activeTab === "recipe" && <Recipe />}
      </div>
    </div>
  );
};

export default App;
