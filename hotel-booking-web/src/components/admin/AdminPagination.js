function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total === 0) return null;
  const { current_page: current, last_page: last, per_page: perPage, total } = pagination;
  const start = (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, total);
  const pages = Array.from({ length: last }, (_, index) => index + 1).filter((page) => page === 1 || page === last || Math.abs(page - current) <= 1);
  return <nav className="admin-pagination" aria-label="Phân trang"><span>Hiển thị {start} - {end} / {total} kết quả</span><div><button type="button" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>←</button>{pages.map((page, index) => <span key={page}>{index > 0 && pages[index - 1] !== page - 1 && <i>…</i>}<button type="button" className={page === current ? 'is-current' : ''} onClick={() => onPageChange(page)}>{page}</button></span>)}<button type="button" disabled={current >= last} onClick={() => onPageChange(current + 1)}>→</button></div></nav>;
}
export default AdminPagination;
