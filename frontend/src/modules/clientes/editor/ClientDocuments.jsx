/**
 * Archivo: frontend/src/modules/clientes/editor/ClientDocuments.jsx
 * Actualización: 2026-09-08 — módulo de documentos profesional con contratos, PDFs y notas.
 * Función: gestiona contratos, documentos PDF y notas vinculados al cliente.
 * Recibe: api, token, clientId, client desde ClientDetail.jsx.
 * Entrega: documentos guardados en backend y actualizados en pantalla.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Plus, X, AlertCircle, Loader, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ClientDocuments({ api, token, clientId, client }) {
  const [documents, setDocuments] = useState({ contracts: [], pdfs: [], notes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal Contrato
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    title: "",
    external_number: "",
    start_date: "",
    end_date: "",
    duration_months: 12,
    template: "CONTRATO",
    status: "Esperando Aprobación del cliente",
    show_to_client: false,
    show_logo: false
  });
  const [contractSaving, setContractSaving] = useState(false);

  // Modal PDF
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfForm, setPdfForm] = useState({
    title: "",
    description: "",
    file: null
  });
  const [pdfSaving, setPdfSaving] = useState(false);

  // Notas
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  // Cargar documentos
  const loadDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${api}/clients/${clientId}/documents`, { headers });
      setDocuments(res.data || { contracts: [], pdfs: [], notes: [] });
    } catch (err) {
      setError("No se pudo cargar los documentos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [clientId]);

  // Crear contrato
  const handleSaveContract = async (e) => {
    e.preventDefault();
    if (!contractForm.title.trim()) {
      toast.error("Ingresa el título del contrato");
      return;
    }
    if (!contractForm.start_date) {
      toast.error("Selecciona fecha de inicio");
      return;
    }

    setContractSaving(true);
    try {
      await axios.post(
        `${api}/clients/${clientId}/documents/contracts`,
        contractForm,
        { headers }
      );
      toast.success("Contrato creado correctamente");
      setShowContractModal(false);
      setContractForm({
        title: "",
        external_number: "",
        start_date: "",
        end_date: "",
        duration_months: 12,
        template: "CONTRATO",
        status: "Esperando Aprobación del cliente",
        show_to_client: false,
        show_logo: false
      });
      loadDocuments();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear contrato");
    } finally {
      setContractSaving(false);
    }
  };

  // Crear PDF
  const handleSavePdf = async (e) => {
    e.preventDefault();
    if (!pdfForm.title.trim()) {
      toast.error("Ingresa el título del documento");
      return;
    }
    if (!pdfForm.file) {
      toast.error("Selecciona un archivo PDF");
      return;
    }

    setPdfSaving(true);
    const formData = new FormData();
    formData.append("title", pdfForm.title);
    formData.append("description", pdfForm.description);
    formData.append("file", pdfForm.file);

    try {
      await axios.post(
        `${api}/clients/${clientId}/documents/pdfs`,
        formData,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );
      toast.success("Documento PDF guardado correctamente");
      setShowPdfModal(false);
      setPdfForm({ title: "", description: "", file: null });
      loadDocuments();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar PDF");
    } finally {
      setPdfSaving(false);
    }
  };

  // Guardar nota
  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast.error("Escribe una nota");
      return;
    }

    setNoteSaving(true);
    try {
      await axios.post(
        `${api}/clients/${clientId}/documents/notes`,
        { content: noteText },
        { headers }
      );
      toast.success("Nota guardada correctamente");
      setNoteText("");
      loadDocuments();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar nota");
    } finally {
      setNoteSaving(false);
    }
  };

  const contracts = documents.contracts || [];
  const pdfs = documents.pdfs || [];
  const notes = documents.notes || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Contratos */}
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <FileText className="h-5 w-5 text-amber-400" /> Contratos
          </h3>
          <button
            onClick={() => setShowContractModal(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo Contrato
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Loader className="w-4 h-4 animate-spin inline" /> Cargando...
          </div>
        ) : contracts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
            <p className="text-sm text-slate-400">Ningún contrato disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-semibold">N°</th>
                  <th className="px-3 py-2 font-semibold">Nº Externo</th>
                  <th className="px-3 py-2 font-semibold">Título</th>
                  <th className="px-3 py-2 font-semibold">Inicio</th>
                  <th className="px-3 py-2 font-semibold">Finaliza</th>
                  <th className="px-3 py-2 font-semibold">Duración</th>
                  <th className="px-3 py-2 font-semibold">Firmado</th>
                  <th className="px-3 py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-mono text-cyan-300">{contract.number}</td>
                    <td className="px-3 py-2 text-slate-300">{contract.external_number || "—"}</td>
                    <td className="px-3 py-2 text-slate-200 font-medium">{contract.title}</td>
                    <td className="px-3 py-2 text-slate-400">{contract.start_date}</td>
                    <td className="px-3 py-2 text-slate-400">{contract.end_date || "—"}</td>
                    <td className="px-3 py-2 text-slate-400">{contract.duration_months} meses</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        contract.is_signed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"
                      }`}>
                        {contract.is_signed ? "✓ Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
                        {contract.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Documentos PDF */}
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <FileText className="h-5 w-5 text-red-400" /> Documentos PDF
          </h3>
          <button
            onClick={() => setShowPdfModal(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo Documento
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Loader className="w-4 h-4 animate-spin inline" /> Cargando...
          </div>
        ) : pdfs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
            <p className="text-sm text-slate-400">Sin documentos PDF registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/30 p-3 hover:bg-slate-800/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{pdf.title}</p>
                  {pdf.description && <p className="text-xs text-slate-400 mt-1">{pdf.description}</p>}
                  <p className="text-xs text-slate-500 mt-1">
                    {pdf.created_by} • {new Date(pdf.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={pdf.file_url}
                    download
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notas */}
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <FileText className="h-5 w-5 text-emerald-400" /> Notas
          </h3>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escribe una nota sobre el cliente..."
              rows="4"
              maxLength="1000"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              {noteText.length} / 1000 caracteres
            </p>
          </div>
          <button
            onClick={handleSaveNote}
            disabled={noteSaving || !noteText.trim()}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded flex items-center justify-center gap-2 transition"
          >
            {noteSaving ? <Loader className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Agregar Nota
          </button>
        </div>

        {notes.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-700 pt-4">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
                <p className="text-sm text-slate-200">{note.content}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {note.created_by} • {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Nuevo Contrato */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" /> Nuevo Contrato
              </h3>
              <button onClick={() => setShowContractModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título *</label>
                  <input
                    type="text"
                    value={contractForm.title}
                    onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                    placeholder="Contrato 2025"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nº Externo</label>
                  <input
                    type="text"
                    value={contractForm.external_number}
                    onChange={(e) => setContractForm({ ...contractForm, external_number: e.target.value })}
                    placeholder="A completar por cliente"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={contractForm.start_date}
                    onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Final</label>
                  <input
                    type="date"
                    value={contractForm.end_date}
                    onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duración (meses)</label>
                  <select
                    value={contractForm.duration_months}
                    onChange={(e) => setContractForm({ ...contractForm, duration_months: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="1">1 Mes</option>
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12">12 Meses</option>
                    <option value="24">24 Meses</option>
                    <option value="36">36 Meses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plantilla</label>
                  <select
                    value={contractForm.template}
                    onChange={(e) => setContractForm({ ...contractForm, template: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="CONTRATO">Contrato Estándar</option>
                    <option value="ADDENDUM">Addendum</option>
                    <option value="ACTA">Acta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                <select
                  value={contractForm.status}
                  onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Esperando Aprobación del cliente">Esperando Aprobación del cliente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="En revisión">En revisión</option>
                </select>
              </div>

              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contractForm.show_to_client}
                    onChange={(e) => setContractForm({ ...contractForm, show_to_client: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                  />
                  Mostrar al cliente
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contractForm.show_logo}
                    onChange={(e) => setContractForm({ ...contractForm, show_logo: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                  />
                  Mostrar logo
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={contractSaving}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded flex items-center gap-2"
                >
                  {contractSaving ? <Loader className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Generar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo PDF */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-400" /> Nuevo Documento
              </h3>
              <button onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePdf} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Archivo (PDF) *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfForm({ ...pdfForm, file: e.target.files?.[0] || null })}
                    className="hidden"
                    id="pdf-file"
                    required
                  />
                  <label
                    htmlFor="pdf-file"
                    className="block px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 cursor-pointer hover:bg-slate-700 transition text-center"
                  >
                    {pdfForm.file ? pdfForm.file.name : "Seleccionar archivo"}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título *</label>
                <input
                  type="text"
                  value={pdfForm.title}
                  onChange={(e) => setPdfForm({ ...pdfForm, title: e.target.value })}
                  placeholder="Contrato Internet"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción</label>
                <textarea
                  value={pdfForm.description}
                  onChange={(e) => setPdfForm({ ...pdfForm, description: e.target.value })}
                  placeholder="Documento cliente"
                  rows="3"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pdfSaving}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded flex items-center gap-2"
                >
                  {pdfSaving ? <Loader className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
