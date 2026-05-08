import { useState } from "react";
import axios from "axios";

function CreateItem() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [data, setData] = useState({
    title: "",
    description: "",
    base_price: "",
    end_time: ""
  });

  const createItem = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first!");
    window.location.href = "/login";
    return;
  }
  const formattedTime = data.end_time;  // ✅ keep local time

  axios.post("http://127.0.0.1:5000/api/create_item", {
    ...data,
    seller_id: user.user_id,
    end_time: formattedTime
  }).then(() => {
    alert("Auction Created Successfully!");
    window.location.href = "/";
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex justify-center items-center">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Auction
        </h2>

        {/* Title */}
        <label className="text-gray-600 text-sm">Item Title</label>
        <input
          className="w-full p-2 mt-1 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter item name"
          onChange={e => setData({...data, title: e.target.value})}
        />

        {/* Description */}
        <label className="text-gray-600 text-sm">Description</label>
        <textarea
          className="w-full p-2 mt-1 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter description"
          onChange={e => setData({...data, description: e.target.value})}
        />

        {/* Base Price */}
        <label className="text-gray-600 text-sm">Base Price (₹)</label>
        <input
          type="number"
          className="w-full p-2 mt-1 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter base price"
          onChange={e => setData({...data, base_price: e.target.value})}
        />

        {/* End Time */}
        <label className="text-gray-600 text-sm">Auction End Time</label>
        <input
          type="datetime-local"
          className="w-full p-2 mt-1 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={e => setData({...data, end_time: e.target.value})}
        />

        {/* Button */}
        <button
          onClick={createItem}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold shadow"
        >
          Create Auction
        </button>

      </div>

    </div>
  );
}

export default CreateItem;