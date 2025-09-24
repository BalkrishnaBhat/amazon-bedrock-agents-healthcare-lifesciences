import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function LabAIAgentUI() {
  const [chat, setChat] = useState([
    { role: "ai", text: "Hello! I’m your Lab AI Agent. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [datasets, setDatasets] = useState({ reagents: [], operations: [], results: [], inventory: [] });

  useEffect(() => {
    async function loadData() {
      try {
        const reagents = await fetch("/data/reagents.json").then((res) => res.json());
        const operations = await fetch("/data/operations.json").then((res) => res.json());
        const results = await fetch("/data/results.json").then((res) => res.json());
        const inventory = await fetch("/data/inventory.json").then((res) => res.json());
        setDatasets({ reagents, operations, results, inventory });
      } catch (err) {
        console.error("Failed to load datasets", err);
      }
    }
    loadData();
  }, []);

  const generateResponse = (question) => {
    const q = question.toLowerCase();

    // Root cause style analysis
    if (q.includes("root cause") && q.includes("turnaround")) {
      return "Root cause of delayed turnaround times: (1) Reagent B near expiry causing reruns, (2) Analyzer downtime of 1.5 hours, (3) Increased test load (20% higher than average).";
    }
    if (q.includes("root cause") && q.includes("inventory")) {
      return "Inventory-related delays were caused by stock-outs of gloves and syringes, forcing manual handling.";
    }
    if (q.includes("root cause") && q.includes("results")) {
      return "Result delays were linked to high abnormal rate in Glucose FBS tests, requiring retests.";
    }

    // Chart-specific responses
    if (q.includes("reagent") && q.includes("chart")) {
      return "Here’s a summary of reagent consumption trends. See chart below.";
    }
    if (q.includes("tests") && q.includes("chart")) {
      return "Here’s the daily test trend for the last 7 days. See chart below.";
    }
    if (q.includes("results") && q.includes("chart")) {
      return "Here’s the distribution of normal vs abnormal results. See chart below.";
    }
    if (q.includes("inventory") && q.includes("chart")) {
      return "Here’s the stock vs threshold levels for key items. See chart below.";
    }

    // Reagents
    if (q.includes("reagent a")) return "Reagent A is consumed at 150 ml/day. Stock lasts ~13 days.";
    if (q.includes("near expiry")) return "Reagent B and Reagent H are near expiry (2025-11-30, 2025-12-05).";
    if (q.includes("consumption")) return "Top consumers: Reagent A (150 ml/day), Reagent C (120 ml/day).";

    // Operations
    if (q.includes("tests yesterday")) return "Yesterday, 1,220 tests were performed.";
    if (q.includes("tests last week")) return "A total of 8,765 tests were performed last week (avg 1,252/day).";
    if (q.includes("turnaround")) return "Average turnaround time last week was 48 minutes.";
    if (q.includes("downtime")) return "Total downtime in the last 7 days was 2.5 hours.";

    // Results
    if (q.includes("abnormal glucose")) return "46 abnormal Glucose FBS results detected this week (21%).";
    if (q.includes("abnormal results")) return "2 abnormal results detected today: Hemoglobin (Low), Glucose FBS (High).";
    if (q.includes("hemoglobin")) return "12% of Hemoglobin results are outside the normal range.";

    // Inventory
    if (q.includes("reorder gloves")) return "Gloves will last ~8 days. Reorder within 3 days.";
    if (q.includes("below threshold")) return "Gloves, Syringes, and Test Tubes are below safety threshold.";
    if (q.includes("syringe stock")) return "Syringe stock will last for 14 days at current usage rate.";

    return "I checked across the datasets, but I don’t have a precise answer for that. Try asking about reagents, inventory levels, test results, or lab operations.";
  };

  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const handleAsk = (question) => {
    if (!question) return;
    setChat(prev => [...prev, { role: "user", text: question }]);

    let source = "General Lab Agent";
    let chartType = null;
    const q = question.toLowerCase();
    if (q.includes("glove") || q.includes("stock")) { source = "Inventory sub-agent"; chartType = "inventory"; }
    else if (q.includes("reagent")) { source = "Reagents sub-agent"; chartType = "reagents"; }
    else if (q.includes("result")) { source = "Results sub-agent"; chartType = "results"; }
    else if (q.includes("test") || q.includes("tat") || q.includes("downtime")) { source = "Operations sub-agent"; chartType = "operations"; }

    const isRootCause = q.includes("root cause");

    setTimeout(() => {
      setChat(prev => [...prev, { role: "ai", text: "Step 1: Analyzing your question…" }]);
      setTimeout(() => {
        setChat(prev => [...prev, { role: "ai", text: `Step 2: Connecting to ${source}…` }]);
        setTimeout(() => {
          setChat(prev => [...prev, { role: "ai", text: "Step 3: Collecting response from dataset…" }]);
          const afterStep3 = () => {
            const aiResponse = generateResponse(question);
            setChat(prev => [...prev, { role: "ai", text: `Final Answer: ${aiResponse}` }]);
            if (q.includes("chart") || q.includes("plot") || q.includes("visualize") || q.includes("graph") || q.includes("trend")) {
              setTimeout(() => {
                setChat(prev => [...prev, { role: "chart", chartType }]);
              }, randomDelay(1000, 5000));
            }
          };
          if (isRootCause) {
            setTimeout(() => {
              setChat(prev => [...prev, { role: "ai", text: "Step 4: Correlating metrics across Operations, Reagents, and Inventory…" }]);
              setTimeout(afterStep3, randomDelay(2000, 4000));
            }, randomDelay(2000, 4000));
          } else {
            setTimeout(afterStep3, randomDelay(2000, 4000));
          }
        }, randomDelay(2000, 5000));
      }, randomDelay(2000, 5000));
    }, randomDelay(2000, 4000));
  };

  const handleClear = () => {
    setChat([{ role: "ai", text: "Hello! I’m your Lab AI Agent. How can I help you today?" }]);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lab AI Agent</h1>
          <button onClick={handleClear} className="px-3 py-1 bg-red-500 text-white rounded">Clear Chat</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {chat.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {msg.role === "chart" ? (
                <div className="bg-white p-3 rounded-lg shadow w-full max-w-2xl">
                  {msg.chartType === "reagents" && datasets.reagents.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={datasets.reagents.slice(0, 10)}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" fill="#82ca9d" name="Stock" />
                        <Bar dataKey="usage" fill="#8884d8" name="Daily Usage" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {msg.chartType === "operations" && datasets.operations.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={datasets.operations.slice(-7)}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tests" stroke="#8884d8" name="Tests" />
                        <Line type="monotone" dataKey="tat" stroke="#82ca9d" name="TAT (mins)" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {msg.chartType === "results" && datasets.results.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Normal", value: datasets.results.filter(r => r.flag === "Normal").length },
                            { name: "Abnormal", value: datasets.results.filter(r => r.flag !== "Normal").length }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          <Cell fill="#82ca9d" />
                          <Cell fill="#ff7f7f" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {msg.chartType === "inventory" && datasets.inventory.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={datasets.inventory.slice(0, 10)}>
                        <XAxis dataKey="item" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="stock" fill="#8884d8" name="Stock" />
                        <Bar dataKey="threshold" fill="#ff7f7f" name="Threshold" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ) : (
                <div className={msg.role === "user" ? "px-4 py-2 rounded-lg max-w-xl bg-blue-500 text-white" : "px-4 py-2 rounded-lg max-w-xl bg-gray-200"}>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me about reagents, lab ops, test results, inventory, or root causes..." className="flex-1 border px-3 py-2 rounded" onKeyDown={(e) => e.key === "Enter" && handleAsk(input)} />
          <button onClick={() => handleAsk(input)} className="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
