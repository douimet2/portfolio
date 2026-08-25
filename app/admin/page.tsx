'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projects as initialProjects } from '@/data/projects';

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
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Project | null>(null);
  const [copied, setCopied] = useState(false);

  const handleNewProject = () => {
    setFormData({
      id: String(projects.length + 1),
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

  const handleSave = () => {
    if (!formData) return;

    if (editingId === 'new') {
      setProjects([...projects, formData]);
    } else {
      setProjects(projects.map((p) => (p.id === editingId ? formData : p)));
    }

    setFormData(null);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData(null);
    setEditingId(null);
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

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId === 'new' ? 'Create Project' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 transition-colors"
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
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to portfolio
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
          <button
            onClick={handleNewProject}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Project
          </button>
        </div>

        {/* Projects List */}
        <div className="space-y-4 mb-8">
          {projects.map((project) => (
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
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

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
