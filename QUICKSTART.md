# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Start the Backend

1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   python main.py
   ```

   The backend will start at `http://localhost:8000`

### Step 2: Open the Frontend

1. Open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Python
     python -m http.server 8080
     
     # Node.js
     npx serve
     ```

2. Navigate to `http://localhost:8080` (or the port you chose)

### Step 3: Test the Application

1. **View the Map**: Click "View Live Map" to see the interactive map
2. **Submit a Report**: Click "Report Infestation" to submit a test report
3. **Check Dashboard**: View statistics and charts on the dashboard
4. **Explore**: Navigate through all pages to see the full functionality

## Features to Try

- ✅ Submit a report with photo upload
- ✅ View reports on the interactive map
- ✅ Filter reports by severity level
- ✅ Check dashboard statistics
- ✅ Sign up as a volunteer
- ✅ Learn about Eichhornia in the education section

## Troubleshooting

### Backend won't start
- Make sure Python 3.7+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Ensure port 8000 is not already in use

### Frontend can't connect to backend
- Make sure the backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify the API endpoints are accessible

### Images not uploading
- Make sure the `backend/uploads` directory exists
- Check file permissions on the uploads folder

## Next Steps

- Train a custom TensorFlow.js model for better image classification
- Add more features like email notifications
- Deploy to a cloud platform (Heroku, AWS, etc.)
- Add user authentication for volunteer tracking
