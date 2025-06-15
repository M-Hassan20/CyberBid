# CyberBid - Online Auction Platform

CyberBid is a full-stack web application that provides a platform for online auctions. Users can register as buyers or sellers and participate in live bidding.

## Project Structure

```
CyberBid/
├── backend/     # Express.js API server
├── frontend/    # React.js frontend application
└── README.md    # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/M-Hassan20/CyberBid.git
cd CyberBid
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Configuration

1. Create a `.env` file in the backend directory with:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=cyberbid
JWT_SECRET=your_jwt_secret
```

2. Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL
- JWT for authentication

### Frontend
- React.js
- React Router
- CSS3

## Contributors
- M-Hassan20
