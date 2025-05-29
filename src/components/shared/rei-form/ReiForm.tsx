
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ReiFormData } from './types';
import BasicInfoSection from './BasicInfoSection';
import ProductSection from './ProductSection';
import ProblemSection from './ProblemSection';
import CustomerSection from './CustomerSection';
import MarketSection from './MarketSection';
import SalesSection from './SalesSection';
import ResourcesSection from './ResourcesSection';

const ReiForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<ReiFormData>({
    name: '',
    role: '',
    email: '',
    whatsapp: '',
    companyName: '',
    companySite: '',
    sector: '',
    expectedResults: '',
    solution: '',
    hasPlans: '',
    advantages: '',
    targetAudience: '',
    idealCustomerProfiles: '',
    demographicProfile: '',
    recurringProblems: '',
    customerPains: '',
    consequencesOfNotBuying: '',
    emotionalResponses: '',
    savesTimeOrMoney: '',
    whereCustomersSearch: '',
    problemCauses: '',
    customerLocations: '',
    keywords: '',
    challenges: '',
    differentiation: '',
    competitors: '',
    marketTrends: '',
    salesChannels: '',
    marketingTools: '',
    monthlyAdBudget: '',
    adScheduleRestrictions: '',
    adRegions: '',
    previousStrategies: '',
    salesCycle: '',
    leadNurturing: '',
    decisionFactors: '',
    growthStrategies: '',
    marketingMaterials: '',
    kpis: '',
    limitations: '',
    approvalProcess: ''
  });

  const sections = [
    { title: 'Informações Básicas', component: BasicInfoSection },
    { title: 'Produto e Expectativas', component: ProductSection },
    { title: 'Problemas e Dores', component: ProblemSection },
    { title: 'Comportamento do Cliente', component: CustomerSection },
    { title: 'Mercado e Concorrência', component: MarketSection },
    { title: 'Vendas e Marketing', component: SalesSection },
    { title: 'Recursos e Processos', component: ResourcesSection }
  ];

  const handleInputChange = (name: keyof ReiFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual webhook URL
      const webhookUrl = 'https://services.leadconnectorhq.com/hooks/876Ucnr8qm6lnMFORzxG/webhook-trigger/c1bf102a-58dc-4e48-b23a-647f9f08dbb6';
      
      if (!webhookUrl) {
        toast({
          title: 'Configuração Pendente',
          description: 'O webhook ainda não foi configurado. Dados salvos localmente.',
          variant: 'default'
        });
        console.log('Form data:', formData);
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Suas respostas foram enviadas com sucesso.',
        });
        // Reset form or redirect
      } else {
        throw new Error('Erro ao enviar formulário');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar o formulário. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentSection = sections[currentSection].component;
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <Card className="max-w-4xl mx-auto bg-black border border-white/10 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          REI - Revenue Excellence Initiative
        </h2>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
          <div 
            className="bg-revgreen h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-300">
          Seção {currentSection + 1} de {sections.length}: {sections[currentSection].title}
        </p>
      </div>

      <CurrentSection 
        formData={formData} 
        onChange={handleInputChange}
      />

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentSection === 0}
          className="px-8"
        >
          Anterior
        </Button>

        {currentSection < sections.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="px-8"
          >
            Próximo
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ReiForm;
