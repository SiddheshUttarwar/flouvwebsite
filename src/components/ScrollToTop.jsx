import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation like a normal
// page load would — without this, landing on a new page keeps whatever
// scroll offset the previous page was at (e.g. its footer). Keyed on
// pathname only (not the full location), so switching tabs via a search
// param (Industries' ?tab=, Answer's ?q=) doesn't yank the user back to the
// top of a page they're already on.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
