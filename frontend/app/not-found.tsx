import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container section">
      <div className="empty-state" style={{ marginTop: "4rem" }}>
        <i className="bi bi-cup-hot" aria-hidden="true" />
        <h3>Sayfa bulunamadı</h3>
        <p>Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
        <Link href="/" className="btn btn-tb-dark">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
