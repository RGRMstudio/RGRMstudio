import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  // Step 1: Only allow GET requests (for testing only)
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed. This endpoint only accepts GET requests.' 
    });
  }

  // Step 2: Security - Only allow in development mode
  // In production, this endpoint should return 404 (not found)
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      error: 'Not found' 
    });
  }

  try {
    // Step 3: Create database connection using environment variables
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Step 4: Test the connection with a simple query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    
    // Step 5: Close the connection to free resources
    await connection.end();

    // Step 6: Return success with minimal, safe information
    res.status(200).json({ 
      success: true, 
      message: '✅ Database connection successful!',
      database: {
        name: process.env.DB_NAME || 'test',
        status: 'connected',
        test_result: rows[0].test,
        timestamp: rows[0].current_time
      },
      note: 'This endpoint is only available in development mode.'
    });

  } catch (error) {
    console.error('Database connection error:', error);
    
    // Step 7: Security - Don't expose detailed errors in production
    let errorMessage;
    let errorDetails = null;
    
    if (process.env.NODE_ENV === 'development') {
      // In development, show details to help debugging
      errorMessage = `Database connection failed: ${error.message}`;
      errorDetails = {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      };
    } else {
      // In production, show generic message
      errorMessage = 'Database connection failed. Check server logs.';
    }
    
    // Step 8: Return error response
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails,
      tip: 'Check your .env.local file for correct database credentials.'
    });
  }
}
