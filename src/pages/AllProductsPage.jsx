import { useSearchParams } from 'react-router-dom';
import Shell from '../components/Shell';
import Catalog from '../components/Catalog';
import { CATEGORIES } from '../lib/format';

export default function AllProductsPage() {
  const [params, setParams] = useSearchParams();
  const c = params.get('c');
  const filter = CATEGORIES.some(cat => cat.key === c) ? c : 'all';

  function onFilter(key) {
    setParams(key === 'all' ? {} : { c: key }, { replace: true });
  }

  return (
    <Shell>
      <div className="page-pad">
        <Catalog title="All products" titleAs="h1" filter={filter} onFilter={onFilter} limit={false} />
      </div>
    </Shell>
  );
}
