from flask import Flask, render_template, request, redirect 
from flask import jsonify
from flask import session
import psycopg2

from flask_cors import CORS
app = Flask(__name__)
app.secret_key = "secret123"
CORS(app)


# 🔌 DB Connection (EDIT PASSWORD)
conn = psycopg2.connect(
    database="auction_db",
    user="postgres",
    password="NK@123",
    host="localhost",
    port="5432"
)
conn.autocommit = True
# 🏠 Home Page
@app.route('/api/items', methods=['GET'])
def get_items():
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT 
                i.item_id,
                i.seller_id,
                i.title,
                i.description,
                i.base_price,
                i.end_time,
                COALESCE(MAX(b.bid_amount), 0) AS highest_bid
            FROM items i
            LEFT JOIN bids b 
                ON i.item_id = b.item_id
            GROUP BY 
                i.item_id, i.seller_id, i.title, 
                i.description, i.base_price, i.end_time
            ORDER BY i.item_id DESC
        """)

        items = cur.fetchall()

        return jsonify(items)

    except Exception as e:
        print("ERROR:", e)
        conn.rollback()
        return jsonify({"error": str(e)})
# 👤 Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.form
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO users (username, password, email) VALUES (%s,%s,%s)",
            (data['username'], data['password'], data['email'])
        )
        conn.commit()
        return redirect('/')

    return render_template("register.html")

# 📦 Create Auction
@app.route('/create_item', methods=['GET', 'POST'])
def create_item():
    if request.method == 'POST':
        data = request.form
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO items (seller_id, title, description, base_price, start_time, end_time)
            VALUES (%s,%s,%s,%s,NOW(),%s)
        """, (
            data['seller_id'],
            data['title'],
            data['description'],
            data['base_price'],
            data['end_time']
        ))

        conn.commit()
        return redirect('/')

    return render_template("create_item.html")

# 💰 Bid
from datetime import datetime

@app.route('/bid/<int:item_id>', methods=['GET', 'POST'])
def bid(item_id):
    if 'user_id' not in session:
        return redirect('/login')

    cur = conn.cursor()

    # Check auction end time
    cur.execute("SELECT end_time FROM items WHERE item_id=%s", (item_id,))
    end_time = cur.fetchone()[0]

    if datetime.now() > end_time:
        return "Auction ended!"

    if request.method == 'POST':
        bid_amount = float(request.form['bid_amount'])
        user_id = session['user_id']

        cur.execute("SELECT MAX(bid_amount) FROM bids WHERE item_id=%s", (item_id,))
        max_bid = cur.fetchone()[0]

        if max_bid and bid_amount <= max_bid:
            return "Bid must be higher!"

        cur.execute("""
            INSERT INTO bids (item_id, bidder_id, bid_amount)
            VALUES (%s,%s,%s)
        """, (item_id, user_id, bid_amount))

        conn.commit()
        return redirect('/')

    return render_template("bid.html", item_id=item_id)


@app.route('/winner/<int:item_id>')
def winner(item_id):
    cur = conn.cursor()

    cur.execute("""
        SELECT bidder_id, MAX(bid_amount)
        FROM bids
        WHERE item_id=%s
        GROUP BY bidder_id
        ORDER BY MAX(bid_amount) DESC
        LIMIT 1
    """, (item_id,))

    result = cur.fetchone()

    if result:
        return f"Winner User ID: {result[0]}, Amount: {result[1]}"
    else:
        return "No bids yet"
    
    
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.form
        cur = conn.cursor()

        cur.execute("SELECT * FROM users WHERE username=%s AND password=%s",
                    (data['username'], data['password']))
        user = cur.fetchone()

        if user:
            session['user_id'] = user[0]
            return redirect('/')
        else:
            return "Invalid login"

    return render_template("login.html")


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/api/items')
def api_items():
    cur = conn.cursor()

    cur.execute("""
        SELECT i.*, COALESCE(MAX(b.bid_amount), i.base_price) as highest_bid
        FROM items i
        LEFT JOIN bids b ON i.item_id = b.item_id
        GROUP BY i.item_id
    """)

    items = cur.fetchall()
    return jsonify(items)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username=%s AND password=%s",
                (data['username'], data['password']))
    user = cur.fetchone()

    if user:
        return jsonify({"status": "success", "user_id": user[0], "username": user[1]})
    else:
        return jsonify({"status": "fail"})
    
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    cur = conn.cursor()

    cur.execute("INSERT INTO users (username, password, email) VALUES (%s,%s,%s)",
                (data['username'], data['password'], data['email']))
    conn.commit()

    return jsonify({"status": "registered"})

@app.route('/api/create_item', methods=['POST'])
def api_create_item():
    data = request.json
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO items (seller_id, title, description, base_price, end_time)
        VALUES (%s,%s,%s,%s,%s)
    """, (data['seller_id'], data['title'], data['description'],
          data['base_price'], data['end_time']))

    conn.commit()
    return jsonify({"status": "created"})

@app.route('/api/bid', methods=['POST'])
def api_bid():

    try:
        data = request.json
        cur = conn.cursor()

        # Get highest bid
        cur.execute(
            "SELECT MAX(bid_amount) FROM bids WHERE item_id=%s",
            (data['item_id'],)
        )

        max_bid = cur.fetchone()[0]

        # Get base price
        cur.execute(
            "SELECT base_price FROM items WHERE item_id=%s",
            (data['item_id'],)
        )

        base_price = cur.fetchone()[0]

        bid_amount = float(data['bid_amount'])

        # If no bids yet, compare with base price
        if max_bid is None:

            if bid_amount < float(base_price):
                return jsonify({
                    "status": "fail",
                    "message": "Bid must be higher than base price"
                })

        # If bids already exist
        else:

            if bid_amount <= float(max_bid):
                return jsonify({
                    "status": "fail",
                    "message": "Bid must be higher than current highest bid"
                })

        # Insert bid
        cur.execute("""
            INSERT INTO bids (item_id, bidder_id, bid_amount)
            VALUES (%s,%s,%s)
        """, (
            data['item_id'],
            data['user_id'],
            bid_amount
        ))

        conn.commit()

        return jsonify({
            "status": "success"
        })

    except Exception as e:

        print(e)

        conn.rollback()

        return jsonify({
            "status": "fail",
            "message": "Bid failed"
        }), 500

@app.route('/api/delete_item/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):

    try:
        cur = conn.cursor()

        # Delete related bids first
        cur.execute(
            "DELETE FROM bids WHERE item_id = %s",
            (item_id,)
        )

        # Delete auction item
        cur.execute(
            "DELETE FROM items WHERE item_id = %s",
            (item_id,)
        )

        conn.commit()

        cur.close()

        return jsonify({"message": "Auction deleted successfully"})

    except Exception as e:
        print(e)
        return jsonify({"error": "Delete failed"}), 500

# ▶️ Run
if __name__ == '__main__':
    app.run(debug=True)