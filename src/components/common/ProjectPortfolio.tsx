import React, { useState } from "react";
import { FolderGit2, Plus, Github, ExternalLink, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

export default function ProjectPortfolio({ student, onProjectAdded }: any) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    githubUrl: "",
    liveUrl: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const clean = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
      const API_URL = `${clean}/api`;
      const res = await fetch(`${API_URL}/students/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedStudent = await res.json();
        onProjectAdded(updatedStudent);
        setIsOpen(false);
        setFormData({ title: "", domain: "", githubUrl: "", liveUrl: "", description: "" });
      } else {
        console.error("Failed to add project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const projects = student.projects || [];

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 p-6">
        <div className="flex items-center gap-3">
          <FolderGit2 className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-display text-lg font-semibold">Project Portfolio</h3>
            <p className="text-xs text-muted-foreground">{projects.length} Projects Completed</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Add Project
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit a Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title <span className="text-destructive">*</span></label>
                <input required type="text" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g., Academic Dashboard" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain <span className="text-destructive">*</span></label>
                <input required type="text" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} placeholder="E.g., Web Development, Machine Learning" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub Repository Link <span className="text-destructive">*</span></label>
                <input required type="url" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Live Server / Demo Link</label>
                <input type="url" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <textarea className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe the project..."></textarea>
              </div>
              <button disabled={loading} type="submit" className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                {loading ? "Submitting..." : "Add Project"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-6">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((proj: any, idx: number) => (
              <div key={idx} className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/50 hover:shadow-glow-soft">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <Code className="h-5 w-5 text-primary" />
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary tracking-wider">
                      {proj.domain}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground mb-1">{proj.title}</h4>
                  {proj.description && <p className="text-xs text-muted-foreground line-clamp-2">{proj.description}</p>}
                </div>
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border">
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-4 w-4" /> Source
                  </a>
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors">
                      <ExternalLink className="h-4 w-4" /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderGit2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-muted-foreground">No Projects Yet</h4>
            <p className="max-w-xs text-sm text-muted-foreground mt-2">Build your portfolio by submitting projects you've completed!</p>
          </div>
        )}
      </div>
    </div>
  );
}
