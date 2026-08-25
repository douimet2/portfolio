'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mediaUrl, isVideo } from '@/lib/media';

interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  aiContext: string;
  demoUrl?: string;
  slug: string;
  longDescription?: string;
  technologies?: string[];
  screenshots?: string[];
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading projects:', error);
      showMessage('Error loading projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleNewProject = () => {
    setFormData({
      id: String(Date.now()),
      title: '',
      description: '',
      icon: '🚀',
      aiContext: 'AI-powered tool',
      slug: '',
      demoUrl: '',
      longDescription: '',
      technologies: [],
    });
    setEditingId('new');
  };

  const handleEdit = (project: Project) => {
    setFormData({ ...project });
    setEditingId(project.id);
  };

  const handleSave = async () => {
    if (!formData) return;

    if (!formData.title || !formData.slug) {
      showMessage('Title and slug are required', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save project');
      }

      await loadProjects();
      setFormData(null);
      setEditingId(null);
      showMessage('Project saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving project:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to save project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setSaving(true);
      const response = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await loadProjects();
      showMessage('Project deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting project:', error);
      showMessage('Failed to delete project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(null);
    setEditingId(null);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Capture both before any await — currentTarget is nulled once the handler
    // returns, so touching it after an await throws.
    const input = e.currentTarget;
    const files = Array.from(input.files || []);
    if (files.length === 0 || !formData) return;

    if (!formData.slug.trim()) {
      showMessage('Enter a slug first — it decides where the media is stored', 'error');
      input.value = '';
      return;
    }

    try {
      setUploading(true);

      const uploadFormData = new FormData();
      files.forEach((file) => uploadFormData.append('files', file));
      uploadFormData.append('projectSlug', formData.slug);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload files');
      }

      // Functional update: an upload takes seconds, and every field's onChange
      // captures formData from its own render. Spreading a closed-over formData
      // here would silently discard anything typed while the upload was in
      // flight (and vice versa).
      setFormData((prev) =>
        prev ? { ...prev, screenshots: [...(prev.screenshots || []), ...data.paths] } : prev
      );
      showMessage(
        `Uploaded ${data.count} file${data.count === 1 ? '' : 's'} — remember to save the project`,
        'success'
      );
    } catch (error) {
      console.error('Error uploading screenshots:', error);
      showMessage(error instanceof Error ? error.message : 'Failed to upload files', 'error');
    } finally {
      input.value = '';
      setUploading(false);
    }
  };

  const removeScreenshot = (path: string) => {
    setFormData((prev) =>
      prev ? { ...prev, screenshots: (prev.screenshots || []).filter((s) => s !== path) } : prev
    );
  };

  const exportProjects = () => {
    const code = `export const projects: Project[] = ${JSON.stringify(projects, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (editingId && formData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
            ← Back to portfolio
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {editingId === 'new' ? 'Add New Project' : 'Edit Project'}
          </h1>

          <form className="space-y-6 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., My Awesome Project"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description for the gallery card"
              />
            </div>

            {/* Long Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Description
              </label>
              <textarea
                value={formData.longDescription || ''}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description for the project detail page"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon (emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={2}
                className="w-full text-4xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">/projects/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="my-project"
                />
              </div>
            </div>

            {/* AI Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Context</label>
              <select
                value={formData.aiContext}
                onChange={(e) => setFormData({ ...formData, aiContext: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>AI-powered tool</option>
                <option>AI-built tool</option>
                <option>AI-powered processing</option>
                <option>AI-powered conversations</option>
                <option>AI-powered analytics</option>
                <option>AI-built auto texter</option>
              </select>
            </div>

            {/* Demo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo URL (optional)
              </label>
              <input
                type="url"
                value={formData.demoUrl || ''}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.technologies?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technologies: e.target.value.split(',').map((t) => t.trim()),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            {/* Screenshots/Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshots & Videos
              </label>
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={handleScreenshotUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported: JPG, PNG, WebP, MP4, WebM (max 50MB each)
                </p>
              </div>

              {/* Display uploaded screenshots */}
              {formData.screenshots && formData.screenshots.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Files:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.screenshots.map((screenshot) => (
                      <div key={screenshot} className="relative group">
                        {isVideo(screenshot) ? (
                          <video
                            src={mediaUrl(screenshot)}
                            className="w-full h-24 object-cover rounded border border-gray-200 bg-gray-100"
                          />
                        ) : (
                          <img
                            src={mediaUrl(screenshot)}
                            alt="Screenshot"
                            className="w-full h-24 object-cover rounded border border-gray-200"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeScreenshot(screenshot)}
                          className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingId === 'new' ? 'Create Project' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to portfolio
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
          <button
            onClick={handleNewProject}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <>
        {/* Projects List */}
        <div className="space-y-4 mb-8">
          {projects.length === 0 ? (
            <p className="text-gray-600 py-8">No projects yet. Create one to get started!</p>
          ) : (
            projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-3xl">{project.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    /projects/{project.slug} • {project.aiContext}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={saving}
                  className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Export Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Export & Deploy</h2>
          <p className="text-gray-700 mb-4">
            Click below to copy the projects array to your clipboard. Then paste it into
            <code className="bg-gray-200 px-2 py-1 rounded text-sm mx-1">src/data/projects.ts</code>
            and commit to GitHub for automatic Vercel deployment.
          </p>
          <button
            onClick={exportProjects}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? '✓ Copied to clipboard' : 'Copy projects.ts code'}
          </button>
        </div>
      </div>
    </div>
  );
}
