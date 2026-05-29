require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhook');
app.use('/api', apiRoutes);
app.use('/webhook', webhookRoutes);

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    // Make a simple test query to the 'Complaints' table
    const { data, error } = await supabase
      .from('Complaints')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ status: 'Database Error', details: error.message });
    }

    res.status(200).json({ 
      status: 'System Ready',
      uptime: process.uptime()
    });
  } catch (err) {
    console.error('Unexpected error during health check:', err);
    res.status(500).json({ status: 'Internal Server Error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
