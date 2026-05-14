import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { FolderOpen, Plus, Download, Trash2 } from 'lucide-react';
import { documentsService, mattersService } from '../services/api';
import { fmt } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, ConfirmModal, SearchInput, toast } from '../components/ui';
const DocumentsPage = () => {
    const [docs, setDocs] = useState([]);
    const [matters, setMatters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [file, setFile] = useState(null);
    const [matterId, setMatterId] = useState('');
    const [category, setCategory] = useState('');
    const load = useCallback(async () => {
        const [docsRes, matRes] = await Promise.all([documentsService.list(), mattersService.list({ limit: '100' })]);
        setDocs(docsRes.data);
        setMatters(matRes.data.data || []);
    }, []);
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file)
            return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            if (matterId)
                fd.append('matterId', matterId);
            if (category)
                fd.append('category', category);
            await documentsService.upload(fd);
            await load();
            setShowUpload(false);
            setFile(null);
            setMatterId('');
            setCategory('');
            toast.success('Document uploaded');
        }
        catch {
            toast.error('Upload failed');
        }
        finally {
            setUploading(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        try {
            await documentsService.delete(deleteId);
            setDocs(prev => prev.filter(d => d.id !== deleteId));
            setDeleteId(null);
            toast.success('Deleted');
        }
        catch {
            toast.error('Delete failed');
        }
    };
    const filtered = docs.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Documents" }), _jsxs("p", { className: "page-subtitle", children: [docs.length, " document", docs.length !== 1 ? 's' : ''] })] }), _jsxs("button", { onClick: () => setShowUpload(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " Upload"] })] }), _jsx(SearchInput, { value: search, onChange: setSearch, placeholder: "Search documents\u2026", className: "max-w-sm" }), _jsx("div", { className: "card", children: filtered.length === 0 ? _jsx(EmptyState, { icon: _jsx(FolderOpen, { size: 40 }), title: "No documents", action: _jsx("button", { onClick: () => setShowUpload(true), className: "btn-primary btn-sm", children: "Upload Document" }) }) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Matter" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Uploaded By" }), _jsx("th", { children: "Size" }), _jsx("th", { children: "Date" }), _jsx("th", {})] }) }), _jsx("tbody", { children: filtered.map(d => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: d.mimetype.includes('pdf') ? '📄' : d.mimetype.includes('image') ? '🖼️' : '📝' }), _jsx("span", { className: "text-slate-200 truncate max-w-[180px]", children: d.name })] }) }), _jsx("td", { className: "text-xs text-slate-400", children: d.matter?.matterNo || '—' }), _jsx("td", { children: _jsx("span", { className: "badge-gray", children: d.category || 'other' }) }), _jsx("td", { className: "text-slate-400", children: d.uploader?.name }), _jsx("td", { className: "text-xs text-slate-400", children: fmt.fileSize(d.size) }), _jsx("td", { className: "text-xs text-slate-400", children: fmt.date(d.createdAt) }), _jsx("td", { children: _jsxs("div", { className: "flex gap-1", children: [_jsx("a", { href: `/api/documents/${d.id}/download`, target: "_blank", rel: "noreferrer", className: "btn-ghost btn-sm p-1.5", children: _jsx(Download, { size: 14 }) }), _jsx("button", { onClick: () => setDeleteId(d.id), className: "btn-ghost btn-sm p-1.5 text-red-400", children: _jsx(Trash2, { size: 14 }) })] }) })] }, d.id))) })] }) })) }), _jsx(Modal, { open: showUpload, onClose: () => setShowUpload(false), title: "Upload Document", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowUpload(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "upload-form", type: "submit", className: "btn-primary", disabled: uploading || !file, children: uploading ? 'Uploading…' : 'Upload' })] }), children: _jsxs("form", { id: "upload-form", onSubmit: handleUpload, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "File *" }), _jsx("input", { type: "file", className: "input", onChange: e => setFile(e.target.files?.[0] || null), accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Matter (optional)" }), _jsxs("select", { className: "select", value: matterId, onChange: e => setMatterId(e.target.value), children: [_jsx("option", { value: "", children: "No matter" }), matters.map(m => _jsxs("option", { value: m.id, children: [m.matterNo, " \u2014 ", m.title] }, m.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Category" }), _jsxs("select", { className: "select", value: category, onChange: e => setCategory(e.target.value), children: [_jsx("option", { value: "", children: "Select\u2026" }), ['contract', 'court_filing', 'correspondence', 'evidence', 'other'].map(c => _jsx("option", { value: c, children: c.replace('_', ' ') }, c))] })] })] }) }), _jsx(ConfirmModal, { open: !!deleteId, title: "Delete Document", message: "Delete this document permanently?", danger: true, onConfirm: handleDelete, onClose: () => setDeleteId(null) })] }));
};
export default DocumentsPage;
