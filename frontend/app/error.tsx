"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container section">
      <div className="empty-state" style={{ marginTop: "4rem" }}>
        <i className="bi bi-cloud-slash" aria-hidden="true" />
        <h3>Bir şeyler ters gitti</h3>
        <p>
          Mağazaya şu anda ulaşamıyoruz. İnternet bağlantınızı kontrol edip tekrar deneyin.
        </p>
        <button type="button" className="btn btn-tb-dark" onClick={() => reset()}>
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
