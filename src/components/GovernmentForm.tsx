import React from 'react';
import { PatientRecord, HospitalSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedDistrictName, getLocalizedMunicipalityName } from '../utils/nepal-utils';

interface GovernmentFormProps {
  record: Partial<PatientRecord>;
  hospitalSettings: HospitalSettings;
}

export default function GovernmentForm({ record, hospitalSettings }: GovernmentFormProps) {
  const { formatNumber } = useLanguage();

  // Helper to split date into Year, Month, Day
  const getSplitDate = (dateStr?: string) => {
    if (!dateStr) return { y: '..........', m: '.......', d: '.......' };
    const parts = dateStr.split('/');
    if (parts.length !== 3) return { y: '..........', m: '.......', d: '.......' };
    return {
      y: formatNumber(parts[0]),
      m: formatNumber(parts[1]),
      d: formatNumber(parts[2])
    };
  };

  const issueDate = getSplitDate(record.issueDateBS);
  const dialysisDate = getSplitDate(record.dialysisStartDateBS);

  const hospitalNameNe = hospitalSettings.nameNe || 
    (hospitalSettings.name === 'Kathmandu Medical College Public Limited' 
      ? 'काठमाडौं मेडिकल कलेज पब्लिक लिमिटेड' 
      : hospitalSettings.name);

  const Underline = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`border-b border-dotted border-black px-2 font-bold min-w-[40px] inline-block text-center ${className}`}>
      {children}
    </span>
  );

  return (
    <div className="gov-form-container bg-white">
      {/* Page 1: अनुसूची–१ */}
      <div className="gov-form-page relative p-[20mm] text-black font-sans leading-[2] text-[15px] certificate-root" style={{ width: '210mm', pageBreakAfter: 'always' }}>
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">अनुसूची–१</h1>
          <p className="text-lg">(दफा ३ सँग सम्बन्धित)</p>
          <h2 className="text-lg font-bold mt-4 underline decoration-1 underline-offset-4">
            चिकित्सकले मृगौला प्रत्यारोपण गरेको/डायलाइसिस गराइरहेको/ क्यान्सर रोग / मेरुदण्ड पक्षघात भएको प्रमाणित गर्ने ढाँचा
          </h2>
        </div>

        <div className="flex justify-end mb-8">
          <p>मिति: <Underline className="min-w-[150px]">{record.issueDateBS ? formatNumber(record.issueDateBS) : '................................'}</Underline></p>
        </div>

        <div className="mb-8">
          <p>श्री <Underline className="min-w-[200px]">{getLocalizedMunicipalityName(record.district || '', record.municipality || '', 'ne')}</Underline> गाउँपालिका /नगरपालिका/ उपमहानगरपालिका/ महानगरपालिका</p>
          <p><Underline className="min-w-[250px]">{getLocalizedDistrictName(record.district || '', 'ne')}</Underline> ।</p>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-bold">विषय : प्रमाणित गरिएको सम्बन्धमा</h3>
        </div>

        <div className="text-justify mb-12">
          <p>
            उपरोक्त विषयमा <Underline className="min-w-[120px]">{getLocalizedMunicipalityName(record.district || '', record.municipality || '', 'ne')}</Underline> गाउँपालिका/नगरपालिका/उपमहानगरपालिका/महानगरपालिका <Underline className="min-w-[40px]">{record.wardNo ? formatNumber(record.wardNo) : '....'}</Underline> वडा नं <Underline className="min-w-[100px]">{record.tole || '........'}</Underline> गाउँ/टोल स्थायी ठेगाना भएको उमेर <Underline className="min-w-[50px]">{record.age ? formatNumber(record.age) : '........'}</Underline> वर्षको <Underline className="min-w-[150px]">{record.nagritaNumber ? formatNumber(record.nagritaNumber) : '................'}</Underline> राष्ट्रिय परिचयपत्र नं/नागरिकता प्रमाणपत्र नं / जन्मदर्ता प्रमाणपत्र नं (१६ वर्ष भन्दा कम उमेरको हकमा) <Underline className="min-w-[100px]">{record.patientPhone ? formatNumber(record.patientPhone) : '............'}</Underline> सम्पर्क नं भएको श्री <Underline className="min-w-[180px]">{record.patientName || '....................'}</Underline> को <Underline className="min-w-[60px]">{dialysisDate.y}</Underline> साल <Underline className="min-w-[50px]">{dialysisDate.m}</Underline> महिना <Underline className="min-w-[50px]">{dialysisDate.d}</Underline> गते श्री <Underline className="min-w-[200px]">{hospitalNameNe}</Underline> अस्पतालमा मृगौला प्रत्यारोपण गरेको/डायलाइसिस गराइरहेको/क्यान्सर रोग निदान भएको/ मेरुदण्ड पक्षघात निदान भएको भनी अस्पतालहरुको पुर्जी/ कागजातहरुको विवरण जाँच बुझ गरी प्रमाणित गर्दछु।
          </p>
        </div>

        <div className="mt-20 space-y-4">
          <p>प्रमाणित गर्ने चिकित्सकको</p>
          <div className="pl-4 space-y-2">
            <p>दस्तखत: .............................</p>
            <p>पुरा नाम थर: <span className="font-bold">{record.doctorName || '................................'}</span></p>
            <p>दर्जा : <span className="font-bold">{record.doctorDesignation || '................................'}</span></p>
            <p className="font-bold">नेपाल मेडिकल काउन्सिल नं: {record.doctorNmc ? formatNumber(record.doctorNmc) : '................................'}</p>
            <p>संस्थाको छाप:</p>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 text-sm">
          ४
        </div>
      </div>

      {/* Page 2: अनुसूची–२ (Blank) */}
      <div className="gov-form-page relative p-[20mm] text-black font-sans leading-[2.2] text-[15px] certificate-root" style={{ width: '210mm' }}>
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">अनुसूची–२</h1>
          <p className="text-lg">(दफा ३ सँग सम्बन्धित)</p>
          <h2 className="text-lg font-bold mt-4 underline decoration-1 underline-offset-4">
            औषधि उपचार बापत खर्च पाउनका लागि दिने निवेदनको ढाँचा
          </h2>
        </div>

        <div className="flex justify-end mb-8">
          <p>मिति: ...........................</p>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-bold">विषय: औषधि उपचार बापत खर्च पाउँ भन्ने सम्बन्धमा।</h3>
        </div>

        <div className="mb-8">
          <p>श्री वडाअध्यक्षज्यू,</p>
          <p>वडा नं......................, ................... गाउँपालिका/नगरपालिका/उपमहानगरपालिका/महानगरपालिका</p>
          <p>जिल्ला..................., प्रदेश......................</p>
        </div>

        <div className="text-justify mb-12">
          <p>
            उपरोक्त सम्बन्धमा ................गाउँपालिका /नगरपालिका/ उपमहानगरपालिका/ महानगरपालिका................वडा नं...........गाउँ/टोल स्थायी ठेगाना भएको उमेर............वर्षको ..........राष्ट्रिय परिचयपत्र नं/नागरिकता प्रमाणपत्र नं / जन्मदर्ता प्रमाणपत्र नं (१६ वर्ष भन्दा कम उमेरको हकमा) ............सम्पर्क नं भएको म ...................... मृगौला प्रत्यारोपण गरेको/ डायलाइसिस गराइरहेको/क्यान्सर रोग निदान भएको/ मेरुदण्ड पक्षघात निदान भएको व्यक्ति भएकोले सम्पूर्ण आवश्यक कागजात सहित औषधि उपचार बापत मासिक पाँच हजार रुपैयाँका दरले खर्च पाउँ भनि निवेदन पेश गरेको छु। पेश भएको व्यहोरा ठीक साँचो हो, झुठ्ठा ठहरे प्रचलित कानून बमोजिम सहूँला बुझाउँला।
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <p className="font-bold underline">निवेदक:</p>
          <div className="pl-4 space-y-3">
            <p>हस्ताक्षर.............................</p>
            <p>नाम थरः................................................................लिङ्ग:............................</p>
            <p>राष्ट्रिय परिचयपत्र नं/नागरिकता नं/जन्मदर्ता प्रमाणपत्र नं.:.......................................</p>
            <p>बैंकखाता नं..................................................................................................</p>
            <p>बैंकको नाम: ............................................शाखा:............................................</p>
            <p>सम्पर्क मोबाइल नं.:.................................................</p>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 text-sm">
          ५
        </div>
      </div>
    </div>
  );
}
