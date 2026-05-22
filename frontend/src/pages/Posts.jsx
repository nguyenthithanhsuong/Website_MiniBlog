import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Clock, User, X, Send, LayoutGrid } from "lucide-react";
import { AuthContext } from "../context/AuthContextObject";

const Posts = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch {
      // console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/posts/${editingId}`, { title, content });
        setEditingId(null);
      } else {
        await api.post("/posts", { title, content });
      }
      
      setTitle("");
      setContent("");
      setIsFormOpen(false);
      fetchPosts();
    } catch {
      alert("Error saving post");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch {
      alert("Failed to delete post.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight dark:text-white flex items-center gap-3">
             <LayoutGrid className="text-blue-500" /> DevLog Feed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Explore the latest insights from our DevOps community.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Post
        </button>
      </div>

      {/* Post Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={cancelEdit}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                {editingId ? <Edit2 size={20} className="text-amber-500" /> : <Plus size={20} className="text-blue-500" />}
                {editingId ? "Update Document" : "Draft New Content"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter an impactful title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Content (Markdown supported)</label>
                  <textarea 
                    placeholder="Share your thoughts or code snippets..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white min-h-[150px] resize-none"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    {editingId ? "Update Post" : "Publish Post"}
                  </button>
                </div>
              </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Fetching data from clusters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <Motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group glass p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Tech Insight
                  </span>
                  {user && (user.userId === post.author_id || user.role === "admin") && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(post)}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 rounded-xl transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-3 dark:text-white group-hover:text-blue-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-xs">
                    <User size={14} />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px]">
                    <Clock size={12} />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
          <p className="text-slate-400">No logs found in the database. Start by creating a post!</p>
        </div>
      )}
    </div>
  );
};

export default Posts;
