import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Bid() {

  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [amount, setAmount] = useState("");
  const [item, setItem] = useState(null);

  // Fetch item details
  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/items`)
      .then(res => {
        const found = res.data.find(i => i[0] == id);
        setItem(found);
      });
  }, [id]);

  // ⏱ Timer function
  const getTimeLeft = (endTime) => {

  if (!endTime) return "No Time";

  // Parse GMT time safely
  const endUTC = new Date(Date.parse(endTime));
  const now = new Date();

  if (isNaN(endUTC)) return "Invalid";

  // Subtract 5 hours 30 minutes (IST adjustment)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const adjustedEnd = new Date(endUTC.getTime() - IST_OFFSET);

  const diff = adjustedEnd - now;

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}h ${mins}m ${secs}s`;
};
  const placeBid = () => {

    if (!user) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    if (!amount) {
      alert("Enter bid amount");
      return;
    }

    axios.post("http://127.0.0.1:5000/api/bid", {
      item_id: id,
      user_id: user.user_id,
      bid_amount: Number(amount)
    }).then(res => {
      alert(res.data.message || res.data.status);
    });
    localStorage.setItem("lastBid", amount);
  };

  if (!item) return <p className="p-6">Loading...</p>;

  const isEnded = getTimeLeft(item[5]) === "Ended";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Place Your Bid
        </h2>

        {/* Item Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{item[2]}</h3>
          <p className="text-gray-600">Base Price: ₹ {item[4]}</p>

          <p className="text-green-600 font-semibold">
            Highest Bid: ₹ {item[6] || "OPEN"}
          </p>

          <p className="text-red-500 font-semibold mt-1">
            ⏱ {getTimeLeft(item[5])}
          </p>
        </div>

        {/* Bid Input */}
        <label className="text-gray-600 text-sm">Enter Bid Amount</label>
        <input
          type="number"
          className="w-full p-3 mt-1 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter amount"
          onChange={e => setAmount(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={placeBid}
          disabled={isEnded}
          className={`w-full py-2 rounded-lg font-semibold ${
            isEnded
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isEnded ? "Auction Ended" : "Submit Bid"}
        </button>

      </div>

    </div>
  );
}

export default Bid;