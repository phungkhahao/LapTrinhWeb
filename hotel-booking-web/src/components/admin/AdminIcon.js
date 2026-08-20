const paths = {
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  edit: "m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm10.6-12.6 3 3",
  check: "m5 12 4.5 4.5L19 7",
  close: "m6 6 12 12M18 6 6 18",
  money:
    "M12 3v18m4-14.5c-.6-1-1.9-1.5-4-1.5-2.5 0-4 1.2-4 3s1.5 3 4 3 4 1.2 4 3-1.5 3-4 3c-2.1 0-3.4-.5-4-1.5",
  pause: "M8 6v12m8-12v12",
  play: "m9 6 9 6-9 6Z",
};
function AdminIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={paths[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export default AdminIcon;
