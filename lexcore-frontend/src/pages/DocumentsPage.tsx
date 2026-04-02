import React, { useEffect, useState, useCallback } from 'react';
import { FolderOpen, Plus, Download, Trash2 } from 'lucide-react';
import { documentsService, mattersService } from '../services/api';
import { Document, Matter } from '../types';
import { fmt } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, ConfirmModal, SearchInput, toast } from '../components/ui';

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [matterId, setMatterId] = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(async () => {
    const [docsRes, matRes] = await Promise.all([documentsService.list(), mattersService.list({ limit: '100' })]);
    setDocs(docsRes.data);
    setMatters(matRes.data.data || []);
  }, []);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (matterId) fd.append('matterId', matterId);
      if (category) fd.append('category', category);
      await documentsService.upload(fd);
      await load();
      setShowUpload(false);
      setFile(null); setMatterId(''); setCategory('');
      toast.success('Document uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await documentsService.delete(deleteId);
      setDocs(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = docs.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Documents</h1><p className="page-subtitle">{docs.length} document{docs.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setShowUpload(true)} className="btn-primary"><Plus size={16} /> Upload</button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search documents…" className="max-w-sm" />
      <div className="card">
        {filtered.length === 0 ? <EmptyState icon={<FolderOpen size={40} />} title="No documents" action={<button onClick={() => setShowUpload(true)} className="btn-primary btn-sm">Upload Document</button>} /> : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Name</th><th>Matter</th><th>Category</th><th>Uploaded By</th><th>Size</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{d.mimetype.includes('pdf') ? '📄' : d.mimetype.includes('image') ? '🖼️' : '📝'}</span>
                        <span className="text-slate-200 truncate max-w-[180px]">{d.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-400">{d.matter?.matterNo || '—'}</td>
                    <td><span className="badge-gray">{d.category || 'other'}</span></td>
                    <td className="text-slate-400">{d.uploader?.name}</td>
                    <td className="text-xs text-slate-400">{fmt.fileSize(d.size)}</td>
                    <td className="text-xs text-slate-400">{fmt.date(d.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <a href={`/api/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm p-1.5"><Download size={14} /></a>
                        <button onClick={() => setDeleteId(d.id)} className="btn-ghost btn-sm p-1.5 text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document"
        footer={<><button onClick={() => setShowUpload(false)} className="btn-secondary">Cancel</button><button form="upload-form" type="submit" className="btn-primary" disabled={uploading || !file}>{uploading ? 'Uploading…' : 'Upload'}</button></>}>
        <form id="upload-form" onSubmit={handleUpload} className="space-y-4">
          <div className="form-group"><label className="label">File *</label><input type="file" className="input" onChange={e => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" /></div>
          <div className="form-group"><label className="label">Matter (optional)</label>
            <select className="select" value={matterId} onChange={e => setMatterId(e.target.value)}>
              <option value="">No matter</option>
              {matters.map(m => <option key={m.id} value={m.id}>{m.matterNo} — {m.title}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Category</label>
            <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select…</option>
              {['contract', 'court_filing', 'correspondence', 'evidence', 'other'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
        </form>
      </Modal>
      <ConfirmModal open={!!deleteId} title="Delete Document" message="Delete this document permanently?" danger onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
    </div>
  );
};

export default DocumentsPage;
