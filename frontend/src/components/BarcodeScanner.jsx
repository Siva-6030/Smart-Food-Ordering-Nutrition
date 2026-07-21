import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";

// Uses html5-qrcode (add to package.json: "html5-qrcode": "^2.3.8")
// It reads the device camera and decodes 1D barcodes (EAN-13 etc.) client-side.
export default function BarcodeScanner({ open, onClose }) {
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setError("");

    let html5QrCode;
    import("html5-qrcode").then(({ Html5Qrcode }) => {
      html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          async (decodedText) => {
            await html5QrCode.stop();
            lookupBarcode(decodedText);
          },
          () => {} // ignore per-frame decode failures
        )
        .catch((err) => setError("Camera access denied or unavailable."));
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [open]);

  const lookupBarcode = async (barcode) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/nutrition/barcode/${barcode}`);
      setResult(data);
    } catch (err) {
      setError("No nutrition data found for this product.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl w-full max-w-sm p-5"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Scan packaged food</h3>
            <button onClick={onClose} className="text-gray-400">✕</button>
          </div>

          {!result && (
            <div id="barcode-reader" ref={containerRef} className="rounded-xl overflow-hidden bg-black/80 min-h-[200px]" />
          )}

          {loading && <p className="text-sm text-gray-500 mt-3">Looking up product...</p>}
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

          {result && (
            <div className="mt-2">
              <div className="flex gap-3 items-center">
                {result.imageUrl && (
                  <img src={result.imageUrl} alt={result.name} className="w-14 h-14 rounded-lg object-cover" />
                )}
                <div>
                  <div className="font-medium">{result.name}</div>
                  <div className="text-xs text-gray-500">{result.brand}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  ["Cal", result.nutrition?.calories],
                  ["Protein", `${result.nutrition?.protein_g}g`],
                  ["Carbs", `${result.nutrition?.carbs_g}g`],
                  ["Sugar", `${result.nutrition?.sugar_g}g`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-white/60 dark:bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-gray-500">{label}</div>
                    <div className="text-sm font-semibold">{val ?? "—"}</div>
                  </div>
                ))}
              </div>
              {result.allergens?.length > 0 && (
                <p className="text-xs text-red-500 mt-3">⚠ Contains: {result.allergens.join(", ")}</p>
              )}
              <button onClick={onClose} className="btn-primary w-full mt-4">Done</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
