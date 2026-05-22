const pool = require("../config/db");

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT p.id, p.title, p.content, p.user_id as author_id, u.username as author, p.created_at 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const query = `
        INSERT INTO posts (title, content, user_id) 
        VALUES ($1, $2, $3) 
        RETURNING id, title, content, created_at
    `;
    
    const result = await pool.query(query, [title, content, userId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!title && !content) {
       return res.status(400).json({ message: "At least one field (title or content) is required" });
    }

    // Check if post exists
    const postCheck = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postCheck.rows[0];

    // Check ownership or admin
    if (post.user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    // Prepare dynamic update query (simple version for just two fields)
    // For simplicity, we'll just update both if provided, or keep original if undefined (basic approach)
    // But better to just update what is sent.
    
    // A simplified standard update:
    const newTitle = title || post.title;
    const newContent = content || post.content;

    const updateQuery = `
      UPDATE posts 
      SET title = $1, content = $2 
      WHERE id = $3 
      RETURNING id, title, content, user_id, created_at
    `;

    const result = await pool.query(updateQuery, [newTitle, newContent, id]);

    res.status(200).json({ message: "Post updated successfully", post: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if post exists
    const postCheck = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postCheck.rows[0];

    // Check ownership or admin
    if (post.user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
};
