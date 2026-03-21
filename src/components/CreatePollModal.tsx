"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder} from "framer-motion";
import { X, Plus, GripVertical, Loader2, AlertCircle } from "lucide-react";
import { useCreatePoll } from "@/hooks/useCreatePoll";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePollModal({
  isOpen,
  onClose,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [closedAt, setClosedAt] = useState("");
  const [options, setOptions] = useState([
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const { mutate: createPoll, isPending, isError, error, reset } = useCreatePoll();

  const addOption = () => {
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
  };

  const updateOption = (id: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
    setDuplicateError(null);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
    setDuplicateError(null);
  };

  const checkDuplicates = useCallback((): boolean => {
    const texts = options.map((o) => o.text.trim().toLowerCase()).filter(Boolean);
    const unique = new Set(texts);
    if (unique.size !== texts.length) {
      setDuplicateError("Each option must be unique. Remove duplicate entries.");
      return true;
    }
    setDuplicateError(null);
    return false;
  }, [options]);

  const resetForm = () => {
    setQuestion("");
    setNotes("");
    setClosedAt("");
    setOptions([
      { id: crypto.randomUUID(), text: "" },
      { id: crypto.randomUUID(), text: "" },
    ]);
    setDuplicateError(null);
    reset();
  };

  const handleClose = () => {
    if (isPending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkDuplicates()) return;

    const filteredOptions = options
      .map((o) => o.text.trim())
      .filter(Boolean);

    if (filteredOptions.length < 2) return;

    createPoll(
      {
        poll: {
          question,
          notes,
          closedAt: new Date(closedAt).toISOString(),
        },
        options: filteredOptions,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      }
    );
  };

  // Check if a specific option is a duplicate
  const isDuplicate = (id: string) => {
    const current = options.find((o) => o.id === id);
    if (!current || !current.text.trim()) return false;
    return (
      options.filter(
        (o) =>
          o.id !== id &&
          o.text.trim().toLowerCase() === current.text.trim().toLowerCase()
      ).length > 0
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 shrink-0">
                <h2 className="text-lg font-bold text-white">
                  Create a new poll
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <form
                onSubmit={handleSubmit}
                className="px-6 py-5 space-y-5 overflow-y-auto"
              >
                {/* API Error */}
                {isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {(
                        error as Error & {
                          response?: { data?: { message?: string } };
                        }
                      )?.response?.data?.message ??
                        error?.message ??
                        "Failed to create poll. Please try again."}
                    </span>
                  </motion.div>
                )}

                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Poll question
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What do you want to ask?"
                    className="w-full rounded-lg bg-zinc-800/70 border border-zinc-700/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50"
                    required
                    disabled={isPending}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Notes{" "}
                    <span className="text-zinc-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add some context to your poll…"
                    rows={2}
                    className="w-full rounded-lg bg-zinc-800/70 border border-zinc-700/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 resize-none"
                    disabled={isPending}
                  />
                </div>

                {/* Closes at */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Closes at
                  </label>
                  <input
                    type="datetime-local"
                    value={closedAt}
                    onChange={(e) => setClosedAt(e.target.value)}
                    className="w-full rounded-lg bg-zinc-800/70 border border-zinc-700/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 [color-scheme:dark]"
                    required
                    disabled={isPending}
                  />
                </div>

                {/* Options — Draggable */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Options
                  </label>

                  {/* Duplicate warning */}
                  {duplicateError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-amber-400 mb-2 flex items-center gap-1.5"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {duplicateError}
                    </motion.p>
                  )}

                  <Reorder.Group
                    axis="y"
                    values={options}
                    onReorder={setOptions}
                    className="space-y-2"
                  >
                    {options.map((opt) => (
                      <Reorder.Item
                        key={opt.id}
                        value={opt}
                        className="flex items-center gap-2"
                      >
                        {/* Drag handle */}
                        <div className="cursor-grab active:cursor-grabbing p-1 text-zinc-600 hover:text-zinc-400 transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(opt.id, e.target.value)}
                          placeholder={`Option ${options.indexOf(opt) + 1}`}
                          className={`flex-1 rounded-lg bg-zinc-800/70 border px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/50 ${
                            isDuplicate(opt.id)
                              ? "border-amber-500/60"
                              : "border-zinc-700/60"
                          }`}
                          required
                          disabled={isPending}
                        />

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(opt.id)}
                            disabled={isPending}
                            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  <button
                    type="button"
                    onClick={addOption}
                    disabled={isPending}
                    className="mt-3 flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add option
                  </button>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create poll"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
