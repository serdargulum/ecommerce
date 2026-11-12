"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch } from "@/lib/api";
import { PAYMENT_METHOD_ICONS } from "@/lib/order-status";
import type { PaymentMethodInfo } from "@/lib/types";

interface Draft {
  isActive: boolean;
  bankName: string;
  iban: string;
  accountHolder: string;
  instructions: string;
}

function toDraft(method: PaymentMethodInfo): Draft {
  return {
    isActive: method.isActive,
    bankName: method.bankName ?? "",
    iban: method.iban ?? "",
    accountHolder: method.accountHolder ?? "",
    instructions: method.instructions ?? "",
  };
}

export default function AdminPaymentSettingsPage() {
  const token = useAdminToken();
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingMethod, setSavingMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch<PaymentMethodInfo[]>("/api/admin/payment-methods", { token })
      .then((result) => {
        setMethods(result);
        setDrafts(Object.fromEntries(result.map((method) => [method.method, toDraft(method)])));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Ödeme ayarları yüklenemedi."))
      .finally(() => setLoading(false));
  }, [token]);

  const updateDraft = (method: string, field: keyof Draft, value: string | boolean) =>
    setDrafts((current) => ({
      ...current,
      [method]: { ...current[method], [field]: value },
    }));

  const save = async (method: PaymentMethodInfo) => {
    if (!token) {
      return;
    }
    const draft = drafts[method.method];
    setSavingMethod(method.method);
    setError(null);
    setSuccess(null);

    if (draft.isActive && method.method === "BankTransfer" && !draft.iban.trim()) {
      setError("Havale yöntemi aktifken IBAN bilgisi girilmelidir.");
      setSavingMethod(null);
      return;
    }

    try {
      const result = await apiFetch<PaymentMethodInfo>(
        `/api/admin/payment-methods/${method.method}`,
        {
          method: "PUT",
          token,
          body: {
            isActive: draft.isActive,
            bankName: draft.bankName,
            iban: draft.iban,
            accountHolder: draft.accountHolder,
            instructions: draft.instructions,
          },
        },
      );
      setMethods((current) => current.map((item) => (item.method === result.method ? result : item)));
      setDrafts((current) => ({ ...current, [result.method]: toDraft(result) }));
      setSuccess(`${result.name} ayarları kaydedildi.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ayarlar kaydedilemedi.");
    } finally {
      setSavingMethod(null);
    }
  };

  if (loading) {
    return <div className="admin-card text-center text-muted py-5">Yükleniyor...</div>;
  }

  return (
    <>
      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert alert-success py-2 small" role="status">
          {success}
        </div>
      ) : null}

      <div className="alert alert-warning small d-flex gap-2" role="note">
        <i className="bi bi-info-circle mt-1" aria-hidden="true" />
        <div>
          <strong>Kredi kartı altyapısı hazır, sanal POS bağlı değil.</strong> Kredi kartı seçilen
          siparişler ödeme alınmadan kaydedilir; ödeme durumu yönetim panelinden güncellenir. Sanal
          POS sağlayıcısı bağlandığında ödeme akışı sunucu tarafında tamamlanacaktır.
        </div>
      </div>

      <div className="row g-3">
        {methods.map((method) => {
          const draft = drafts[method.method] ?? toDraft(method);
          const isBank = method.method === "BankTransfer";

          return (
            <div className="col-xl-6" key={method.method}>
              <div className="admin-card h-100">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${PAYMENT_METHOD_ICONS[method.method]}`} aria-hidden="true" />
                      <span className="fw-semibold">{method.name}</span>
                    </div>
                    <p className="small text-muted mt-1 mb-0">{method.description}</p>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`switch-${method.method}`}
                      checked={draft.isActive}
                      onChange={(event) => updateDraft(method.method, "isActive", event.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor={`switch-${method.method}`}>
                      {draft.isActive ? "Aktif" : "Pasif"}
                    </label>
                  </div>
                </div>

                {isBank ? (
                  <div className="row g-2 mt-2">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor={`bank-${method.method}`}>
                        Banka
                      </label>
                      <input
                        id={`bank-${method.method}`}
                        className="form-control"
                        value={draft.bankName}
                        onChange={(event) => updateDraft(method.method, "bankName", event.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor={`holder-${method.method}`}>
                        Hesap sahibi
                      </label>
                      <input
                        id={`holder-${method.method}`}
                        className="form-control"
                        value={draft.accountHolder}
                        onChange={(event) =>
                          updateDraft(method.method, "accountHolder", event.target.value)
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor={`iban-${method.method}`}>
                        IBAN
                      </label>
                      <input
                        id={`iban-${method.method}`}
                        className="form-control"
                        value={draft.iban}
                        onChange={(event) => updateDraft(method.method, "iban", event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-2">
                  <label className="form-label" htmlFor={`instructions-${method.method}`}>
                    Müşteriye gösterilecek açıklama
                  </label>
                  <textarea
                    id={`instructions-${method.method}`}
                    className="form-control"
                    rows={3}
                    value={draft.instructions}
                    onChange={(event) =>
                      updateDraft(method.method, "instructions", event.target.value)
                    }
                  />
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn admin-btn admin-btn-dark"
                    disabled={savingMethod === method.method}
                    onClick={() => void save(method)}
                  >
                    {savingMethod === method.method ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
