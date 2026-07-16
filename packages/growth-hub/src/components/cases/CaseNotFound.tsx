
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CaseNotFound = () => {
  return (
    <div className="container-custom py-32">
      <h1 className="text-3xl font-bold">Case não encontrado</h1>
      <p className="mt-4">O case que você está procurando não existe ou foi removido.</p>
      <Button asChild className="mt-8">
        <Link to="/cases">Voltar para cases</Link>
      </Button>
    </div>
  );
};

export default CaseNotFound;
