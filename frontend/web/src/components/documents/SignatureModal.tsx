import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { SignatureType, SignerRole } from '../../types/signature';
import { DEFAULT_SIGNATURE_CONSENT_ES } from '../../types/signature';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string, signatureType: SignatureType, role?: SignerRole) => Promise<void>;
  documentName: string;
}

export default function SignatureModal({
  isOpen,
  onClose,
  onSign,
  documentName,
}: SignatureModalProps) {
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn');
  const [typedSignature, setTypedSignature] = useState('');
  const [signerRole, setSignerRole] = useState<SignerRole>('buyer');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getSignatureData = (): string => {
    if (signatureType === 'drawn') {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');
      return canvas.toDataURL('image/png');
    } else if (signatureType === 'typed') {
      // Create a canvas with typed text
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '36px "Brush Script MT", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      }
      return canvas.toDataURL('image/png');
    }
    throw new Error('Invalid signature type');
  };

  const handleSign = async () => {
    if (!consentGiven) {
      alert('Debes aceptar los términos para firmar');
      return;
    }

    if (signatureType === 'typed' && !typedSignature.trim()) {
      alert('Por favor escribe tu firma');
      return;
    }

    try {
      setLoading(true);
      const signatureData = getSignatureData();
      await onSign(signatureData, signatureType, signerRole);
      onClose();
    } catch (error) {
      console.error('Error signing document:', error);
      alert('Error al firmar documento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Firmar Documento
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Document Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Documento:</span> {documentName}
              </p>
            </div>

            {/* Signature Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Firma
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSignatureType('drawn')}
                  className={`px-4 py-2 rounded-md border ${
                    signatureType === 'drawn'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Dibujar
                </button>
                <button
                  onClick={() => setSignatureType('typed')}
                  className={`px-4 py-2 rounded-md border ${
                    signatureType === 'typed'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Escribir
                </button>
              </div>
            </div>

            {/* Signer Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu Rol
              </label>
              <select
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value as SignerRole)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
                <option value="agent">Agente</option>
                <option value="witness">Testigo</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Signature Area */}
            {signatureType === 'drawn' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dibuja tu Firma
                </label>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button
                  onClick={clearCanvas}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe tu Nombre Completo
                </label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-2xl font-serif"
                  style={{ fontFamily: '"Brush Script MT", cursive' }}
                />
              </div>
            )}

            {/* Legal Consent */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="max-h-32 overflow-y-auto mb-3">
                <p className="text-xs text-gray-700 whitespace-pre-line">
                  {DEFAULT_SIGNATURE_CONSENT_ES}
                </p>
              </div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Acepto los términos y condiciones de la firma electrónica
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSign}
              disabled={!consentGiven || loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Firmando...' : 'Firmar Documento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
