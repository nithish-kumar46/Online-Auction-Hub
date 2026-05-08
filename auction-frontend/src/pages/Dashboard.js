import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("open");
  const [filter, setFilter] = useState("open");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/items")
      .then(res => {
        if (Array.isArray(res.data)) {
          setItems(res.data);
        } else {
          console.error("API Error:", res.data);
          setItems([]);   // fallback
        }
      });
  }, []);

  const [time, setTime] = useState(Date.now());

useEffect(() => {
  const timer = setInterval(() => {
    setTime(Date.now());   // forces re-render
  }, 1000);

  return () => clearInterval(timer);
}, []);

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

  // 🔍 FILTER LOGIC
  const filteredItems = items.filter(item => {

    const title = item[2].toLowerCase();
    const basePrice = item[4];

    // Search filter
    const matchesSearch = title.includes(search.toLowerCase());

    // Price filter
    let matchesPrice = true;

    if (priceFilter === "low") {
      matchesPrice = basePrice < 20000;
    } else if (priceFilter === "medium") {
      matchesPrice = basePrice >= 20000 && basePrice <= 50000;
    } else if (priceFilter === "high") {
      matchesPrice = basePrice > 50000;
    }

    const ended=getTimeLeft(item[5]) === "Ended";
    let matchesStatus = true;
    if(filter==="open"){
      matchesStatus=!ended;
    }else if (filter==="ended"){
      matchesStatus=ended;
    }

    return matchesSearch && matchesPrice && matchesStatus;
  });
  
const isEndingSoon = (endTime) => {

  if (!endTime) return false;

  // Parse GMT time
  const endUTC = new Date(Date.parse(endTime));

  // Convert to IST manually
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const adjustedEnd = new Date(endUTC.getTime() - IST_OFFSET);

  const now = new Date();

  const diff = adjustedEnd - now;

  // Less than 1 hour remaining
  return diff > 0 && diff <= 3600000;
};

const deleteAuction = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this auction?"
  );

  if (!confirmDelete) return;

  try {

    await axios.delete(
      `http://127.0.0.1:5000/api/delete_item/${id}`
    );

    // Remove deleted item from UI instantly
    setItems(items.filter(item => item[0] !== id));

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">

      {/* Navbar */}
      <div className="bg-white shadow flex justify-between items-center px-8 py-4">
        <h1 className="text-xl font-bold text-gray-800">Auction Hub</h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">👤 {user.username}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-blue-600">Login</a>
              <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Register
              </a>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Live Auctions</h2>

        <a href="/create"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg">
           Create Auction
        </a>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="px-8 flex flex-wrap gap-4 mb-4 items-center">

  {/* Search */}
  <input
    type="text"
    placeholder="Search items..."
    className="h-10 px-3 border rounded w-1/3 text-sm"
    onChange={(e) => setSearch(e.target.value)}
  />

  {/* Price Filter */}
  <select
    className="h-10 px-3 border rounded text-sm"
    onChange={(e) => setPriceFilter(e.target.value)}
  >
    <option value="all">All Prices</option>
    <option value="low">Below ₹20,000</option>
    <option value="medium">₹20,000 - ₹50,000</option>
    <option value="high">Above ₹50,000</option>
  </select>

  {/* Status Buttons */}
  <div className="flex gap-3 items-center">

    <button
      onClick={() => setFilter("all")}
      className={`h-10 px-4 rounded-lg text-sm flex items-center justify-center transition ${
        filter === "all"
          ? "bg-blue-500 text-white"
          : "bg-gray-200"
      }`}
    >
      All
    </button>

    <button
      onClick={() => setFilter("open")}
      className={`h-10 px-4 rounded-lg text-sm flex items-center justify-center transition ${
        filter === "open"
          ? "bg-green-500 text-white"
          : "bg-gray-200"
      }`}
    >
      Open
    </button>

    <button
      onClick={() => setFilter("ended")}
      className={`h-10 px-4 rounded-lg text-sm flex items-center justify-center transition ${
        filter === "ended"
          ? "bg-red-500 text-white"
          : "bg-gray-200"
      }`}
    >
      Ended
    </button>

  </div>

</div>

      {/* Cards */}
      <div className="px-8 grid md:grid-cols-3 gap-6">

        {filteredItems.map(item => {
          console.log("RAW TIME:", item[6]);
          return (            

           <div
              key={item[0]}
              className={`relative p-4 rounded-xl shadow border-2 ${
                isEndingSoon(item[5])
                  ? "bg-red-50 border-red-400"
                  : "bg-white border-transparent"
              }`}
            >
            

            {/* DELETE ICON */}
            {user && user.user_id === item[1] && (
              <button
                onClick={() => deleteAuction(item[0])}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold"
              >
                ×
              </button>
            )}
            <h3 className="text-lg font-semibold text-gray-800">
              {item[2]}
            </h3>
            
            <p className="mt-2 text-gray-600">
              Base Price: ₹ {item[4]}
            </p>

            <p className="text-green-600 font-semibold">
              Highest Bid: ₹ {item[6] === 0 ? "OPEN" : item[6]}
            </p>
            {item[6] &&
            parseFloat(item[6]) > 0 &&
            parseFloat(localStorage.getItem("lastBid")) === parseFloat(item[6]) && (

              getTimeLeft(item[5]) === "Ended" ? (

                <p className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold inline-block mt-2">
                  🎉 You Won
                </p>

              ) : (

                <p className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold inline-block mt-2">
                  🏆 You are leading
                </p>

              )
            )}

            <p className="text-red-500 font-semibold mt-2">
              ⏱ {getTimeLeft(item[5])}
            </p>

            {isEndingSoon(item[5]) && getTimeLeft(item[5]) !== "Ended" && (
              <p className="text-red-600 font-bold mt-2 animate-pulse">
                 Auction Ending Soon !!!
              </p>
            )}

            <button
              onClick={() => window.location.href = `/bid/${item[0]}`}
              className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-lg"
            >
              Place Bid
            </button>
      
          </div>
        );
      })}

      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No items found
        </p>
      )}

    </div>
  );
}

export default Dashboard;