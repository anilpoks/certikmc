import { District, Doctor } from '../types';

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Assoc. Prof. Dr. ANIL POKHREL',
    designation: 'Consultant Nephrologist',
    qualifications: 'MBBS, MD, DM (Nephrology)',
    nmcNumber: '3112',
    department: 'Department of Nephrology'
  },
  {
    id: '2',
    name: 'Dr. BINOD SHRESTHA',
    designation: 'Consultant Nephrologist',
    qualifications: 'MD, DM Nephrology',
    nmcNumber: '4567',
    department: 'Department of Nephrology'
  }
];

export const DISTRICTS: District[] = [
  {
    name: 'Kathmandu',
    nameNe: 'काठमाडौं',
    municipalities: [
      { name: 'Kathmandu Metropolitan City', nameNe: 'काठमाडौं महानगरपालिका' },
      { name: 'Kirtipur Municipality', nameNe: 'कीर्तिपुर नगरपालिका' },
      { name: 'Budhanilkantha Municipality', nameNe: 'बूढानीलकण्ठ नगरपालिका' },
      { name: 'Tarakeshwar Municipality', nameNe: 'तारकेश्वर नगरपालिका' },
      { name: 'Gokarneshwar Municipality', nameNe: 'गोकर्णेश्वर नगरपालिका' },
      { name: 'Tokha Municipality', nameNe: 'टोखा नगरपालिका' },
      { name: 'Nagarjun Municipality', nameNe: 'नागार्जुन नगरपालिका' },
      { name: 'Chandragiri Municipality', nameNe: 'चन्द्रागिरी नगरपालिका' },
      { name: 'Kageshwari Manohara Municipality', nameNe: 'कागेश्वरी मनोहरा नगरपालिका' },
      { name: 'Shankharapur Municipality', nameNe: 'शङ्खरापुर नगरपालिका' },
      { name: 'Dakshinkali Municipality', nameNe: 'दक्षिणकाली नगरपालिका' }
    ]
  },
  {
    name: 'Lalitpur',
    nameNe: 'ललितपुर',
    municipalities: [
      { name: 'Lalitpur Metropolitan City', nameNe: 'ललितपुर महानगरपालिका' },
      { name: 'Mahalaxmi Municipality', nameNe: 'महालक्ष्मी नगरपालिका' },
      { name: 'Godawari Municipality', nameNe: 'गोदावरी नगरपालिका' },
      { name: 'Konjyosom Rural Municipality', nameNe: 'कोन्ज्योसोम गाउँपालिका' },
      { name: 'Bagmati Rural Municipality', nameNe: 'बागमती गाउँपालिका' },
      { name: 'Mahankal Rural Municipality', nameNe: 'महाङ्काल गाउँपालिका' }
    ]
  },
  {
    name: 'Bhaktapur',
    nameNe: 'भक्तपुर',
    municipalities: [
      { name: 'Bhaktapur Municipality', nameNe: 'भक्तपुर नगरपालिका' },
      { name: 'Madhyapur Thimi Municipality', nameNe: 'मध्यपुर थिमी नगरपालिका' },
      { name: 'Suryabinayak Municipality', nameNe: 'सूर्यविनायक नगरपालिका' },
      { name: 'Changunarayan Municipality', nameNe: 'चाँगुनारायण नगरपालिका' }
    ]
  },
  {
    name: 'Chitwan',
    nameNe: 'चितवन',
    municipalities: [
      { name: 'Bharatpur Metropolitan City', nameNe: 'भरतपुर महानगरपालिका' },
      { name: 'Ratnanagar Municipality', nameNe: 'रत्ननगर नगरपालिका' },
      { name: 'Khairahani Municipality', nameNe: 'खैरहनी नगरपालिका' },
      { name: 'Rapti Municipality', nameNe: 'राप्ती नगरपालिका' },
      { name: 'Kalika Municipality', nameNe: 'कालिका नगरपालिका' },
      { name: 'Madi Municipality', nameNe: 'माडी नगरपालिका' },
      { name: 'Icchyakamana Rural Municipality', nameNe: 'इच्छाकामना गाउँपालिका' }
    ]
  },
  {
    name: 'Kaski',
    nameNe: 'कास्की',
    municipalities: [
      { name: 'Pokhara Metropolitan City', nameNe: 'पोखरा महानगरपालिका' },
      { name: 'Annapurna Rural Municipality', nameNe: 'अन्नपूर्ण गाउँपालिका' },
      { name: 'Machhapuchchhre Rural Municipality', nameNe: 'माछापुच्छ्रे गाउँपालिका' },
      { name: 'Madi Rural Municipality', nameNe: 'मादी गाउँपालिका' },
      { name: 'Rupa Rural Municipality', nameNe: 'रूपा गाउँपालिका' }
    ]
  },
  {
    name: 'Morang',
    nameNe: 'मोरङ',
    municipalities: [
      { name: 'Biratnagar Metropolitan City', nameNe: 'विराटनगर महानगरपालिका' },
      { name: 'Belbari Municipality', nameNe: 'बेलबारी नगरपालिका' },
      { name: 'Urlabari Municipality', nameNe: 'उर्लाबारी नगरपालिका' },
      { name: 'Pathari Shanishchare Municipality', nameNe: 'पथरी शनिश्चरे नगरपालिका' },
      { name: 'Sundar Haraicha Municipality', nameNe: 'सुन्दर हरैंचा नगरपालिका' },
      { name: 'Ratuwamai Municipality', nameNe: 'रतुवामाई नगरपालिका' },
      { name: 'Sunawarshi Municipality', nameNe: 'सुनवर्षी नगरपालिका' },
      { name: 'Letang Municipality', nameNe: 'लेटाङ नगरपालिका' },
      { name: 'Rangeli Municipality', nameNe: 'रंगेली नगरपालिका' }
    ]
  },
  {
    name: 'Jhapa',
    nameNe: 'झापा',
    municipalities: [
      { name: 'Mechinagar Municipality', nameNe: 'मेचीनगर नगरपालिका' },
      { name: 'Birtamod Municipality', nameNe: 'बिर्तामोड नगरपालिका' },
      { name: 'Damak Municipality', nameNe: 'दमक नगरपालिका' },
      { name: 'Bhadrapur Municipality', nameNe: 'भद्रपुर नगरपालिका' },
      { name: 'Arjundhara Municipality', nameNe: 'अर्जुनधारा नगरपालिका' },
      { name: 'Kankai Municipality', nameNe: 'कन्काई नगरपालिका' },
      { name: 'Shivasataksi Municipality', nameNe: 'शिवसताक्षी नगरपालिका' },
      { name: 'Gauradaha Municipality', nameNe: 'गौरादह नगरपालिका' }
    ]
  },
  {
    name: 'Rupandehi',
    nameNe: 'रुपन्देही',
    municipalities: [
      { name: 'Butwal Sub-Metropolitan City', nameNe: 'बुटवल उपमहानगरपालिका' },
      { name: 'Siddharthanagar Municipality', nameNe: 'सिद्धार्थनगर नगरपालिका' },
      { name: 'Lumbini Sanskritik Municipality', nameNe: 'लुम्बिनी सांस्कृतिक नगरपालिका' },
      { name: 'Tilottama Municipality', nameNe: 'तिलोत्तमा नगरपालिका' },
      { name: 'Devdaha Municipality', nameNe: 'देवदह नगरपालिका' },
      { name: 'Sainamaina Municipality', nameNe: 'सैनामैना नगरपालिका' }
    ]
  },
  {
    name: 'Banke',
    nameNe: 'बाँके',
    municipalities: [
      { name: 'Nepalgunj Sub-Metropolitan City', nameNe: 'नेपालगन्ज उपमहानगरपालिका' },
      { name: 'Kohalpur Municipality', nameNe: 'कोहलपुर नगरपालिका' },
      { name: 'Narainapur Rural Municipality', nameNe: 'नरैनापुर गाउँपालिका' },
      { name: 'Rapti Sonari Rural Municipality', nameNe: 'राप्ती सोनारी गाउँपालिका' },
      { name: 'Baijanath Rural Municipality', nameNe: 'बैजनाथ गाउँपालिका' },
      { name: 'Khajura Rural Municipality', nameNe: 'खजुरा गाउँपालिका' }
    ]
  },
  {
    name: 'Kailali',
    nameNe: 'कैलाली',
    municipalities: [
      { name: 'Dhangadhi Sub-Metropolitan City', nameNe: 'धनगढी उपमहानगरपालिका' },
      { name: 'Tikapur Municipality', nameNe: 'टीकापुर नगरपालिका' },
      { name: 'Ghodaghodi Municipality', nameNe: 'घोडाघोडी नगरपालिका' },
      { name: 'Lamki Chuha Municipality', nameNe: 'लम्कीचुहा नगरपालिका' },
      { name: 'Bhajani Municipality', nameNe: 'भजनी नगरपालिका' },
      { name: 'Godawari Municipality', nameNe: 'गोदावरी नगरपालिका' }
    ]
  },
  {
    name: 'Sunsari',
    nameNe: 'सुनसरी',
    municipalities: [
      { name: 'Itahari Sub-Metropolitan City', nameNe: 'इटहरी उपमहानगरपालिका' },
      { name: 'Dharan Sub-Metropolitan City', nameNe: 'धरान उपमहानगरपालिका' },
      { name: 'Inaruwa Municipality', nameNe: 'इनरुवा नगरपालिका' },
      { name: 'Duhabi Municipality', nameNe: 'दुहवी नगरपालिका' },
      { name: 'Ramdhuni Municipality', nameNe: 'रामधुनी नगरपालिका' },
      { name: 'Barahachhetra Municipality', nameNe: 'बराहक्षेत्र नगरपालिका' }
    ]
  },
  {
    name: 'Dhanusha',
    nameNe: 'धनुषा',
    municipalities: [
      { name: 'Janakpurdham Sub-Metropolitan City', nameNe: 'जनकपुरधाम उपमहानगरपालिका' },
      { name: 'Ganeshman Charnath Municipality', nameNe: 'गणेशमान चारनाथ नगरपालिका' },
      { name: 'Dhanushadham Municipality', nameNe: 'धनुषाधाम नगरपालिका' },
      { name: 'Mithila Municipality', nameNe: 'मिथिला नगरपालिका' },
      { name: 'Sabaila Municipality', nameNe: 'सबैला नगरपालिका' }
    ]
  },
  {
    name: 'Parsa',
    nameNe: 'पर्सा',
    municipalities: [
      { name: 'Birgunj Metropolitan City', nameNe: 'वीरगञ्ज महानगरपालिका' },
      { name: 'Bahudarmai Municipality', nameNe: 'बहुदरमाई नगरपालिका' },
      { name: 'Parsagadhi Municipality', nameNe: 'पर्सागढी नगरपालिका' },
      { name: 'Pokhariya Municipality', nameNe: 'पोखरिया नगरपालिका' }
    ]
  },
  {
    name: 'Makwanpur',
    nameNe: 'मकवानपुर',
    municipalities: [
      { name: 'Hetauda Sub-Metropolitan City', nameNe: 'हेटौंडा उपमहानगरपालिका' },
      { name: 'Thaha Municipality', nameNe: 'थाहा नगरपालिका' },
      { name: 'Bakaiya Rural Municipality', nameNe: 'बकैया गाउँपालिका' },
      { name: 'Manahari Rural Municipality', nameNe: 'मनहरी गाउँपालिका' }
    ]
  },
  {
    name: 'Kavrepalanchok',
    nameNe: 'काभ्रेपलाञ्चोक',
    municipalities: [
      { name: 'Dhulikhel Municipality', nameNe: 'धुलिखेल नगरपालिका' },
      { name: 'Banepa Municipality', nameNe: 'बनेपा नगरपालिका' },
      { name: 'Panauti Municipality', nameNe: 'पनौती नगरपालिका' },
      { name: 'Panchkhal Municipality', nameNe: 'पाँचखाल नगरपालिका' },
      { name: 'Namobuddha Municipality', nameNe: 'नमोबुद्ध नगरपालिका' },
      { name: 'Mandandeupur Municipality', nameNe: 'मण्डनदेउपुर नगरपालिका' }
    ]
  },
  {
    name: 'Dang',
    nameNe: 'दाङ',
    municipalities: [
      { name: 'Ghorahi Sub-Metropolitan City', nameNe: 'घोराही उपमहानगरपालिका' },
      { name: 'Tulsipur Sub-Metropolitan City', nameNe: 'तुलसीपुर उपमहानगरपालिका' },
      { name: 'Lamahi Municipality', nameNe: 'लमही नगरपालिका' },
      { name: 'Gadhawa Rural Municipality', nameNe: 'गढवा गाउँपालिका' }
    ]
  },
  {
    name: 'Surkhet',
    nameNe: 'सुर्खेत',
    municipalities: [
      { name: 'Birendranagar Municipality', nameNe: 'वीरेन्द्रनगर नगरपालिका' },
      { name: 'Bheri Ganga Municipality', nameNe: 'भेरीगंगा नगरपालिका' },
      { name: 'Gurbhakot Municipality', nameNe: 'गुर्भाकोट नगरपालिका' },
      { name: 'Panchapuri Municipality', nameNe: 'पञ्चपुरी नगरपालिका' }
    ]
  }
];

export const COMMON_DIAGNOSES = [
  'Chronic Kidney Disease Stage-V, HTN, DM-II',
  'Chronic Kidney Disease Stage-V, HTN',
  'Chronic Kidney Disease Stage-V, DM-II',
  'End Stage Renal Disease (ESRD)',
  'Acute Kidney Injury (AKI)',
  'Nephrotic Syndrome'
];
