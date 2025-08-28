# cricket-run-scorer

# Cricket Run Scorer App 🏏

A modern, real-time cricket scoring and chat application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.  
This app allows users to score cricket matches, chat with other players, share files, and view match stats—all in a clean, responsive interface.

---

## 🚀 Features

- **Live Cricket Scoring:**  
  Score matches ball-by-ball, track runs, wickets, overs, and player stats in real time.

- **Real-Time Chat:**  
  Instantly message other users, share images, videos, and documents using Socket.IO.

- **User Authentication:**  
  Secure login and registration with JWT.

- **Chat List & Search:**  
  Sidebar with recent chats, user search, and profile pictures.

- **File Sharing:**  
  Upload and preview images, videos, and documents in chat.

- **Responsive Design:**  
  Fully mobile-friendly and desktop-ready using Material UI.

- **Chat Management:**  
  Delete messages, clear chats, and manage your conversations.

---

## 🛠️ Tech Stack

- **Frontend:** React, Material UI
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Real-Time:** Socket.IO
- **File Uploads:** Multer
- **Authentication:** JWT

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/misel09/cricket-run-scorer.git
cd cricket-run-scorer
```

### 2. Setup the backend

```bash
cd server
npm install
```

- Create a `.env` file in the `server` folder with the following:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```

### 3. Setup the frontend

```bash
cd ../client
npm install
```

---

## ▶️ Running the App

### Start the backend server

```bash
cd server
npm start
```

### Start the frontend

```bash
cd ../client
npm start
```

- The frontend will run on [http://localhost:3000](http://localhost:3000)
- The backend will run on [http://localhost:5000](http://localhost:5000)

---

## 🧑‍💻 Project Structure

```
cricket-run-scorer/
  ├── client/   # React frontend
  └── server/   # Node.js backend
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server` directory:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Material UI](https://mui.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.IO](https://socket.io/)
- [Multer](https://github.com/expressjs/multer)

---

**Enjoy scoring and chatting with your cricket community! 🏏💬**
